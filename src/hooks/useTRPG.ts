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

  const [currentScene, setCurrentScene] = useState<Scene>(scenarioData[0]);
  const [logs, setLogs] = useState<string[]>([
    `--- ${scenarioData[0].title} ---`,
    scenarioData[0].description
  ]);
  const [rollResults, setRollResults] = useState<RollResult[]>([]);

  // 初期ステータスを設定する関数
  const setInitialStatus = (initialStatus: GameStatus) => {
    setStatus(initialStatus);
    setLogs([
      `--- ${scenarioData[0].title} ---`,
      scenarioData[0].description
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

    // 現在のステータスを保持
    let currentStatus = { ...status };

    // スキルチェックがある場合
    if (choice.skillCheck) {
      const result = rollDice(
        choice.skillCheck.skillName,
        choice.skillCheck.targetValue
      );

      // action関数がある場合は先に実行してステータスを更新
      if (choice.action) {
        const newStatus = choice.action(currentStatus);
        // action関数が返した新しいステータスで更新
        updateStatus(newStatus);
        currentStatus = newStatus;
      }

      // 成功/失敗に応じた処理
      if (result.success && choice.skillCheck.onSuccess) {
        const nextScene = scenarioData.find(s => s.id === choice.skillCheck!.onSuccess);
        if (nextScene) {
          setCurrentScene(nextScene);
          addToLogs(`\n--- ${nextScene.title} ---`);
          addToLogs(nextScene.description);
        }
      } else if (!result.success && choice.skillCheck.onFailure) {
        const nextScene = scenarioData.find(s => s.id === choice.skillCheck!.onFailure);
        if (nextScene) {
          setCurrentScene(nextScene);
          addToLogs(`\n--- ${nextScene.title} ---`);
          addToLogs(nextScene.description);
        }
      }
    } else {
      // 通常の選択肢処理
      let updates: Partial<GameStatus> = {};

      // action関数がある場合は実行
      if (choice.action) {
        const newStatus = choice.action(currentStatus);
        // action関数が返した完全な新しいステータスを使用
        updates = newStatus;
      }

      // effectsがある場合は適用（action関数の結果に追加）
      if (choice.effects) {
        if (choice.effects.hp !== undefined) {
          updates.hp = Math.max(0, (currentStatus.hp || 0) + choice.effects.hp);
        }
        if (choice.effects.san !== undefined) {
          updates.san = Math.max(0, Math.min(99, (currentStatus.san || 0) + choice.effects.san));
        }
        if (choice.effects.affection !== undefined) {
          updates.affection = (currentStatus.affection || 0) + choice.effects.affection;
        }
        if (choice.effects.otakuLevel !== undefined) {
          updates.otakuLevel = (currentStatus.otakuLevel || 0) + choice.effects.otakuLevel;
        }
        if (choice.effects.addItem) {
          updates.items = [...(currentStatus.items || []), choice.effects.addItem];
        }
        if (choice.effects.removeItem) {
          updates.items = (currentStatus.items || []).filter(item => item !== choice.effects?.removeItem);
        }
        if (choice.effects.addSkill) {
          updates.skills = [...(currentStatus.skills || []), choice.effects.addSkill];
          updates.skillValues = {
            ...(currentStatus.skillValues || {}),
            [choice.effects.addSkill]: initializeSkillValues()[choice.effects.addSkill] || 0
          };
        }
      }

      // ステータスを更新
      if (Object.keys(updates).length > 0) {
        updateStatus(updates);
        currentStatus = { ...currentStatus, ...updates };
      }

      // 結果テキストをログに追加
      if (choice.result) {
        addToLogs(choice.result);
      }

      // 次のシーンへ移動
      if (choice.nextScene) {
        const nextScene = scenarioData.find(s => s.id === choice.nextScene);
        if (nextScene) {
          setCurrentScene(nextScene);
          addToLogs(`\n--- ${nextScene.title} ---`);
          addToLogs(nextScene.description);

          // エンディングチェック
          if (nextScene.isEnding && nextScene.endingId) {
            const newClearedEndings = [...currentStatus.clearedEndings];
            if (!newClearedEndings.includes(nextScene.endingId)) {
              newClearedEndings.push(nextScene.endingId);
              updateStatus({ clearedEndings: newClearedEndings });
            }
          }
        }
      }
    }
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
    setCurrentScene(scenarioData[0]);
    setLogs([
      `--- ${scenarioData[0].title} ---`,
      scenarioData[0].description
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
