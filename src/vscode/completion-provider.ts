import * as fs from 'node:fs';
import * as path from 'node:path';
import * as vscode from 'vscode';

const KIND_FOLDER = vscode.CompletionItemKind.Folder;
const KIND_FILE   = vscode.CompletionItemKind.File;

export class CrefCompletionProvider implements vscode.CompletionItemProvider {
  public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): vscode.CompletionItem[] {
    const line = document.lineAt(position).text.slice(0, position.character);
    const [, , prefix, partial] = /^(\s*(?:#|\/\/)\s+@)((?:[^\s/]+\/)*)([^\s/]*)$/.exec(line) ?? [];

    if (prefix === undefined) {
      return [];
    }

    const folder = vscode.workspace.getWorkspaceFolder(document.uri);

    if (!folder) {
      return [];
    }

    let entries: fs.Dirent[];

    try {
      entries = fs.readdirSync(path.join(folder.uri.fsPath, prefix), { withFileTypes: true });
    } catch {
      return [];
    }

    return entries.filter((e) => !e.name.startsWith('.')).map((e) => {
      const label = `${prefix}${e.name}`;
      const item = new vscode.CompletionItem(label, e.isDirectory() ? KIND_FOLDER : KIND_FILE);
      item.range = new vscode.Range(position.translate(0, -(prefix.length + (partial ?? '').length)), position);

      if (e.isDirectory()) {
        item.insertText = `${label}/`;
        item.command = { command: 'editor.action.triggerSuggest', title: 'Trigger suggest' };
      }

      return item;
    });
  }
}
