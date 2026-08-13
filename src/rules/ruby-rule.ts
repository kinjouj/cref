import type { Rule } from '../types';

export class RubyFileRule implements Rule {
  readonly extensions = ['.rb'];

  getCandidates(source: string): string[] {
    if (/(^|\/)spec\//.test(source) && source.endsWith('_spec.rb')) {
      const sourcePath = source.replace(/(^|\/)spec\//, '$1lib/').replace(/_spec\.rb$/, '.rb');

      return [sourcePath];
    }

    const base = source.replace(/(^|\/)lib\//, '$1spec/').replace(/\.rb$/, '');
    return [`${base}_spec.rb`];
  }
}
