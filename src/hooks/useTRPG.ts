// src/hooks/useTRPG.ts
'use client';

import { useState } from 'react';
import { GameStatus, Scene, Choice, RollResult, initializeSkillValues } from '../types/game';
import { scenarioData } from '../data/scenario';
import { saveEndingToStorage } from '../lib/storage';

export const useTRPG = () => {
  const [status, setStatus] = useState<GameStatus>({
    hp: 10,
    san: 60,
    affection: 0,
    otakuLevel: 0,
    items: [],
    skills: [],
    skillValues: {}, // 初期は空
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

  // 初期ステータスを上書きする関数（CharacterCreatorからの引き継ぎ用）
  const setInitialStatus = (initial: Partial<GameStatus>) => {
    // 能力値が設定されている場合、技能値を自動計算
    const skillValues = initializeSkillValues(initial);
    
    setStatus(prev => ({ 
      ...prev, 
      ...initial,
      skillValues: { ...skillValues, ...initial.skillValues } // 既存の技能値を上書き可能
    }));
  };

  const handleChoice = (choice: Choice) => {
    if (choice.skillCheck) {
      const { skillName, targetValue, successSceneId, failureSceneId, criticalSceneId, fumbleSceneId } = choice.skillCheck;
      
      // 技能値の取得（指定がない場合はskillValuesから）
      let finalTargetValue = targetValue;
      if (finalTargetValue === undefined) {
        finalTargetValue = status.skillValues[skillName] || 50;
      }
      
      // オタク度による補正（情熱・言いくるめ技能）
      if (skillName === '情熱' || skillName === '言いくるめ') {
        finalTargetValue += status.otakuLevel * 5;
      }

      // 習得済み技能によるボーナス（後方互換性）
      if (status.skills.includes(skillName)) {
        finalTargetValue += 20;
      }

      const { result, value } = rollDice(finalTargetValue);
      
      const logText = `【判定】${skillName} (目標値:${finalTargetValue}%) → 出目:${value} ⇒ ${resultText[result]}`;
      setLogs(prev => [...prev, logText]);

      // 結果に応じたシーン遷移
      if (result === 'critical' && criticalSceneId) {
        setCurrentSceneId(criticalSceneId);
      } else if (result === 'fumble' && fumbleSceneId) {
        setCurrentSceneId(fumbleSceneId);
      } else if (result === 'success' || result === 'critical') {
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
        // ★★★ LocalStorageに保存 ★★★
        saveEndingToStorage(newEnding);
      }

      setStatus(prev => ({ ...prev, ...updates }));
      
      if (updates.san !== undefined) setLogs(prev => [...prev, `SAN値変動: ${updates.san > status.san ? '+' : ''}${updates.san - status.san}`]);
      if (updates.affection !== undefined) setLogs(prev => [...prev, `好感度変動: ${updates.affection > status.affection ? '+' : ''}${updates.affection - status.affection}`]);
      if (updates.otakuLevel !== undefined && updates.otakuLevel > status.otakuLevel) setLogs(prev => [...prev, `オタク度上昇！`]);
    }

    setCurrentSceneId(choice.nextSceneId);
  };

  return {
    status,
    currentScene,
    logs,
    handleChoice,
    setInitialStatus
  };
};
