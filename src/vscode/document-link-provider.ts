import * as fs from 'node:fs';
import * as path from 'node:path';
import * as vscode from 'vscode';
import { parseCommentAnnotations } from './annotation';

export class CrefDocumentLinkProvider implements vscode.DocumentLinkProvider {
  public provideDocumentLinks(document: vscode.TextDocument, _token: vscode.CancellationToken): vscode.DocumentLink[] {
    const links: vscode.DocumentLink[] = [];
    const folder = vscode.workspace.getWorkspaceFolder(document.uri);

    if (!folder) {
      return links;
    }

    for (const annotation of parseCommentAnnotations(document)) {
      const absolute = path.join(folder.uri.fsPath, annotation.targetPath);

      if (fs.existsSync(absolute)) {
        const { line, column, targetPath } = annotation;
        const link = new vscode.DocumentLink(
          new vscode.Range(new vscode.Position(line, column), new vscode.Position(line, column + 1 + targetPath.length)),
          vscode.Uri.file(absolute)
        );

        links.push(link);
      }
    }

    return links;
  }
}
