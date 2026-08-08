import * as vscode from 'vscode';
import { CrefJumpService } from './vscode/jump-service';
import { CrefDocumentLinkProvider } from './vscode/document-link-provider';
import type { Rule } from './types';

function isRuleClass(value: unknown): value is new () => Rule {
  return typeof value === 'function';
}

function activate(context: vscode.ExtensionContext): void {
  const jumper = new CrefJumpService();
  const ruleModules = import.meta.glob<Record<string, unknown>>('./rules/*-test-rule.ts', { eager: true });
  const allRules = Object.values(ruleModules).flatMap((m) => Object.values(m)).filter(isRuleClass).map((Klass) => new Klass());

  for (const rule of allRules) {
    jumper.addRule(rule);
  }

  const cmd = vscode.commands.registerCommand('cref.jump', async () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      return;
    }

    await jumper.jump(editor);
  });

  const linkProvider = vscode.languages.registerDocumentLinkProvider(
    allRules.flatMap((rule) => rule.extensions).map((ext) => ({ scheme: 'file', pattern: `**/*${ext}` })),
    new CrefDocumentLinkProvider()
  );

  context.subscriptions.push(cmd, linkProvider);
}

function deactivate(): void {
  // noop
}

module.exports = { activate, deactivate };
