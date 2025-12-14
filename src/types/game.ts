export type Attributes = {
  STR: number; // 筋力
  DEX: number; // 敏捷
  POW: number; // 精神力 (SAN値のベース)
  APP: number; // 外見 (顔の良さ)
};

export type Skills = {
  observation: number; // 目星
  listening: number;   // 聞き耳
  persuasion: number;  // 言いくるめ/説得
  psychology: number;  // 心理学
  passion: number;     // 情熱 (推し活パワー)
};

export type GameStatus = {
  hp: number;
  san: number;       // メンタル/尊さ耐久値
  affection: number; // レイシオからの好感度
  otakuLevel: number; // オタク度（解釈の深さ）
  items: string[];
  turn: number;      // 経過ターン（第1章で使用）
  clearedEndings: string[]; // 到達したエンディングID
  loopCount: number;        // 周回数
  
  // キャラクター情報
  playerName: string;
  attributes: Attributes;
  skills: Skills;
};

export type RollResult = 'critical' | 'success' | 'failure' | 'fumble';

export type Choice = {
  text: string;
  nextSceneId: string;
  condition?: (status: GameStatus) => boolean; // 出現条件
  action?: (status: GameStatus) => Partial<GameStatus>; // ステータス変化
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
  backgroundImage?: string; // 背景画像のパス (例: '/bg/office.jpg')
  characterImage?: string;  // 立ち絵画像のパス (例: '/chara/ratio_angry.png')
  choices: Choice[];
};
