'use client';

import React, { useEffect, useState } from 'react';
import { useTRPG } from '../hooks/useTRPG';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export const GameScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { status, currentScene, logs, handleChoice, setInitialStatus } = useTRPG({
    isLoggedIn: !!user,
  });

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // LocalStorageからキャラクターデータを読み込む
    const savedCharacter = localStorage.getItem('character');
    const savedGameData = localStorage.getItem('gameData');

    if (savedCharacter && savedGameData) {
      try {
        const character = JSON.parse(savedCharacter);
        const gameData = JSON.parse(savedGameData);

        // 初期ステータスを設定
        setInitialStatus({
          ...character,
          hp: character.HP || 10,
          san: gameData.san || character.SAN || 60,
          mp: character.MP,
          affection: gameData.affection || 0,
          otakuLevel: gameData.otakuLevel || 0,
          items: gameData.items || [],
          skills: gameData.skills || [],
          skillValues: character.skillValues || {},
          turn: 0,
          clearedEndings: [],
          loopCount: 1,
        });
      } catch (error) {
        console.error('Failed to load game data:', error);
        router.push('/');
      }
    } else {
      // データがない場合はキャラクター作成画面へ
      router.push('/');
    }
  }, [router, setInitialStatus]);

  // 時刻を計算する関数（21時スタート、1ターン = 30分）
  const getCurrentTime = () => {
    const startHour = 21;
    const startMinute = 0;
    const minutesPerTurn = 30;

    const totalMinutes = startMinute + (status.turn * minutesPerTurn);
    const hours = startHour + Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    // 24時を超えたら翌日扱い
    const displayHours = hours % 24;

    return `${displayHours}:${minutes.toString().padStart(2, '0')}`;
  };

  // テキスト内のプレースホルダーを置換する関数
  const replaceTextPlaceholders = (text: string) => {
    return text.replace(/{{TIME}}/g, getCurrentTime());
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    );
  }

  // 選択肢が条件を満たすかチェック
  const getAvailableChoices = () => {
    return currentScene.choices.filter(choice => {
      if (choice.condition) {
        return choice.condition(status);
      }
      return true;
    });
  };

  const availableChoices = getAvailableChoices();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* ステータス表示 */}
        <div className="bg-slate-800/60 backdrop-blur-md rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-slate-600">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4 text-xs sm:text-sm">
            <div>
              <span className="text-slate-400">HP:</span>
              <span className="ml-1 sm:ml-2 font-bold text-red-400">{status.hp}</span>
            </div>
            <div>
              <span className="text-slate-400">SAN:</span>
              <span className="ml-1 sm:ml-2 font-bold text-blue-400">{status.san}</span>
            </div>
            <div>
              <span className="text-slate-400">好感度:</span>
              <span className="ml-1 sm:ml-2 font-bold text-pink-400">{status.affection}</span>
            </div>
            <div>
              <span className="text-slate-400">オタク度:</span>
              <span className="ml-1 sm:ml-2 font-bold text-purple-400">{status.otakuLevel}</span>
            </div>
            <div>
              <span className="text-slate-400">ターン:</span>
              <span className="ml-1 sm:ml-2 font-bold text-amber-400">{status.turn}</span>
            </div>
            <div>
              <span className="text-slate-400">時刻:</span>
              <span className="ml-1 sm:ml-2 font-bold text-green-400">{getCurrentTime()}</span>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* シーン表示 */}
          <div className="lg:col-span-2 bg-slate-800/60 backdrop-blur-md rounded-lg p-4 sm:p-6 border border-slate-600">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-amber-400">
              {currentScene.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mb-3 sm:mb-4">
              {currentScene.description}
            </p>
            <div className="text-sm sm:text-base text-slate-200 mb-4 sm:mb-6 whitespace-pre-wrap leading-relaxed">
              {replaceTextPlaceholders(currentScene.text)}
            </div>

            {/* 選択肢 */}
            <div className="space-y-2 sm:space-y-3">
              {availableChoices.length > 0 ? (
                availableChoices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => handleChoice(choice)}
                    className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors border border-slate-600 text-sm sm:text-base"
                  >
                    {choice.text}
                  </button>
                ))
              ) : (
                <div className="text-center text-slate-400 py-4">
                  選択肢がありません
                </div>
              )}
            </div>
          </div>

          {/* ログ表示 */}
          <div className="bg-slate-800/60 backdrop-blur-md rounded-lg p-4 sm:p-6 border border-slate-600 max-h-[400px] sm:max-h-[600px] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-slate-100 sticky top-0 bg-slate-800/90 pb-2">
              ログ
            </h3>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`${
                    log.startsWith('🎲')
                      ? 'text-amber-400'
                      : log.startsWith('>')
                      ? 'text-blue-400 font-semibold'
                      : log.startsWith('---')
                      ? 'text-green-400 font-bold'
                      : 'text-slate-300'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* メニューボタン */}
        <div className="mt-4 sm:mt-6 flex justify-center">
          <button
            onClick={() => {
              if (confirm('キャラクター作成画面に戻りますか？（進行状況は失われます）')) {
                router.push('/');
              }
            }}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm sm:text-base"
          >
            タイトルに戻る
          </button>
        </div>
      </div>
    </div>
  );
};
