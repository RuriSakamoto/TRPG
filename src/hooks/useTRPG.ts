'use client';

import { useState } from 'react';
import { GameStatus, Scene, Choice, RollResult } from '../types/game';
import { scenarioData } from '../data/scenario';

export const useTRPG = () => {
  const [status, setStatus] = useState<GameStatus>({
    hp: 10,
    san: 60,
    affection: 0,
    otakuLevel: 0,
    items: [],
    turn: 0,
    clearedEndings: [],
    loopCount: 1,
  });

  const [currentSceneId, setCurrentSceneId] = useState<string>('start');
  const [logs, setLogs] = useState<string[]>(['ゲーム開始']);

  const currentScene = scenarioData.find(s => s.id === currentSceneId);

  // 日本語変換用の辞書
  const resultText: Record<RollResult, string> = {
    critical: 'クリティカル！',
    success: '成功',
    failure: '失敗',
    fumble: 'ファンブル！'
  };

  const rollDice = (target: number): { result: RollResult; value: number } => {
    const value = Math.floor(Math.random() * 100) + 1;
    let result: RollResult = 'failure';

    if (value <= 5) result = 'critical';
    else if (value >= 96) result = 'fumble';
    else if (value <= target) result = 'success';

    return { result, value };
  };

  // エンディング到達時のDB送信処理
  const reachEnding = async (endingId: string) => {
    try {
      await fetch('/api/endings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endingId }),
      });
      console.log('エンディング到達数を記録しました');
    } catch (err) {
      console.error('通信エラー:', err);
    }
  };

  const handleChoice = (choice: Choice) => {
    // 1. 技能判定がある場合
    if (choice.skillCheck) {
      let { skillName, targetValue, successSceneId, failureSceneId } = choice.skillCheck;
      
      // オタク度による補正
      if (skillName === '情熱' || skillName === '言いくるめ') {
        targetValue += status.otakuLevel * 5;
      }

      const { result, value } = rollDice(targetValue);
      
      // ログ出力
      const logText = `判定: ${skillName} (${targetValue}%) → 出目:${value} [${resultText[result]}]`;
      setLogs(prev => [...prev, logText]);

      if (result === 'success' || result === 'critical') {
        setCurrentSceneId(successSceneId);
      } else {
        setCurrentSceneId(failureSceneId);
      }
      return;
    }

    // 2. 通常の選択肢（ステータス変動など）
    if (choice.action) {
      const updates = choice.action(status);
      
      // エンディング到達判定（簡易ロジック）
      // シナリオデータ側で clearedEndings を更新している場合、DBにも送信する
      if (updates.clearedEndings && updates.clearedEndings.length > status.clearedEndings.length) {
        const newEnding = updates.clearedEndings[updates.clearedEndings.length - 1];
        reachEnding(newEnding);
      }

      setStatus(prev => ({ ...prev, ...updates }));
      
      if (updates.san) setLogs(prev => [...prev, `SAN値変動: ${updates.san - status.san}`]);
      if (updates.affection) setLogs(prev => [...prev, `好感度変動: ${updates.affection - status.affection}`]);
      if (updates.otakuLevel) setLogs(prev => [...prev, `オタク度上昇`]);
    }

    // シーン遷移
    setCurrentSceneId(choice.nextSceneId);
  };

  // ★ここが抜けていたためエラーになっていました
  return {
    status,
    currentScene,
    logs,
    handleChoice
  };
};
