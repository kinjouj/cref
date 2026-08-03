import * as fs from 'node:fs';
import * as path from 'node:path';
import * as vscode from 'vscode';

interface Rule {
  getCandidates(relPath: string): string[]
}

class RubyTestRule implements Rule {
  getCandidates(relPath: string): string[] {
    const base = relPath.replace(/^lib\//, 'spec/').replace(/\.rb$/, '');
    return [`${base}_spec.rb`];
  }
}

class JSTestRule implements Rule {
  constructor(private exts: string[]) {
  }

  public getCandidates(relPath: string): string[] {
    const dir = path.dirname(relPath);
    const base = path.basename(relPath, path.extname(relPath));
    const search: string[] = [];

    for (const ext of this.exts) {
      search.push(path.join(dir, `${base}.test${ext}`));
      search.push(path.join(dir, '__tests__', `${base}.test${ext}`));
    }

    const testDir = dir.replace('src/', 'tests/').replace('lib/', 'tests/');

    if (testDir !== dir) {
      for (const ext of this.exts) {
        search.push(path.join(testDir, `${base}.test${ext}`));
      }
    }

    return search;
  }
}

class CrefJumpService {
  private rules: Partial<Record<string, Rule>> = {};

  addRule(exts: string[], rule: Rule): void {
    for (const ext of exts) {
      this.rules[ext] = rule;
    }
  }

  async jump(editor: vscode.TextEditor): Promise<void> {
    const folder = vscode.workspace.getWorkspaceFolder(editor.document.uri);

    if (!folder) {
      return;
    }

    let targetPath: string | null;
    const specPaths = this.findCommentPaths(editor.document);

    if (specPaths.length > 0) {
      const selected = specPaths.length === 1 ? specPaths[0] : await vscode.window.showQuickPick(specPaths);

      if (selected === undefined) {
        return;
      }

      const absolute = path.join(folder.uri.fsPath, selected);
      targetPath = fs.existsSync(absolute) ? absolute : null;

      if (targetPath === null) {
        vscode.window.showWarningMessage(`File not found: ${selected}`);
        return;
      }
    } else {
      const result = this.findByRule(editor.document, folder);
      targetPath = result.found;

      if (targetPath === null) {
        vscode.window.showWarningMessage(`Test file not found\n\n${result.search.sort().join('\n\n')}`);
        return;
      }
    }

    if (targetPath) {
      const doc = await vscode.workspace.openTextDocument(targetPath);
      await vscode.window.showTextDocument(doc);
    }
  }

  private findByRule(document: vscode.TextDocument, folder: vscode.WorkspaceFolder): { found: string | null, search: string[] } {
    const filePath = document.uri.fsPath;
    const rule = this.rules[path.extname((filePath))];

    if (!rule) {
      return { found: null, search: [] };
    }

    const search = rule.getCandidates(path.relative(folder.uri.fsPath, filePath));

    for (const candidate of search) {
      const absolute = path.join(folder.uri.fsPath, candidate);

      try {
        const stat = fs.statSync(absolute);

        if (stat.isFile()) {
          return { found: absolute, search: [] };
        }
      } catch {
        continue;
      }
    }

    return { found: null, search };
  }

  private findCommentPaths(document: vscode.TextDocument): string[] {
    const paths: string[] = [];
    const max = Math.min(document.lineCount, 10);

    for (let i = 0; i < max; i++) {
      const match = /^\s*(?:#|\/\/|\*|\/\*)\s*@(.+)/.exec(document.lineAt(i).text);

      if (match) {
        paths.push(match[1].trim());
      }
    }

    return paths;
  }
}

function activate(context: vscode.ExtensionContext): void {
  const jumper = new CrefJumpService();
  jumper.addRule(['.rb'], new RubyTestRule());
  jumper.addRule(['.js'], new JSTestRule(['.js']));
  jumper.addRule(['.ts', '.tsx'], new JSTestRule(['.ts', '.tsx']));

  const cmd = vscode.commands.registerCommand('cref.jump', async () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      return;
    }

    await jumper.jump(editor);
  });

  context.subscriptions.push(cmd);
}

function deactivate(): void {
  // noop
}

module.exports = { activate, deactivate };
