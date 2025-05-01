// utils/verdictHandler.ts
export type VerdictType = 'DUPLICATE' | 'NOT_DUPLICATE' | 'UNSURE';

export interface UserVerdict {
  pairId: string;
  verdict: VerdictType;
  timestamp: string;
}

const STORAGE_KEY = 'user_verdicts';

export const saveVerdict = (
  queryId: string,
  matchedId: string,
  verdict: VerdictType,
): void => {
  const newVerdict: UserVerdict = {
    pairId: `${queryId}-${matchedId}`,
    verdict,
    timestamp: new Date().toISOString(),
  };

  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    const verdicts: UserVerdict[] = storedData ? JSON.parse(storedData) : [];

    // Update existing verdict or add new one
    const index = verdicts.findIndex((v) => v.pairId === newVerdict.pairId);
    if (index >= 0) {
      verdicts[index] = newVerdict;
    } else {
      verdicts.push(newVerdict);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(verdicts));
  } catch (error) {
    console.error('Error saving verdict:', error);
  }
};

export const getVerdict = (
  queryId: string,
  matchedId: string,
): VerdictType | null => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) return null;

    const verdicts: UserVerdict[] = JSON.parse(storedData);
    const verdict = verdicts.find(
      (v) => v.pairId === `${queryId}-${matchedId}`,
    );
    return verdict ? verdict.verdict : null;
  } catch (error) {
    console.error('Error getting verdict:', error);
    return null;
  }
};

export const getAllVerdicts = (): UserVerdict[] => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error('Error getting all verdicts:', error);
    return [];
  }
};
