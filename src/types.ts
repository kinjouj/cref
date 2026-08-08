export interface Rule {
  extensions: string[]
  getCandidates(source: string): string[]
}
