import * as path from 'node:path';
import type { Rule } from '../types';

abstract class BaseJSTestRule implements Rule {
  abstract readonly extensions: string[];

  public getCandidates(source: string): string[] {
    const baseDir = path.dirname(source);
    const base = path.basename(source, path.extname(source));

    if (base.endsWith('.test')) {
      return this.findSources(baseDir, base.slice(0, -'.test'.length));
    }

    return this.findTests(baseDir, base);
  }

  private findSources(baseDir: string, sourceBase: string): string[] {
    const search: string[] = [];
    const dirs = new Set<string>();

    if (path.basename(baseDir) === '__tests__') {
      dirs.add(path.dirname(baseDir));
    } else {
      const fromTests = baseDir.replace(/(^|\/)tests($|\/)/, '$1src$2');

      if (fromTests !== baseDir) {
        dirs.add(fromTests);
        dirs.add(fromTests.replace(/(^|\/)src($|\/)/, '$1lib$2'));
      } else {
        dirs.add(baseDir);
      }
    }

    for (const dir of dirs) {
      for (const ext of this.extensions) {
        search.push(path.join(dir, `${sourceBase}${ext}`));
      }
    }

    return search;
  }

  private findTests(baseDir: string, base: string): string[] {
    const search: string[] = [];

    for (const ext of this.extensions) {
      search.push(path.join(baseDir, `${base}.test${ext}`));
      search.push(path.join(baseDir, '__tests__', `${base}.test${ext}`));
    }

    const testDir = baseDir.replace(/(^|\/)(?:src|lib)($|\/)/, '$1tests$2');

    if (testDir !== baseDir) {
      for (const ext of this.extensions) {
        search.push(path.join(testDir, `${base}.test${ext}`));
      }
    }

    return search;
  }
}

export class JSTestRule extends BaseJSTestRule {
  readonly extensions = ['.js'];
}

export class TSTestRule extends BaseJSTestRule {
  readonly extensions = ['.ts', '.tsx'];
}
