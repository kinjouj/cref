import * as path from 'node:path';
import type { Rule } from '../types';

abstract class BaseFileRule implements Rule {
  abstract readonly extensions: string[];

  public getCandidates(source: string): string[] {
    const ext = path.extname(source);
    const baseDir = path.dirname(source);
    const base = path.basename(source, ext);

    if (base.endsWith('.test')) {
      return this.findSources(baseDir, base.slice(0, -'.test'.length), ext);
    }

    return this.findTests(baseDir, base, ext);
  }

  private findSources(baseDir: string, sourceBase: string, ext: string): string[] {
    const search: string[] = [];
    const dirs = new Set<string>();
    const fromTests = baseDir.replace(/(^|\/)tests($|\/)/, '$1src$2');

    if (fromTests !== baseDir) {
      dirs.add(fromTests);
      dirs.add(fromTests.replace(/(^|\/)src($|\/)/, '$1lib$2'));
    } else {
      dirs.add(baseDir);
    }

    for (const dir of dirs) {
      search.push(path.join(dir, `${sourceBase}${ext}`));
    }

    return search;
  }

  private findTests(baseDir: string, base: string, ext: string): string[] {
    const search: string[] = [];
    search.push(path.join(baseDir, `${base}.test${ext}`));

    const testDir = baseDir.replace(/(^|\/)(?:src|lib)($|\/)/, '$1tests$2');

    if (testDir !== baseDir) {
      search.push(path.join(testDir, `${base}.test${ext}`));
    }

    return search;
  }
}

export class JavascriptRule extends BaseFileRule {
  readonly extensions = ['.js'];
}

export class TypescriptRule extends BaseFileRule {
  readonly extensions = ['.ts', '.tsx'];
}
