import * as vscode from 'vscode';
import { CrefJumpService } from './vscode/jump-service';
import { CrefDocumentLinkProvider } from './vscode/document-link-provider';
import { CrefCompletionProvider } from './vscode/completion-provider';
import type { Rule } from './types';

function isRule(value: unknown): value is new () => Rule {
  return typeof value === 'function';
}

function activate(context: vscode.ExtensionContext): void {
  const jumper = new CrefJumpService();
  const ruleModules = import.meta.glob<Record<string, unknown>>('./rules/*-rule.ts', { eager: true });
  const allRules = Object.values(ruleModules).flatMap((m) => Object.values(m)).filter(isRule).map((Klass) => new Klass());

  for (const rule of allRules) {
    jumper.addRule(rule);
  }

  const selectors = allRules.flatMap((rule) => rule.extensions).map((ext) => ({ scheme: 'file', pattern: `**/*${ext}` }));

  const cmd = vscode.commands.registerCommand('cref.jump', async () => {
    const editor = vscode.window.activeTextEditor ?? null;
    await jumper.jump(editor);
  });

  const linkProvider = vscode.languages.registerDocumentLinkProvider(selectors, new CrefDocumentLinkProvider());
  const completionProvider = vscode.languages.registerCompletionItemProvider(selectors, new CrefCompletionProvider(), '@');
  context.subscriptions.push(cmd, linkProvider, completionProvider);
}

function deactivate(): void {
  // noop
}

module.exports = { activate, deactivate };
