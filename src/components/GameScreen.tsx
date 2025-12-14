'use client';

import React, { useEffect, useRef } from 'react';
import { useTRPG } from '../hooks/useTRPG';
import { CharacterCreation } from './CharacterCreation';

export const GameScreen = () => {
  const { status, currentScene, currentSceneId, logs, handleChoice, completeCharacterCreation } = useTRPG();
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // ★キャラメイク画面への分岐
  if (currentSceneId === 'character_creation') {
    return <CharacterCreation onComplete={completeCharacterCreation} />;
  }

  if (!currentScene) return <div className="text-white p-10">Loading...</div>;

  // ターン数から時刻を計算 (1ターン30分経過)
  const getCurrentTime = () => {
    const startHour = 21;
    const minutesPerTurn = 30;
    const totalMinutes = status.turn * minutesPerTurn;
    
    const currentHour = startHour + Math.floor(totalMinutes / 60);
    const currentMinute = totalMinutes % 60;
    
    return `${currentHour}:${currentMinute.toString().padStart(2, '0')}`;
  };

  const displayText = currentScene.text.replace('{{TIME}}', getCurrentTime());

  const bgStyle = currentScene.backgroundImage
    ? { backgroundImage: `url(${currentScene.backgroundImage})` }
    : { backgroundColor: '#1a1a2e' };

  return (
    <div 
      className="relative w-full h-screen bg-cover bg-center overflow-hidden font-sans text-white select-none"
      style={bgStyle}
    >
      {/* 背景 */}
      {!currentScene.backgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800" />
      )}

      {/* 立ち絵 */}
      {currentScene.characterImage && (
        <div className="absolute inset-0 flex items-end justify-center pointer-events-none z-0">
          <img 
            src={currentScene.characterImage} 
            alt="Character" 
            className="h-[90vh] object-contain drop-shadow-2xl translate-y-10" 
          />
        </div>
      )}

      {/* 上部ステータス */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-10 bg-gradient-to-b from-black/80 to-transparent">
        <div className="text-sm text-gray-300">
          <p>周回数: <span className="text-yellow-400 font-bold">{status.loopCount}</span></p>
          {status.clearedEndings.includes('true_end') && <span className="text-green-400 text-xs">★ True End済</span>}
        </div>
        <div className="flex gap-4 md:gap-6 text-sm font-bold drop-shadow-md">
          <div className="flex flex-col items-center"><span className="text-[10px] text-gray-400">SAN値</span><span className={status.san < 30 ? "text-red-500" : "text-green-400"}>{status.san}</span></div>
          <div className="flex flex-col items-center"><span className="text-[10px] text-gray-400">好感度</span><span className="text-pink-400">{status.affection}</span></div>
          <div className="flex flex-col items-center"><span className="text-[10px] text-gray-400">オタク度</span><span className="text-yellow-400">{status.otakuLevel}</span></div>
          <div className="flex flex-col items-center"><span className="text-[10px] text-gray-400">残りターン</span><span className="text-blue-400">{Math.max(0, 4 - status.turn)}</span></div>
        </div>
      </div>

      {/* ログウィンドウ (右側サイドバー) */}
      <div className="absolute top-20 right-0 w-64 h-[calc(100vh-300px)] z-10 pointer-events-none hidden md:flex flex-col items-end pr-4">
        <div className="w-full h-full bg-gradient-to-l from-black/80 to-transparent border-r-4 border-green-900/30 rounded-l-xl p-4 flex flex-col shadow-lg backdrop-blur-sm overflow-hidden">
          <div className="text-xs text-green-500 font-bold border-b border-green-900/50 pb-2 mb-2 text-right">
            SYSTEM LOG
          </div>
          <div className="flex-grow overflow-y-auto font-mono text-xs space-y-2 scrollbar-hide text-right">
            {logs.map((log, i) => (
              <div key={i} className="text-green-400 animate-pulse break-words">
                {log}
                <span className="opacity-50 ml-2">&lt;</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>

      {/* 下部メインエリア */}
      <div className="absolute bottom-0 left-0 w-full h-full flex flex-col justify-end pb-4 px-4 md:pb-8 md:px-12 z-20 pointer-events-none">
        {/* 選択肢 */}
        <div className="w-full flex flex-col items-center gap-3 mb-6 pointer-events-auto">
          {currentScene.choices.map((choice, index) => {
            if (choice.condition && !choice.condition(status)) return null;
            return (
              <button
                key={index}
                onClick={() => handleChoice(choice)}
                className="w-full max-w-xl bg-indigo-900/90 hover:bg-indigo-600 text-white py-3 px-6 rounded-lg border border-indigo-400/50 shadow-lg transition-all transform hover:scale-105 flex justify-between items-center group backdrop-blur-sm"
              >
                <span className="font-bold text-base md:text-lg group-hover:text-yellow-200">{choice.text}</span>
                {choice.skillCheck && (
                  <span className="text-xs bg-black/50 px-2 py-1 rounded text-cyan-300 border border-cyan-700 ml-2 whitespace-nowrap">
                    {choice.skillCheck.skillName} {choice.skillCheck.targetValue}%
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* メッセージウィンドウ */}
        <div className="w-full max-w-5xl mx-auto bg-black/85 border-2 border-gray-600 rounded-xl p-6 md:p-8 shadow-2xl backdrop-blur-md min-h-[180px] md:min-h-[200px] relative pointer-events-auto">
          <div className="absolute -top-4 left-6 md:left-10 bg-indigo-600 px-6 py-1 rounded-full text-sm md:text-base font-bold shadow-lg border border-indigo-400">
            {status.playerName}
          </div>
          <p className="text-base md:text-xl leading-relaxed whitespace-pre-wrap text-gray-100 font-medium">
            {displayText}
          </p>
        </div>
      </div>

    </div>
  );
};
