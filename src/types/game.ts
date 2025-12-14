// src/types/game.ts

export type GameStatus = {
  // CoC能力値（CharacterCreatorから引き継ぎ）
  STR?: number;
  CON?: number;
  POW?: number;
  DEX?: number;
  APP?: number;
  SIZ?: number;
  INT?: number;
  EDU?: number;
  LUK?: number;
  
  // 派生値
  hp: number;
  san: number;
  mp?: number;
  
  // オリジナルステータス
  affection: number;
  otakuLevel: number;
  
  // 技能値（技能名: 成功率%）
  skillValues: Record<string, number>;
  
  items: string[];
  skills: string[]; // 習得している技能名のリスト
  turn: number;
  clearedEndings: string[];
  loopCount: number;
};

// 利用可能な技能の定数リスト
export const AVAILABLE_SKILLS = [
  '目星', '聞き耳', '図書館', '隠れる', '忍び歩き',
  '心理学', '説得', '言いくるめ', 'オカルト', 'コンピューター', '芸術', '幸運', '情熱'
] as const;

// 技能の初期値計算式（能力値×倍率）
export const SKILL_FORMULAS: Record<string, { stat: keyof GameStatus; multiplier: number }> = {
  '目星': { stat: 'POW', multiplier: 5 },
  '聞き耳': { stat: 'POW', multiplier: 5 },
  '図書館': { stat: 'INT', multiplier: 5 },
  '隠れる': { stat: 'DEX', multiplier: 5 },
  '忍び歩き': { stat: 'DEX', multiplier: 5 },
  '心理学': { stat: 'INT', multiplier: 5 },
  '説得': { stat: 'INT', multiplier: 5 },
  '言いくるめ': { stat: 'APP', multiplier: 5 },
  'オカルト': { stat: 'INT', multiplier: 5 },
  'コンピューター': { stat: 'INT', multiplier: 5 },
  '芸術': { stat: 'POW', multiplier: 5 },
  '幸運': { stat: 'LUK', multiplier: 1 }, // 幸運はLUK値そのまま
  '情熱': { stat: 'POW', multiplier: 10 }, // オリジナル技能
};

// 能力値から技能値を初期化する関数
export const initializeSkillValues = (status?: Partial<GameStatus>): Record<string, number> => {
  const skillValues: Record<string, number> = {};
  
  if (!status) {
    // statusが未定義の場合はデフォルト値
    AVAILABLE_SKILLS.forEach(skill => {
      skillValues[skill] = 50;
    });
    return skillValues;
  }
  
  Object.entries(SKILL_FORMULAS).forEach(([skillName, formula]) => {
    const statValue = status[formula.stat] as number | undefined;
    if (statValue !== undefined) {
      skillValues[skillName] = statValue * formula.multiplier;
    } else {
      // 能力値が未設定の場合はデフォルト値
      skillValues[skillName] = 50; // 基本成功率50%
    }
  });
  
  // オタク度による「情熱」技能の補正
  if (status.otakuLevel !== undefined && status.POW !== undefined) {
    skillValues['情熱'] = status.POW * 10 + status.otakuLevel * 5;
  }
  
  return skillValues;
};

// エンディング情報の型定義
export type EndingInfo = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

// 全エンディングの定義（配列形式）
export const ENDINGS: EndingInfo[] = [
  {
    id: 'true_end',
    title: 'True End',
    description: '究極の解釈一致',
    icon: '👑',
  },
  {
    id: 'ceo_end',
    title: 'CEO End',
    description: '資本主義の勝利',
    icon: '💰',
  },
  {
    id: 'secret_end',
    title: 'Secret End',
    description: '秘密の補習',
    icon: '💕',
  },
  {
    id: 'normal_end',
    title: 'Normal End',
    description: '妥協と供給',
    icon: '⭐',
  },
  {
    id: 'bad_end',
    title: 'Bad End',
    description: '虚無',
    icon: '💔',
  },
];

// シーン型
export interface Scene {
  id: string;
  title: string;
  description: string;
  text: string;
  backgroundImage?: string;
  characterImage?: string;
  choices: Choice[];
  isEnding?: boolean;
  endingId?: string;
}

// 選択肢型
export interface Choice {
  text: string;
  nextScene?: string;
  condition?: (status: GameStatus) => boolean;
  effects?: {
    hp?: number;
    san?: number;
    affection?: number;
    otakuLevel?: number;
    addItem?: string;
    removeItem?: string;
    addSkill?: string;
  };
  action?: (status: GameStatus) => Partial<GameStatus>; // 追加：動的なステータス変更用
  result?: string;
  skillCheck?: {
    skillName: string;
    targetValue?: number; // オプショナルに変更
    onSuccess?: string;
    onFailure?: string;
  };
}

// ロール結果型
export interface RollResult {
  skillName: string;
  roll: number;
  skillValue: number;
  success: boolean;
  critical: boolean;
  fumble: boolean;
}
