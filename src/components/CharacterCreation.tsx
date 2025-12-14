import React, { useState } from 'react';

type Stats = {
  str: number;
  dex: number;
  pow: number;
  app: number;
};

type Props = {
  onComplete: (stats: Stats) => void;
};

export const CharacterCreation = ({ onComplete }: Props) => {
  const [stats, setStats] = useState<Stats>({ str: 0, dex: 0, pow: 0, app: 0 });

  const rollDice = () => {
    // 3d6のロール
    const roll = () => Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
    setStats({
      str: roll(),
      dex: roll(),
      pow: roll(),
      app: roll(),
    });
  };

  const isValid = stats.str > 0;

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-gray-900 text-white p-8 select-none">
      <h1 className="text-3xl font-bold mb-12 text-indigo-300 drop-shadow-lg">キャラクター作成</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        <div className="flex flex-col items-center p-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <span className="text-gray-400 mb-2 text-sm font-bold">STR (筋力)</span>
          <span className="text-4xl font-bold text-red-400 font-mono">{stats.str || '-'}</span>
        </div>
        <div className="flex flex-col items-center p-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <span className="text-gray-400 mb-2 text-sm font-bold">DEX (敏捷)</span>
          <span className="text-4xl font-bold text-green-400 font-mono">{stats.dex || '-'}</span>
        </div>
        <div className="flex flex-col items-center p-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <span className="text-gray-400 mb-2 text-sm font-bold">POW (精神)</span>
          <span className="text-4xl font-bold text-blue-400 font-mono">{stats.pow || '-'}</span>
        </div>
        <div className="flex flex-col items-center p-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <span className="text-gray-400 mb-2 text-sm font-bold">APP (外見)</span>
          <span className="text-4xl font-bold text-pink-400 font-mono">{stats.app || '-'}</span>
        </div>
      </div>

      <div className="flex gap-6">
        <button 
          onClick={rollDice}
          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold transition-all transform hover:scale-105 shadow-lg"
        >
          ダイスを振る
        </button>
        <button 
          onClick={() => onComplete(stats)}
          disabled={!isValid}
          className={`px-8 py-4 rounded-lg font-bold transition-all transform shadow-lg ${
            isValid 
              ? 'bg-yellow-500 hover:bg-yellow-400 text-black hover:scale-105' 
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          決定して開始
        </button>
      </div>
    </div>
  );
};
