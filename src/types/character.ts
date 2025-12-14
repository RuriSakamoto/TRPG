export type CharacterStats = {
  // 基本能力値（7版は5倍表記）
  STR: number;
  CON: number;
  POW: number;
  DEX: number;
  APP: number;
  SIZ: number;
  INT: number;
  EDU: number;
  LUK: number;
  
  // 派生値
  SAN: number;
  HP: number;
  MP: number;
  DB: string;
  BUILD: number;
  MOV: number;
  
  // 技能ポイント
  occupationPoints: number;
  interestPoints: number;
};

// ダイス式を文字列形式に変更
export const STAT_FORMULAS: Record<keyof Pick<CharacterStats, 'STR' | 'CON' | 'POW' | 'DEX' | 'APP' | 'SIZ' | 'INT' | 'EDU' | 'LUK'>, string> = {
  STR: '3D6*5',
  CON: '3D6*5',
  POW: '3D6*5',
  DEX: '3D6*5',
  APP: '3D6*5',
  SIZ: '(2D6+6)*5',
  INT: '(2D6+6)*5',
  EDU: '(2D6+6)*5',
  LUK: '3D6*5',
};
