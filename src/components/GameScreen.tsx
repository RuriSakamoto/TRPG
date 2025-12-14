'use client';

import React, { useEffect, useRef } from 'react';
import { useTRPG } from '../hooks/useTRPG';

export const GameScreen = () => {
  const { status, currentScene, logs, handleChoice } = useTRPG();
  const logsEndRef = useRef<HTMLDivElement>(null);

  // ログ自動スクロール（常に最新を表示）
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  if (!currentScene) return <div className="text-white p-10">Loading...</div>;

  const bgStyle = currentScene.backgroundImage
    ? { backgroundImage: `url(${currentScene.backgroundImage})` }
    : { backgroundColor: '#1a1a2e' };

  return (
    <div 
      className="relative w-full h-screen bg-cover bg-center overflow-hidden font-sans text-white select-none"
      style={bgStyle}
    >
      {/* --- 背景・立ち絵・上部ステータスは前回と同じ --- */}
      {!currentScene.backgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800" />
      )}
      {currentScene.characterImage && (
        <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
          <img src={currentScene.characterImage} alt="Character" className="h-[85vh] object-contain drop-shadow-2xl" />
        </div>
      )}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-10 bg-gradient-to-b from-black/70 to-transparent">
        {/* (ステータス表示部分は省略・前回と同じ) */}
        <div className="text-sm text-gray-300">
           <p>周回数: <span className="text-yellow-400 font-bold">{status.loopCount}</span></p>
        </div>
        <div className="flex gap-6 text-sm font-bold drop-shadow-md">
           {/* (SAN値などの表示) */}
           <div className="flex flex-col items-center"><span className="text-xs text-gray-400">SAN値</span><span className={status.san < 30 ? "text-red-500" : "text-green-400"}>{status.san}</span></div>
           <div className="flex flex-col items-center"><span className="text-xs text-gray-400">好感度</span><span className="text-pink-400">{status.affection}</span></div>
           <div className="flex flex-col items-center"><span className="text-xs text-gray-400">オタク度</span><span className="text-yellow-400">{status.otakuLevel}</span></div>
           <div className="flex flex-col items-center"><span className="text-xs text-gray-400">残りターン</span><span className="text-blue-400">{Math.max(0, 4 - status.turn)}</span></div>
        </div>
      </div>

      {/* --- メインUIエリア (下半分) --- */}
      <div className="absolute bottom-0 left-0 w-full h-[40vh] z-20 flex flex-col justify-end pb-6 px-6 pointer-events-none">
        
        {/* 選択肢 (中央・クリック可能) */}
        <div className="w-full flex flex-col items-center gap-3 mb-4 pointer-events-auto">
          {currentScene.choices.map((choice, index) => {
            if (choice.condition && !choice.condition(status)) return null;
            return (
              <button
                key={index}
                onClick={() => handleChoice(choice)}
                className="w-full max-w-2xl bg-indigo-900/90 hover:bg-indigo-600 text-white py-3 px-6 rounded-lg border border-indigo-400/50 shadow-lg transition-all transform hover:scale-105 flex justify-between items-center group"
              >
                <span className="font-bold text-lg group-hover:text-yellow-200">{choice.text}</span>
                {choice.skillCheck && (
                  <span className="text-xs bg-black/50 px-2 py-1 rounded text-cyan-300 border border-cyan-700">
                    {choice.skillCheck.skillName} {choice.skillCheck.targetValue}%
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* テキストウィンドウ (下部全体) */}
        <div className="w-full max-w-5xl mx-auto bg-black/80 border-2 border-gray-600 rounded-xl p-6 shadow-2xl backdrop-blur-md min-h-[140px] relative pointer-events-auto">
          <div className="absolute -top-4 left-6 bg-indigo-600 px-6 py-1 rounded-full text-sm font-bold shadow-lg border border-indigo-400">
            アベンチュリン
          </div>
          <p className="text-lg leading-relaxed whitespace-pre-wrap text-gray-100">
            {currentScene.text}
          </p>
        </div>
      </div>

      {/* --- ★修正箇所：ログウィンドウ (左下・枠付き) --- */}
      <div className="absolute bottom-[180px] left-6 w-72 h-48 z-30 pointer-events-none">
        <div className="w-full h-full bg-black/70 border border-green-900/50 rounded-lg p-3 flex flex-col shadow-lg backdrop-blur-sm">
          <div className="text-xs text-green-500 font-bold border-b border-green-900/50 pb-1 mb-2">SYSTEM LOG</div>
          <div className="flex-grow overflow-y-auto font-mono text-xs space-y-1 scrollbar-hide">
            {logs.map((log, i) => (
              <div key={i} className="text-green-400 animate-pulse">
                <span className="opacity-50 mr-2">&gt;</span>
                {log}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>

    </div>
  );
};
