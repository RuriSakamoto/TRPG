'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTRPG } from '../hooks/useTRPG';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export const GameScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const { status, currentScene, logs, handleChoice, setInitialStatus } = useTRPG({ isLoggedIn: !!user });
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // LocalStorageからゲームデータを読み込む
    const gameDataStr = localStorage.getItem('gameData');
    const characterStr = localStorage.getItem('character');

    if (!gameDataStr || !characterStr) {
      // データがない場合はキャラクター作成画面に戻る
      router.push('/');
      return;
    }

    try {
      const gameData = JSON.parse(gameDataStr);
      const character = JSON.parse(characterStr);

      // 初期ステータスを設定
      setInitialStatus({
        hp: character.HP || 10,
        san: gameData.san || character.SAN || 60,
        affection: 0,
        otakuLevel: gameData.otakuLevel || 0, // 隠しパラメータ
        items: [],
        skills: gameData.skills || [],
        skillValues: {},
        turn: 0,
        clearedEndings: [],
        loopCount: 1,
      });

      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to load game data:', error);
      router.push('/');
    }
  }, [router, setInitialStatus]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  if (!isInitialized || !currentScene) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    );
  }

  // ターン数から時刻を計算する関数 (開始21:00, 1ターン30分)
  const getCurrentTime = () => {
    const startHour = 21; // ゲーム開始時刻
    const minutesPerTurn = 30; // 1ターンあたりの経過時間
    const totalMinutes = status.turn * minutesPerTurn;
    
    const currentHour = startHour + Math.floor(totalMinutes / 60);
    const currentMinute = totalMinutes % 60;
    
    return `${currentHour}:${currentMinute.toString().padStart(2, '0')}`;
  };

  // テキスト内の {{TIME}} を現在の時刻に置き換える
  const displayText = currentScene.text.replace('{{TIME}}', getCurrentTime());

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-amber-700 selection:text-white overflow-hidden">
      {/* メインゲーム画面 */}
      <div className="relative w-full h-screen flex flex-col md:flex-row">
        
        {/* 左側: ビジュアル & シナリオエリア */}
        <div className="relative flex-1 h-1/2 md:h-full flex flex-col">
          {/* 背景画像 */}
          <div className="absolute inset-0 z-0">
            {currentScene.backgroundImage ? (
              <img 
                src={currentScene.backgroundImage} 
                alt="background" 
                className="w-full h-full object-cover opacity-60"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
          </div>

          {/* キャラクター立ち絵 */}
          {currentScene.characterImage && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-10 w-auto h-[80%] max-h-[600px]">
              <img 
                src={currentScene.characterImage} 
                alt="character" 
                className="h-full w-auto object-contain drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]"
              />
            </div>
          )}

          {/* シナリオテキストエリア */}
          <div className="absolute bottom-0 w-full p-4 sm:p-6 z-20 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent pt-16 sm:pt-20">
            <div className="max-w-4xl mx-auto bg-slate-800/80 backdrop-blur-sm border border-slate-600 p-4 sm:p-6 rounded-xl shadow-2xl">
              <p className="text-base sm:text-lg md:text-xl leading-relaxed text-slate-100 whitespace-pre-wrap">
                {displayText}
              </p>
            </div>
          </div>
        </div>

        {/* 右側: ステータス & 選択肢エリア */}
        <div className="w-full md:w-[400px] bg-slate-800 border-l border-slate-700 flex flex-col h-1/2 md:h-full z-30 shadow-2xl">
          
          {/* ステータスパネル */}
          <div className="p-4 sm:p-6 bg-slate-800/95 backdrop-blur border-b border-slate-700">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Player Status</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                <div className="text-xs text-slate-400 mb-1">SAN値</div>
                <div className="text-xl sm:text-2xl font-bold text-blue-400">{status.san}</div>
              </div>
              <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                <div className="text-xs text-slate-400 mb-1">好感度</div>
                <div className="text-xl sm:text-2xl font-bold text-rose-400">{status.affection}</div>
              </div>
              {/* オタク度は非表示（隠しパラメータ） */}
              <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600 col-span-2">
                <div className="text-xs text-slate-400 mb-1">所持品</div>
                <div className="text-sm font-medium text-slate-300">
                  {status.items.length > 0 ? status.items.join(', ') : 'なし'}
                </div>
              </div>
            </div>
            {/* 技能表示エリア */}
            {status.skills.length > 0 && (
              <div className="mt-3 sm:mt-4 bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                <div className="text-xs text-slate-400 mb-1">習得技能</div>
                <div className="flex flex-wrap gap-1">
                  {status.skills.map(skill => (
                    <span key={skill} className="text-xs bg-amber-900/50 text-amber-200 px-2 py-1 rounded border border-amber-700/30">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ログエリア */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 bg-slate-900/50 text-xs sm:text-sm font-mono border-b border-slate-700">
            {logs.map((log, i) => (
              <div key={i} className="text-slate-400 border-l-2 border-slate-600 pl-2 py-1">
                <span className="text-slate-600 mr-2">[{i + 1}]</span>
                {log}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>

          {/* 選択肢エリア */}
          <div className="p-4 sm:p-6 bg-slate-800">
            <div className="space-y-2 sm:space-y-3">
              {currentScene.choices.map((choice, index) => {
                if (choice.condition && !choice.condition(status)) {
                  return null;
                }
                
                return (
                  <button
                    key={index}
                    onClick={() => handleChoice(choice)}
                    className="w-full p-3 sm:p-4 text-left bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white rounded-lg transition-all transform hover:translate-x-1 shadow-lg border border-slate-500/30 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm sm:text-base">{choice.text}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-300">
                        →
                      </span>
                    </div>
                    {choice.skillCheck && (
                      <div className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                        <span className="bg-slate-800/50 px-1.5 py-0.5 rounded">
                          🎲 {choice.skillCheck.skillName}
                        </span>
                        <span>目標: {choice.skillCheck.targetValue}%</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
