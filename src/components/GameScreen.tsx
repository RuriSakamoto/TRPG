// src/components/GameScreen.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTRPG } from '../hooks/useTRPG';
import { CharacterCreation } from './CharacterCreation';

export const GameScreen = () => {
  // setInitialStatus を受け取るように変更
  const { status, currentScene, logs, handleChoice, setInitialStatus } = useTRPG();
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  // キャラクター作成中かどうかを管理するstate
  const [isCreating, setIsCreating] = useState(true);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // 作成中の場合は作成画面を表示
  if (isCreating) {
    return <CharacterCreation onComplete={(initial) => {
      setInitialStatus(initial);
      setIsCreating(false);
    }} />;
  }

  if (!currentScene) return <div className="text-white p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-indigo-500 selection:text-white overflow-hidden">
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
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
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
          <div className="absolute bottom-0 w-full p-6 z-20 bg-gradient-to-t from-gray-900 via-gray-900/90 to-transparent pt-20">
            <div className="max-w-4xl mx-auto bg-black/60 backdrop-blur-sm border border-gray-700 p-6 rounded-xl shadow-2xl">
              <p className="text-lg md:text-xl leading-relaxed text-gray-100 whitespace-pre-wrap">
                {currentScene.text}
              </p>
            </div>
          </div>
        </div>

        {/* 右側: ステータス & 選択肢エリア */}
        <div className="w-full md:w-[400px] bg-gray-800 border-l border-gray-700 flex flex-col h-1/2 md:h-full z-30 shadow-2xl">
          
          {/* ステータスパネル */}
          <div className="p-6 bg-gray-800/95 backdrop-blur border-b border-gray-700">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Player Status</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                <div className="text-xs text-gray-400 mb-1">SAN値</div>
                <div className="text-2xl font-bold text-blue-400">{status.san}</div>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                <div className="text-xs text-gray-400 mb-1">好感度</div>
                <div className="text-2xl font-bold text-pink-400">{status.affection}</div>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                <div className="text-xs text-gray-400 mb-1">オタク度</div>
                <div className="text-2xl font-bold text-purple-400">{status.otakuLevel}</div>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                <div className="text-xs text-gray-400 mb-1">所持品</div>
                <div className="text-sm font-medium text-gray-300 truncate">
                  {status.items.length > 0 ? status.items.join(', ') : 'なし'}
                </div>
              </div>
            </div>
            {/* 技能表示エリアを追加 */}
            {status.skills.length > 0 && (
              <div className="mt-4 bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                <div className="text-xs text-gray-400 mb-1">習得技能</div>
                <div className="flex flex-wrap gap-1">
                  {status.skills.map(skill => (
                    <span key={skill} className="text-xs bg-indigo-900/50 text-indigo-200 px-2 py-1 rounded border border-indigo-500/30">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ログエリア */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-900/50 text-sm font-mono border-b border-gray-700">
            {logs.map((log, i) => (
              <div key={i} className="text-gray-400 border-l-2 border-gray-600 pl-2 py-1">
                <span className="text-gray-600 mr-2">[{i + 1}]</span>
                {log}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>

          {/* 選択肢エリア */}
          <div className="p-6 bg-gray-800">
            <div className="space-y-3">
              {currentScene.choices.map((choice, index) => {
                // 条件判定 (conditionがある場合、falseなら表示しない)
                if (choice.condition && !choice.condition(status)) {
                  return null;
                }
                
                return (
                  <button
                    key={index}
                    onClick={() => handleChoice(choice)}
                    className="w-full p-4 text-left bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-lg transition-all transform hover:translate-x-1 shadow-lg border border-indigo-500/30 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{choice.text}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-200">
                        →
                      </span>
                    </div>
                    {choice.skillCheck && (
                      <div className="text-xs text-indigo-200 mt-1 flex items-center gap-1">
                        <span className="bg-indigo-900/50 px-1.5 py-0.5 rounded">
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
