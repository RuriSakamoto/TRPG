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

export type DiceFormula = {
  dice: string; // "3D6", "2D6+6" など
  multiplier?: number; // 7版では×5
};

export const STAT_FORMULAS: Record<keyof Pick<CharacterStats, 'STR' | 'CON' | 'POW' | 'DEX' | 'APP' | 'SIZ' | 'INT' | 'EDU' | 'LUK'>, DiceFormula> = {
  STR: { dice: '3D6', multiplier: 5 },
  CON: { dice: '3D6', multiplier: 5 },
  POW: { dice: '3D6', multiplier: 5 },
  DEX: { dice: '3D6', multiplier: 5 },
  APP: { dice: '3D6', multiplier: 5 },
  SIZ: { dice: '2D6+6', multiplier: 5 },
  INT: { dice: '2D6+6', multiplier: 5 },
  EDU: { dice: '2D6+6', multiplier: 5 },
  LUK: { dice: '3D6', multiplier: 5 },
};
