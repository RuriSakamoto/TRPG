'use client';

import React, { useState } from 'react';
import { Attributes, Skills } from '../types/game';

type Props = {
  onComplete: (name: string, attrs: Attributes, skills: Skills) => void;
};

export const CharacterCreation = ({ onComplete }: Props) => {
  const [name, setName] = useState('アベンチュリン');
  const [points, setPoints] = useState(20); // 割り振り可能ポイント

  const [attributes, setAttributes] = useState<Attributes>({
    STR: 10, DEX: 12, POW: 12, APP: 18
  });

  const [skills, setSkills] = useState<Skills>({
    observation: 50,
    listening: 50,
    persuasion: 70,
    psychology: 60,
    passion: 60
  });

  const handleSkillChange = (key: keyof Skills, delta: number) => {
    if (points - delta < 0) return;
    if (skills[key] + delta < 0) return;
    if (skills[key] + delta > 99) return;

    setSkills(prev => ({ ...prev, [key]: prev[key] + delta }));
    setPoints(prev => prev - delta);
  };

  return (
    <div className="w-full h-screen bg-slate-900 text-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
        <h1 className="text-2xl font-bold mb-6 text-center text-indigo-400">キャラクターシート作成</h1>

        {/* 名前入力 */}
        <div className="mb-6">
          <label className="block text-sm font-bold mb-2 text-gray-300">名前</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* 能力値 (固定表示) */}
        <div className="mb-6 grid grid-cols-4 gap-4 text-center">
          <div className="bg-slate-700 p-3 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">STR</div>
            <div className="font-bold text-xl">{attributes.STR}</div>
          </div>
          <div className="bg-slate-700 p-3 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">DEX</div>
            <div className="font-bold text-xl">{attributes.DEX}</div>
          </div>
          <div className="bg-slate-700 p-3 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">POW</div>
            <div className="font-bold text-xl">{attributes.POW}</div>
          </div>
          <div className="bg-slate-700 p-3 rounded-lg border border-yellow-600/30">
            <div className="text-xs text-yellow-400 mb-1">APP</div>
            <div className="font-bold text-xl text-yellow-300">{attributes.APP}</div>
          </div>
        </div>

        {/* 技能割り振り */}
        <div className="mb-8">
          <div className="flex justify-between mb-4 items-end border-b border-slate-700 pb-2">
            <h2 className="font-bold text-lg">技能設定</h2>
            <span className={`font-bold ${points > 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
              残りポイント: {points}
            </span>
          </div>
          
          <div className="space-y-3">
            {[
              { key: 'observation', label: '目星 (探索力)' },
              { key: 'listening', label: '聞き耳 (察知力)' },
              { key: 'persuasion', label: '言いくるめ (論破力)' },
              { key: 'psychology', label: '心理学 (読心術)' },
              { key: 'passion', label: '情熱 (推しへの愛)' },
            ].map((skill) => (
              <div key={skill.key} className="flex items-center justify-between bg-slate-900/50 p-3 rounded hover:bg-slate-900 transition-colors">
                <span className="text-gray-300">{skill.label}</span>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleSkillChange(skill.key as keyof Skills, -5)}
                    className="w-8 h-8 flex items-center justify-center bg-slate-700 rounded hover:bg-red-900/80 text-gray-300 hover:text-white transition-colors"
                    disabled={skills[skill.key as keyof Skills] <= 0}
                  >-</button>
                  <span className="w-10 text-center font-mono font-bold text-lg">{skills[skill.key as keyof Skills]}</span>
                  <button 
                    onClick={() => handleSkillChange(skill.key as keyof Skills, 5)}
                    className="w-8 h-8 flex items-center justify-center bg-slate-700 rounded hover:bg-green-900/80 text-gray-300 hover:text-white transition-colors"
                    disabled={points < 5}
                  >+</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={() => onComplete(name, attributes, skills)}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg shadow-indigo-900/20"
        >
          ゲームを開始する
        </button>
      </div>
    </div>
  );
};
