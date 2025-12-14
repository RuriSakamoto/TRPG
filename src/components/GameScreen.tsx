'use client';  // ← ★この1行を必ず一番上に追加してください！


import React from 'react';
import { useTRPG } from '../hooks/useTRPG';

export const GameScreen = () => {
  const { status, currentScene, logs, handleChoice } = useTRPG();

  if (!currentScene) return <div className="text-white">Loading or Error...</div>;

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans">
      {/* メインエリア */}
      <div className="w-3/4 p-8 flex flex-col relative">
        {/* タイトル画面の特別演出 */}
        {currentScene.id === 'start' && (
          <div className="absolute top-4 right-4 text-right">
            <p className="text-yellow-400 text-sm">周回数: {status.loopCount}</p>
            {status.clearedEndings.includes('true_end') && <p className="text-green-400 text-sm">★ True End 到達済</p>}
          </div>
        )}

        {/* シナリオテキスト */}
        <div className="flex-grow bg-gray-800 p-8 rounded-lg mb-6 text-lg leading-loose border border-gray-700 shadow-lg whitespace-pre-wrap">
          {currentScene.text}
        </div>

        {/* 選択肢 */}
        <div className="grid grid-cols-1 gap-4">
          {currentScene.choices.map((choice, index) => {
            if (choice.condition && !choice.condition(status)) return null;

            return (
              <button
                key={index}
                onClick={() => handleChoice(choice)}
                className="bg-indigo-700 hover:bg-indigo-600 text-white py-4 px-6 rounded-lg transition duration-200 text-left flex justify-between items-center shadow-md"
              >
                <span>{choice.text}</span>
                {choice.skillCheck && (
                  <span className="text-xs bg-indigo-900 px-2 py-1 rounded text-indigo-200">
                    {choice.skillCheck.skillName} ({choice.skillCheck.targetValue}%)
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* サイドバー（ステータス） */}
      <div className="w-1/4 bg-gray-950 p-6 border-l border-gray-800 flex flex-col">
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-indigo-400 border-b border-gray-800 pb-2">STATUS</h2>
          <ul className="space-y-3">
            <li className="flex justify-between">
              <span>SAN値 (尊さ)</span>
              <span className={status.san < 30 ? "text-red-500 font-bold" : "text-green-400 font-bold"}>{status.san}</span>
            </li>
            <li className="flex justify-between">
              <span>好感度</span>
              <span className="text-pink-400 font-bold">{status.affection}</span>
            </li>
            <li className="flex justify-between">
              <span>オタク度</span>
              <span className="text-yellow-400 font-bold">{status.otakuLevel}</span>
            </li>
            <li className="flex justify-between">
              <span>残りターン</span>
              <span className="text-gray-400">{4 - status.turn}</span>
            </li>
          </ul>
        </div>

        <div className="flex-grow flex flex-col">
          <h2 className="text-xl font-bold mb-2 text-gray-500 border-b border-gray-800 pb-2">LOG</h2>
          <div className="flex-grow overflow-y-auto bg-black p-3 rounded text-xs font-mono text-green-500 border border-gray-800">
            {logs.map((log, i) => <div key={i} className="mb-1">&gt; {log}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
};
