// src/types/game.ts

export type GameStatus = {
  hp: number;
  san: number;
  affection: number;
  otakuLevel: number;
  items: string[];
  skills: string[]; // ★追加: 習得している技能のリスト
  turn: number;
  clearedEndings: string[];
  loopCount: number;
};

// ★追加: 利用可能な技能の定数リスト
export const AVAILABLE_SKILLS = [
  '目星', '聞き耳', '図書館', '隠れる', '忍び歩き',
  '心理学', '説得', '言いくるめ', 'オカルト', 'コンピューター', '情熱'
];

export type RollResult = 'critical' | 'success' | 'failure' | 'fumble';

export type Choice = {
  text: string;
  nextSceneId: string;
  condition?: (status: GameStatus) => boolean;
  action?: (status: GameStatus) => Partial<GameStatus>;
  skillCheck?: {
    skillName: string;
    targetValue: number;
    successSceneId: string;
    failureSceneId: string;
  };
};

export type Scene = {
  id: string;
  text: string;
  backgroundImage?: string;
  characterImage?: string;
  choices: Choice[];
};
