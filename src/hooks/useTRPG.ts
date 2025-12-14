'use client';  // ← ★この1行を必ず一番上に追加してください！

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

  const rollDice = (target: number): { result: RollResult; value: number } => {
    const value = Math.floor(Math.random() * 100) + 1;
    let result: RollResult = 'failure';

    if (value <= 5) result = 'critical';
    else if (value >= 96) result = 'fumble';
    else if (value <= target) result = 'success';

    return { result, value };
  };

  const handleChoice = (choice: Choice) => {
    // 技能判定
    if (choice.skillCheck) {
      let { skillName, targetValue, successSceneId, failureSceneId } = choice.skillCheck;
      
      // オタク度による補正（情熱判定など）
      if (skillName === '情熱' || skillName === '言いくるめ') {
        targetValue += status.otakuLevel * 5;
      }

      const { result, value } = rollDice(targetValue);
      
      const logText = `判定: ${skillName} (目標${targetValue}) → 出目:${value} [${result}]`;
      setLogs(prev => [...prev, logText]);

      if (result === 'success' || result === 'critical') {
        setCurrentSceneId(successSceneId);
      } else {
        setCurrentSceneId(failureSceneId);
      }
      return;
    }

    // 通常選択
    if (choice.action) {
      const updates = choice.action(status);
      setStatus(prev => ({ ...prev, ...updates }));
      
      if (updates.san) setLogs(prev => [...prev, `SAN値変動: ${updates.san - status.san}`]);
      if (updates.affection) setLogs(prev => [...prev, `好感度変動: ${updates.affection - status.affection}`]);
    }

    setCurrentSceneId(choice.nextSceneId);
  };

  return {
    status,
    currentScene,
    logs,
    handleChoice
  };
};
