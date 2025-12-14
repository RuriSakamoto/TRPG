// src/hooks/useTRPG.ts
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
    skills: [], // ★追加: 初期は空
    turn: 0,
    clearedEndings: [],
    loopCount: 1,
  });

  const [currentSceneId, setCurrentSceneId] = useState<string>('start');
  const [logs, setLogs] = useState<string[]>(['ゲーム開始']);

  const currentScene = scenarioData.find(s => s.id === currentSceneId);

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

  // ★追加: 初期ステータスを上書きする関数
  const setInitialStatus = (initial: Partial<GameStatus>) => {
    setStatus(prev => ({ ...prev, ...initial }));
  };

  const handleChoice = (choice: Choice) => {
    if (choice.skillCheck) {
      let { skillName, targetValue, successSceneId, failureSceneId } = choice.skillCheck;
      
      // オタク度による補正
      if (skillName === '情熱' || skillName === '言いくるめ') {
        targetValue += status.otakuLevel * 5;
      }

      // ★追加: 習得済み技能によるボーナス (例: +20%)
      if (status.skills.includes(skillName)) {
        targetValue += 20;
      }

      const { result, value } = rollDice(targetValue);
      
      const logText = `判定: ${skillName} (${targetValue}%) → 出目:${value} [${resultText[result]}]`;
      setLogs(prev => [...prev, logText]);

      if (result === 'success' || result === 'critical') {
        setCurrentSceneId(successSceneId);
      } else {
        setCurrentSceneId(failureSceneId);
      }
      return;
    }

    if (choice.action) {
      const updates = choice.action(status);
      
      if (updates.clearedEndings && updates.clearedEndings.length > status.clearedEndings.length) {
        const newEnding = updates.clearedEndings[updates.clearedEndings.length - 1];
        reachEnding(newEnding);
      }

      setStatus(prev => ({ ...prev, ...updates }));
      
      if (updates.san) setLogs(prev => [...prev, `SAN値変動: ${updates.san - status.san}`]);
      if (updates.affection) setLogs(prev => [...prev, `好感度変動: ${updates.affection - status.affection}`]);
      if (updates.otakuLevel) setLogs(prev => [...prev, `オタク度上昇`]);
    }

    setCurrentSceneId(choice.nextSceneId);
  };

  return {
    status,
    currentScene,
    logs,
    handleChoice,
    setInitialStatus // ★追加: エクスポート
  };
};
