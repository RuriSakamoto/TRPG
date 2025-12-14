import { Scene } from '../types/game';

// 遊びたいシナリオのバンドルファイルをインポート
import { aventurineStory } from './scenarios/aventurine_bundle';
// import { anotherStory } from './scenarios/another_bundle'; // 他のシナリオを作ったらここに追加

// 現在アクティブなシナリオとしてエクスポート
export const scenarioData: Scene[] = aventurineStory;
