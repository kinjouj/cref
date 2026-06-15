const vscode = require("vscode");
const path = require("path");
const fs = require("fs");

function findSpecPaths(document) {
  const paths = [];

  for (let i = 0; i < Math.min(document.lineCount, 10); i++) {
    const line = document.lineAt(i).text;
    const match = line.match(/^[\s#\/*]+@([\S]+)/);

    if (match) paths.push(match[1]);
  }

  return paths;
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

    const specPaths = findSpecPaths(editor.document);

    if (!specPaths.length) {
      vscode.window.showWarningMessage('No spec comment found. Add "# @path/to/file" near the top of the file.');
      return;
    }

    const folders = vscode.workspace.workspaceFolders;

    if (!folders?.length) {
      vscode.window.showErrorMessage("No workspace folder open.");
      return;
    }

    let selectedPath;

    if (specPaths.length === 1) {
      selectedPath = specPaths[0];
    } else {
      selectedPath = await vscode.window.showQuickPick(specPaths, { placeHolder: "Jump to..." });

      if (!selectedPath) return;
    }

    const absolute = resolveSpecFile(selectedPath, folders);

    if (!absolute) {
      vscode.window.showWarningMessage(`File not found: ${selectedPath}`);
      return;
    }

    const doc = await vscode.workspace.openTextDocument(absolute);
    await vscode.window.showTextDocument(doc);
  });

  context.subscriptions.push(cmd);
}

function deactivate() {}

module.exports = { activate, deactivate };
