// src/lib/storage.ts

const STORAGE_KEY = 'trpg_cleared_endings';

/**
 * エンディングIDをLocalStorageに保存
 */
export const saveEndingToStorage = (endingId: string): void => {
  if (typeof window === 'undefined') return;
  
  const cleared = getClearedEndings();
  if (!cleared.includes(endingId)) {
    cleared.push(endingId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleared));
  }
};

/**
 * LocalStorageからクリア済みエンディングIDの配列を取得
 */
export const getClearedEndings = (): string[] => {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

/**
 * 全てのエンディング記録をクリア
 */
export const clearAllEndings = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * エンディング達成率を計算（0-100%）
 */
export const getCompletionRate = (): number => {
  const cleared = getClearedEndings();
  const total = 5; // 全エンディング数
  return Math.round((cleared.length / total) * 100);
};
