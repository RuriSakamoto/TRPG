'use client';

import React, { useState } from 'react';
import { CharacterStats, STAT_FORMULAS } from '../types/character';
import { parseDiceFormula, calculateDB, calculateBuild, calculateMOV } from '../lib/dice';

export const CharacterCreator = () => {
  const [character, setCharacter] = useState<CharacterStats>({
    STR: 0, CON: 0, POW: 0, DEX: 0, APP: 0, SIZ: 0, INT: 0, EDU: 0, LUK: 0,
    SAN: 0, HP: 0, MP: 0, DB: '0', BUILD: 0, MOV: 0,
    occupationPoints: 0, interestPoints: 0,
  });

  const [rollHistory, setRollHistory] = useState<Record<string, number[]>>({});

  const rollStat = (statName: keyof typeof STAT_FORMULAS) => {
    const formula = STAT_FORMULAS[statName];
    const baseRoll = parseDiceFormula(formula.dice);
    const finalValue = formula.multiplier ? baseRoll * formula.multiplier : baseRoll;
    
    setRollHistory(prev => ({
      ...prev,
      [statName]: [...(prev[statName] || []), baseRoll]
    }));
    
    setCharacter(prev => {
      const updated = { ...prev, [statName]: finalValue };
      return calculateDerivedStats(updated);
    });
  };

  const rollAllStats = () => {
    const newChar = { ...character };
    const newHistory: Record<string, number[]> = {};
    
    Object.keys(STAT_FORMULAS).forEach(statName => {
      const formula = STAT_FORMULAS[statName as keyof typeof STAT_FORMULAS];
      const baseRoll = parseDiceFormula(formula.dice);
      const finalValue = formula.multiplier ? baseRoll * formula.multiplier : baseRoll;
      
      newChar[statName as keyof typeof STAT_FORMULAS] = finalValue;
      newHistory[statName] = [baseRoll];
    });
    
    setRollHistory(newHistory);
    setCharacter(calculateDerivedStats(newChar));
  };

  const calculateDerivedStats = (stats: CharacterStats): CharacterStats => {
    return {
      ...stats,
      SAN: Math.min(stats.POW, 99), // 上限99を設定
      HP: Math.floor((stats.CON + stats.SIZ) / 10),
      MP: Math.floor(stats.POW / 5),
      DB: calculateDB(stats.STR, stats.SIZ),
      BUILD: calculateBuild(stats.STR, stats.SIZ),
      MOV: calculateMOV(stats.STR, stats.DEX, stats.SIZ),
      occupationPoints: stats.EDU * 2,
      interestPoints: stats.INT * 2,
    };
  };

  const getHalfValue = (value: number) => Math.floor(value / 2);
  const getFifthValue = (value: number) => Math.floor(value / 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          キャラクター作成
        </h1>

        <div className="bg-black/50 backdrop-blur-md rounded-xl p-6 mb-6 border border-purple-500/30">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-purple-300">能力値</h2>
            <button
              onClick={rollAllStats}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-bold transition-all transform hover:scale-105"
            >
              全能力値をロール
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(STAT_FORMULAS).map(([statName, formula]) => {
              const value = character[statName as keyof typeof STAT_FORMULAS];
              const history = rollHistory[statName] || [];
              const lastRoll = history[history.length - 1];
              
              return (
                <div key={statName} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300 font-bold">{statName}</span>
                    <button
                      onClick={() => rollStat(statName as keyof typeof STAT_FORMULAS)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm transition-all"
                    >
                      ロール
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-400 mb-2">
                    {formula.dice}{formula.multiplier ? ` ×${formula.multiplier}` : ''}
                  </div>
                  
                  {lastRoll && (
                    <div className="text-xs text-yellow-400 mb-1">
                      出目: {lastRoll}
                    </div>
                  )}
                  
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">{value}</span>
                    {statName !== 'LUK' && value > 0 && (
                      <div className="text-xs text-gray-400">
                        <span className="mr-2">1/2: {getHalfValue(value)}</span>
                        <span>1/5: {getFifthValue(value)}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-black/50 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
          <h2 className="text-2xl font-bold text-purple-300 mb-4">派生値・ポイント</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">SAN（正気度）</div>
              <div className="text-2xl font-bold text-green-400">{character.SAN}</div>
              <div className="text-xs text-gray-500">POW×1（上限99）</div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">HP（耐久力）</div>
              <div className="text-2xl font-bold text-red-400">{character.HP}</div>
              <div className="text-xs text-gray-500">(CON+SIZ)÷10</div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">MP（マジックP）</div>
              <div className="text-2xl font-bold text-blue-400">{character.MP}</div>
              <div className="text-xs text-gray-500">POW÷5</div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">MOV（移動率）</div>
              <div className="text-2xl font-bold text-yellow-400">{character.MOV}</div>
              <div className="text-xs text-gray-500">STR,DEX,SIZ</div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">DB（ダメボ）</div>
              <div className="text-2xl font-bold text-orange-400">{character.DB}</div>
              <div className="text-xs text-gray-500">STR+SIZ</div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">BUILD（ビルド）</div>
              <div className="text-2xl font-bold text-purple-400">{character.BUILD}</div>
              <div className="text-xs text-gray-500">STR+SIZ</div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">職業技能P</div>
              <div className="text-2xl font-bold text-cyan-400">{character.occupationPoints}</div>
              <div className="text-xs text-gray-500">EDU×2</div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">興味技能P</div>
              <div className="text-2xl font-bold text-pink-400">{character.interestPoints}</div>
              <div className="text-xs text-gray-500">INT×2</div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>※ 職業技能Pは職業によって算出方法が異なります</p>
          <p>※ 年齢による修正は別途行ってください</p>
        </div>
      </div>
    </div>
  );
};
