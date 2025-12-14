'use client';

import { useState } from 'react';
import { GameStatus, Scene, Choice, RollResult } from '../types/game';
import { scenarioData } from '../data/scenario';

export const useTRPG = () => {
  // ... (state定義はそのまま) ...

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

  const handleChoice = (choice: Choice) => {
    // 技能判定
    if (choice.skillCheck) {
      let { skillName, targetValue, successSceneId, failureSceneId } = choice.skillCheck;
      
      if (skillName === '情熱' || skillName === '言いくるめ') {
        targetValue += status.otakuLevel * 5;
      }

      const { result, value } = rollDice(targetValue);
      
      // ★ここを修正：日本語でログ出力
      const logText = `判定: ${skillName} (${targetValue}%) → 出目:${value} [${resultText[result]}]`;
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
      if (updates.otakuLevel) setLogs(prev => [...prev, `オタク度上昇`]);
    }

    setCurrentSceneId(choice.nextSceneId);
  };

  // ... (returnなどはそのまま) ...
};
