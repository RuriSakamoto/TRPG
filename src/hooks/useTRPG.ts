'use client';

import { useState } from 'react';
import { GameStatus, Scene, Choice, RollResult, initializeSkillValues } from '../types/game';
import { scenarioData } from '../data/scenario';
import { saveEndingToStorage } from '../lib/storage';

interface UseTRPGProps {
  isLoggedIn: boolean;
}

export const useTRPG = ({ isLoggedIn }: UseTRPGProps) => {
  const [status, setStatus] = useState<GameStatus>({
    hp: 10,
    san: 60,
    affection: 0,
    otakuLevel: 0,
    items: [],
    skills: [],
    skillValues: {},
    turn: 0,
    clearedEndings: [],
    loopCount: 1,
  });

  const [currentScene, setCurrentScene] = useState<Scene>(scenarioData.scenes[0]);
  const [logs, setLogs] = useState<string[]>([
    `--- ${scenarioData.scenes[0].title} ---`,
    scenarioData.scenes[0].description
  ]);
  const [rollResults, setRollResults] = useState<RollResult[]>([]);

  // 初期ステータスを設定する関数
  const setInitialStatus = (initialStatus: GameStatus) => {
    setStatus(initialStatus);
    setLogs([
      `--- ${scenarioData.scenes[0].title} ---`,
      scenarioData.scenes[0].description
    ]);
  };

  const updateStatus = (updates: Partial<GameStatus>) => {
    setStatus(prev => {
      const newStatus = { ...prev, ...updates };
      
      // エンディング到達時の処理
      if (updates.clearedEndings && updates.clearedEndings.length > prev.clearedEndings.length) {
        const newEnding = updates.clearedEndings[updates.clearedEndings.length - 1];
        // ログイン状態を渡して保存
        saveEndingToStorage(newEnding, isLoggedIn);
      }
      
      return newStatus;
    });
  };

  const addToLogs = (text: string) => {
    setLogs(prev => [...prev, text]);
  };

  const rollDice = (skillName: string, difficulty: number = 50): RollResult => {
    const roll = Math.floor(Math.random() * 100) + 1;
    
    // 習得技能の場合は+20%ボーナス
    const hasSkill = status.skills.includes(skillName);
    const skillValue = status.skillValues?.[skillName] || difficulty;
    const finalSkillValue = hasSkill ? Math.min(95, skillValue + 20) : skillValue;
    
    const success = roll <= finalSkillValue;

    const result: RollResult = {
      skillName,
      roll,
      skillValue: finalSkillValue,
      success,
      critical: roll <= 5,
      fumble: roll >= 96,
    };

    setRollResults(prev => [...prev, result]);
    
    const bonusText = hasSkill ? ' (+20%ボーナス)' : '';
    addToLogs(
      `🎲 ${skillName}ロール${bonusText}: ${roll}/${finalSkillValue} - ${
        result.critical ? '大成功！' : result.fumble ? '大失敗...' : success ? '成功' : '失敗'
      }`
    );

    return result;
  };

  const handleChoice = (choice: Choice) => {
    // 選択肢のテキストをログに追加
    addToLogs(`> ${choice.text}`);

    // スキルチェックがある場合
    if (choice.skillCheck) {
      const result = rollDice(
        choice.skillCheck.skillName,
        choice.skillCheck.targetValue
      );

      // 成功/失敗に応じた処理
      if (result.success && choice.skillCheck.onSuccess) {
        const nextScene = scenarioData.scenes.find(s => s.id === choice.skillCheck!.onSuccess);
        if (nextScene) {
          setCurrentScene(nextScene);
          addToLogs(`\n--- ${nextScene.title} ---`);
          addToLogs(nextScene.description);
        }
      } else if (!result.success && choice.skillCheck.onFailure) {
        const nextScene = scenarioData.scenes.find(s => s.id === choice.skillCheck!.onFailure);
        if (nextScene) {
          setCurrentScene(nextScene);
          addToLogs(`\n--- ${nextScene.title} ---`);
          addToLogs(nextScene.description);
        }
      }
    } else {
      // 通常の選択肢処理
      // ステータス更新
      if (choice.effects) {
        const updates: Partial<GameStatus> = { ...status };
        
        if (choice.effects.hp !== undefined) {
          updates.hp = Math.max(0, (status.hp || 0) + choice.effects.hp);
        }
        if (choice.effects.san !== undefined) {
          updates.san = Math.max(0, Math.min(99, (status.san || 0) + choice.effects.san));
        }
        if (choice.effects.affection !== undefined) {
          updates.affection = (status.affection || 0) + choice.effects.affection;
        }
        if (choice.effects.otakuLevel !== undefined) {
          updates.otakuLevel = (status.otakuLevel || 0) + choice.effects.otakuLevel;
        }
        if (choice.effects.addItem) {
          updates.items = [...(status.items || []), choice.effects.addItem];
        }
        if (choice.effects.removeItem) {
          updates.items = (status.items || []).filter(item => item !== choice.effects.removeItem);
        }
        if (choice.effects.addSkill) {
          updates.skills = [...(status.skills || []), choice.effects.addSkill];
          updates.skillValues = {
            ...(status.skillValues || {}),
            [choice.effects.addSkill]: initializeSkillValues()[choice.effects.addSkill] || 0
          };
        }

        updateStatus(updates);
      }

      // 結果テキストをログに追加
      if (choice.result) {
        addToLogs(choice.result);
      }

      // 次のシーンへ移動
      if (choice.nextScene) {
        const nextScene = scenarioData.scenes.find(s => s.id === choice.nextScene);
        if (nextScene) {
          setCurrentScene(nextScene);
          addToLogs(`\n--- ${nextScene.title} ---`);
          addToLogs(nextScene.description);

          // エンディングチェック
          if (nextScene.isEnding && nextScene.endingId) {
            const newClearedEndings = [...status.clearedEndings];
            if (!newClearedEndings.includes(nextScene.endingId)) {
              newClearedEndings.push(nextScene.endingId);
              updateStatus({ clearedEndings: newClearedEndings });
            }
          }
        }
      }
    }

    // ターン数を増やす
    updateStatus({ turn: (status.turn || 0) + 1 });
  };

  const resetGame = () => {
    setStatus({
      hp: 10,
      san: 60,
      affection: 0,
      otakuLevel: 0,
      items: [],
      skills: [],
      skillValues: {},
      turn: 0,
      clearedEndings: status.clearedEndings, // エンディングは保持
      loopCount: (status.loopCount || 1) + 1,
    });
    setCurrentScene(scenarioData.scenes[0]);
    setLogs([
      `--- ${scenarioData.scenes[0].title} ---`,
      scenarioData.scenes[0].description
    ]);
    setRollResults([]);
  };

  return {
    status,
    currentScene,
    logs,
    rollResults,
    updateStatus,
    handleChoice,
    rollDice,
    resetGame,
    addToLogs,
    setInitialStatus,
  };
};
