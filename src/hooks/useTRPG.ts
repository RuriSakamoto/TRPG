'use client';

import { useState, useCallback, useRef } from 'react';
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
  
  // 初期化済みフラグ
  const isInitializedRef = useRef(false);

  // 初期ステータスを設定する関数（1回のみ実行）
  const setInitialStatus = useCallback((initialStatus: GameStatus) => {
    if (isInitializedRef.current) {
      return; // 既に初期化済みの場合は何もしない
    }
    
    setStatus(initialStatus);
    setLogs([
      `--- ${scenarioData[0].title} ---`,
      scenarioData[0].description
    ]);
    
    isInitializedRef.current = true;
  }, []);

  const updateStatus = useCallback((updates: Partial<GameStatus>) => {
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
  }, [isLoggedIn]);

  const addToLogs = useCallback((text: string) => {
    setLogs(prev => [...prev, text]);
  }, []);

  const rollDice = useCallback((skillName: string, difficulty: number = 50): RollResult => {
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
  }, [status.skills, status.skillValues, addToLogs]);

  const handleChoice = useCallback((choice: Choice) => {
    // 選択肢のテキストをログに追加
    addToLogs(`> ${choice.text}`);

    // 状態更新を行う関数
    const processChoice = (currentStatus: GameStatus) => {
      let updates: Partial<GameStatus> = {};

      // action関数がある場合は実行
      if (choice.action) {
        const actionUpdates = choice.action(currentStatus);
        updates = { ...updates, ...actionUpdates };
      }

      // effectsがある場合は適用
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

      return updates;
    };

    // スキルチェックがある場合
    if (choice.skillCheck) {
      const result = rollDice(
        choice.skillCheck.skillName,
        choice.skillCheck.targetValue
      );

      // 状態更新
      const updates = processChoice(status);
      if (Object.keys(updates).length > 0) {
        updateStatus(updates);
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
      const updates = processChoice(status);

      // ステータスを更新
      if (Object.keys(updates).length > 0) {
        updateStatus(updates);
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
            setStatus(prev => {
              const newClearedEndings = [...prev.clearedEndings];
              if (!newClearedEndings.includes(nextScene.endingId!)) {
                newClearedEndings.push(nextScene.endingId!);
                return { ...prev, clearedEndings: newClearedEndings };
              }
              return prev;
            });
          }
        }
      }
    }
  }, [status, rollDice, updateStatus, addToLogs]);

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
    isInitializedRef.current = false;
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
