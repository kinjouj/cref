const vscode = require("vscode");
const path = require("path");
const fs = require("fs");

const SPEC_COMMENT_RE = /^[\s#\/*]+@([\S]+)/;

function findSpecPath(document) {
  for (let i = 0; i < Math.min(document.lineCount, 30); i++) {
    const line = document.lineAt(i).text;
    const match = line.match(SPEC_COMMENT_RE);

    if (match) return match[1];
  }

  return null;
}

function resolveSpecFile(specPath, workspaceFolders) {
  for (const folder of workspaceFolders) {
    const absolute = path.join(folder.uri.fsPath, specPath);

    if (fs.existsSync(absolute)) return absolute;
  }

  return null;
}

function activate(context) {
  const cmd = vscode.commands.registerCommand("cref.jump", async () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) return;

    const specPath = findSpecPath(editor.document);

    if (!specPath) {
      vscode.window.showWarningMessage('No spec comment found. Add "# @path/to/file" near the top of the file.');
      return;
    }

    const folders = vscode.workspace.workspaceFolders;

    if (!folders?.length) {
      vscode.window.showErrorMessage("No workspace folder open.");
      return;
    }

    const absolute = resolveSpecFile(specPath, folders);

    if (!absolute) {
      vscode.window.showWarningMessage(`File not found: ${specPath}`);
      return;
    }

    const doc = await vscode.workspace.openTextDocument(absolute);
    await vscode.window.showTextDocument(doc);
  });

  context.subscriptions.push(cmd);
}

function deactivate() {}

module.exports = { activate, deactivate };
