'use client';

import { useState } from 'react';
import { GameStatus, Scene, Choice, RollResult, Attributes, Skills } from '../types/game';
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
    playerName: 'アベンチュリン',
    attributes: { STR: 10, DEX: 10, POW: 10, APP: 18 },
    skills: { observation: 25, listening: 25, persuasion: 50, psychology: 50, passion: 50 }
  });

  // 初期シーンをキャラメイク画面に設定
  const [currentSceneId, setCurrentSceneId] = useState<string>('character_creation');
  const [logs, setLogs] = useState<string[]>(['システム起動...']);

  const currentScene = currentSceneId === 'character_creation' 
    ? null 
    : scenarioData.find(s => s.id === currentSceneId);

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

  // キャラメイク完了処理
  const completeCharacterCreation = (name: string, attrs: Attributes, skills: Skills) => {
    setStatus(prev => ({
      ...prev,
      playerName: name,
      attributes: attrs,
      skills: skills,
      hp: Math.floor((attrs.STR + attrs.DEX) / 2),
      san: attrs.POW * 5,
    }));
    setCurrentSceneId('start'); // プロローグへ移動
    setLogs(prev => [...prev, `キャラクター作成完了: ${name}`, 'ゲーム開始']);
  };

  const handleChoice = (choice: Choice) => {
    // 1. 技能判定がある場合
    if (choice.skillCheck) {
      let { skillName, targetValue, successSceneId, failureSceneId } = choice.skillCheck;
      
      // ★修正: キャラクターの技能値をベースにする
      // (シナリオ側のtargetValueは「難易度補正」として扱うか、あるいはここで上書きするか)
      // 今回は「シナリオ指定値 + キャラクター技能値のボーナス」という簡易ロジックにします
      
      // マッピング (日本語名 -> 英語キー)
      const skillMap: Record<string, keyof Skills> = {
        '目星': 'observation',
        '聞き耳': 'listening',
        '言いくるめ': 'persuasion',
        '心理学': 'psychology',
        '情熱': 'passion',
        '説得': 'persuasion', // エイリアス
        '幸運': 'passion',    // 仮
        '強運': 'passion'     // 仮
      };

      // キャラクターの技能値を取得
      const charaSkillValue = skillMap[skillName] ? status.skills[skillMap[skillName]] : 0;
      
      // 判定値 = キャラ技能値 + オタク度補正 (情熱系のみ)
      let finalTarget = charaSkillValue;
      
      // もしシナリオ側で固定値(95など)が指定されている特殊技能の場合はそちらを優先
      if (targetValue > 90) {
        finalTarget = targetValue;
      } else if (skillName === '情熱' || skillName === '言いくるめ') {
        finalTarget += status.otakuLevel * 5;
      }

      const { result, value } = rollDice(finalTarget);
      
      const logText = `判定: ${skillName} (${finalTarget}%) → 出目:${value} [${resultText[result]}]`;
      setLogs(prev => [...prev, logText]);

      if (result === 'success' || result === 'critical') {
        setCurrentSceneId(successSceneId);
      } else {
        setCurrentSceneId(failureSceneId);
      }
      return;
    }

    // 2. 通常の選択肢
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
    currentSceneId,
    logs,
    handleChoice,
    completeCharacterCreation
  };
};
