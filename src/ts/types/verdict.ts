// types/verdicts.ts
export type VerdictType = 'DUPLICATE' | 'NOT_DUPLICATE' | 'UNSURE';

export interface UserVerdict {
  pairId: string;
  verdict: VerdictType;
  timestamp: string;
}
