export type GameStatus = {
  hp: number;
  san: number;
  affection: number;
  otakuLevel: number;
  items: string[];
  turn: number;
  clearedEndings: string[];
  loopCount: number;
  // 新規追加ステータス
  str: number;
  dex: number;
  pow: number;
  app: number;
};

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
  backgroundImage?: string; // 背景画像のパス (例: '/bg/office.jpg')
  characterImage?: string;  // 立ち絵画像のパス (例: '/chara/ratio_angry.png')
  choices: Choice[];
};
