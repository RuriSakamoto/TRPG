// src/components/CharacterCreation.tsx

import React, { useState } from 'react';
import { GameStatus, AVAILABLE_SKILLS } from '../types/game';

type Props = {
  onComplete: (status: Partial<GameStatus>) => void;
};

export const CharacterCreation = ({ onComplete }: Props) => {
  const [skills, setSkills] = useState<string[]>([]);
  const [san, setSan] = useState(60);
  const [otakuLevel, setOtakuLevel] = useState(0);

  const toggleSkill = (skill: string) => {
    setSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleStart = () => {
    onComplete({
      skills,
      san,
      otakuLevel
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-900 text-white flex flex-col items-center justify-center p-4 z-50">
      <h1 className="text-3xl font-bold mb-8 text-indigo-400">キャラクター作成</h1>
      
      <div className="w-full max-w-2xl bg-gray-800 p-6 rounded-xl shadow-lg space-y-6 border border-gray-700">
        {/* ステータス設定 */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold border-b border-gray-600 pb-2">ステータス設定</h2>
          <div className="flex items-center justify-between">
            <span>SAN値 (初期値)</span>
            <input 
              type="number" 
              value={san} 
              onChange={(e) => setSan(Number(e.target.value))}
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 w-20 text-right focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <span>オタク度</span>
            <input 
              type="number" 
              value={otakuLevel} 
              onChange={(e) => setOtakuLevel(Number(e.target.value))}
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 w-20 text-right focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* 技能選択 */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold border-b border-gray-600 pb-2">技能選択</h2>
          <p className="text-sm text-gray-400">習得した技能は判定成功率に+20%のボーナスがつきます。</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {AVAILABLE_SKILLS.map(skill => (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-2 rounded text-sm transition-colors border ${
                  skills.includes(skill)
                    ? 'bg-indigo-600 border-indigo-400 text-white font-bold shadow-[0_0_10px_rgba(79,70,229,0.5)]'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleStart}
          className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-3 rounded-lg mt-8 transition-all transform hover:scale-[1.02] shadow-lg"
        >
          ゲーム開始
        </button>
      </div>
    </div>
  );
};
