import * as fs from 'node:fs';
import * as path from 'node:path';
import * as vscode from 'vscode';
import { parseCommentAnnotations } from './annotation';
import type { Rule } from '../types';

export class CrefJumpService {
  private rules: Partial<Record<string, Rule>> = {};

  addRule(rule: Rule): void {
    for (const ext of rule.extensions) {
      this.rules[ext] = rule;
    }
  }

  async jump(editor: vscode.TextEditor): Promise<void> {
    const folder = vscode.workspace.getWorkspaceFolder(editor.document.uri);

    if (!folder) {
      return;
    }

    let targetPath: string | null;
    const specPaths = parseCommentAnnotations(editor.document).map((annotation) => annotation.targetPath);

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
        vscode.window.showWarningMessage(`Test file not found\n\n${result.search.sort().join('\n')}`, { modal: true });
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
        // noop
      }
    }

    return { found: null, search };
  }
}
