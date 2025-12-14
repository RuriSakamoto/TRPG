import { Scene } from '../../types/game';
import { chapter1 } from './chapter1';
import { chapter2 } from './chapter2';
import { chapter3 } from './chapter3';

// このシナリオ固有のプロローグ
const prologue: Scene[] = [
  {
    id: 'start',
    title: 'プロローグ',
    description: 'アベンチュリンの秘密の推し活',
    text: '【プロローグ】\n\nスターピースカンパニー、戦略投資部。\n高級な調度品に囲まれた執務室で、アベンチュリンは一人、不敵な笑みを浮かべていた。\n\n「さて、教授は学会で不在。帰ってくるまであと数時間…」\n\n彼はデスクの下から、厳重にロックされたアタッシュケースを取り出した。\n中に入っているのは、機密書類ではない。\n\n――ベリタス・レイシオの非公式グッズ、盗撮写真、そして自作の祭壇セットである。',
    choices: [
      { text: 'ゲームを開始する', nextScene: 'chap1_intro' }
    ]
  }
];

// 全てを結合してエクスポート
export const aventurineStory: Scene[] = [
  ...prologue,
  ...chapter1,
  ...chapter2,
  ...chapter3
];
