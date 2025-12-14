const STORAGE_KEY = 'trpg_cleared_endings';

// LocalStorageからエンディングを取得
export function getClearedEndingsFromLocal(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
}

// LocalStorageにエンディングを保存
export function saveEndingToLocal(endingId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getClearedEndingsFromLocal();
    if (!current.includes(endingId)) {
      current.push(endingId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    }
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
}

// DBからエンディングを取得
export async function getClearedEndingsFromDB(): Promise<string[]> {
  try {
    const response = await fetch('/api/endings');
    if (!response.ok) {
      throw new Error('Failed to fetch endings');
    }
    const data = await response.json();
    return data.endings || [];
  } catch (error) {
    console.error('Error fetching endings from DB:', error);
    return [];
  }
}

// DBにエンディングを保存
export async function saveEndingToDB(endingId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/endings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endingId }),
    });

    if (!response.ok) {
      throw new Error('Failed to save ending');
    }

    return true;
  } catch (error) {
    console.error('Error saving ending to DB:', error);
    return false;
  }
}

// LocalStorageのデータをDBに移行
export async function migrateLocalEndingsToDB(): Promise<void> {
  const localEndings = getClearedEndingsFromLocal();
  if (localEndings.length === 0) return;

  try {
    for (const endingId of localEndings) {
      await saveEndingToDB(endingId);
    }
    console.log(`Migrated ${localEndings.length} endings to DB`);
  } catch (error) {
    console.error('Error migrating endings to DB:', error);
  }
}

// 統合：ログイン状態に応じて適切な方法でエンディングを取得
export async function getClearedEndings(isLoggedIn: boolean): Promise<string[]> {
  if (isLoggedIn) {
    return await getClearedEndingsFromDB();
  }
  return getClearedEndingsFromLocal();
}

// 統合：ログイン状態に応じて適切な方法でエンディングを保存
export async function saveEndingToStorage(endingId: string, isLoggedIn: boolean): Promise<void> {
  if (isLoggedIn) {
    await saveEndingToDB(endingId);
  } else {
    saveEndingToLocal(endingId);
  }
}

// 完了率を計算（既存の関数を維持）
export function getCompletionRate(clearedEndings: string[], totalEndings: number): number {
  return totalEndings > 0 ? Math.round((clearedEndings.length / totalEndings) * 100) : 0;
}
