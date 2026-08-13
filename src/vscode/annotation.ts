import type * as vscode from 'vscode';

type CommentAnnotation = {
  line: number
  column: number
  targetPath: string
};

const ANNOTATION_PATTERN = /^\s*(?:#|\/\/)\s+@(\S+)/;

export function parseCommentAnnotations(document: vscode.TextDocument): CommentAnnotation[] {
  const annotations: CommentAnnotation[] = [];
  const max = Math.min(document.lineCount, 10);

  for (let i = 0; i < max; i++) {
    const text = document.lineAt(i).text;
    const match = ANNOTATION_PATTERN.exec(text);

    if (match) {
      annotations.push({ line: i, column: match.index + match[0].indexOf('@'), targetPath: match[1] });
    }
  }

  return annotations;
}
