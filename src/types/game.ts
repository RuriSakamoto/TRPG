export type GameStatus = {
  hp: number;
  san: number;       // メンタル/尊さ耐久値
  affection: number; // レイシオからの好感度
  otakuLevel: number; // オタク度（解釈の深さ）
  items: string[];
  turn: number;      // 経過ターン（第1章で使用）
  clearedEndings: string[]; // 到達したエンディングID
  loopCount: number;        // 周回数
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
  backgroundImage?: string; // 将来的な拡張用
  choices: Choice[];
};
