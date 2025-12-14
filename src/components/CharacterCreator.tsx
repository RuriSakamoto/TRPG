'use client';

import React, { useState, useEffect } from 'react';
import { CharacterStats, STAT_FORMULAS } from '../types/character';
import { parseDiceFormula, calculateDB, calculateBuild, calculateMOV } from '../lib/dice';
import { ENDINGS } from '../types/game';
import { getClearedEndings, getCompletionRate, clearAllEndings } from '../lib/storage';
import { useRouter } from 'next/navigation';

export const CharacterCreator = () => {
  const router = useRouter();
  const [character, setCharacter] = useState<CharacterStats>({
    STR: 0, CON: 0, POW: 0, DEX: 0, APP: 0, SIZ: 0, INT: 0, EDU: 0, LUK: 0,
    SAN: 0, HP: 0, MP: 0, DB: '0', BUILD: 0, MOV: 0,
    occupationPoints: 0, interestPoints: 0,
  });

  const [rollHistory, setRollHistory] = useState<Record<string, number[]>>({});
  const [clearedEndings, setClearedEndings] = useState<string[]>([]);
  const [showBadges, setShowBadges] = useState(false);

  useEffect(() => {
    // LocalStorageからクリア済みエンディングを読み込む
    setClearedEndings(getClearedEndings());
  }, []);

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
      SAN: Math.min(stats.POW, 99),
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

  const handleStartGame = () => {
    router.push('/character');
  };

  const handleResetBadges = () => {
    if (confirm('全てのエンディング記録をリセットしますか？')) {
      clearAllEndings();
      setClearedEndings([]);
    }
  };

  const completionRate = getCompletionRate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2 text-center">
          TRPG：アベンチュリンの"推し活"
        </h1>
        <p className="text-center text-purple-300 mb-8">
          キャラクター作成 & エンディングコレクション
        </p>

        {/* ★★★ バッジ表示エリア ★★★ */}
        <div className="bg-black/50 backdrop-blur-md rounded-xl p-6 mb-6 border border-purple-500/30">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-purple-300">🏆 エンディングコレクション</h2>
              <p className="text-sm text-gray-400 mt-1">
                達成率: {completionRate}% ({clearedEndings.length}/{Object.keys(ENDINGS).length})
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBadges(!showBadges)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-all"
              >
                {showBadges ? '隠す' : '表示'}
              </button>
              {clearedEndings.length > 0 && (
                <button
                  onClick={handleResetBadges}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-all"
                >
                  リセット
                </button>
              )}
            </div>
          </div>

          {showBadges && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(ENDINGS).map(ending => {
                const isCleared = clearedEndings.includes(ending.id);
                return (
                  <div
                    key={ending.id}
                    className={`relative rounded-lg p-4 border-2 transition-all ${
                      isCleared
                        ? `bg-gradient-to-br ${ending.color} border-white/30 shadow-lg`
                        : 'bg-gray-800/50 border-gray-700 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{isCleared ? ending.icon : '🔒'}</div>
                      <div className="flex-1">
                        <h3 className={`font-bold ${isCleared ? 'text-white' : 'text-gray-500'}`}>
                          {isCleared ? ending.name : '???'}
                        </h3>
                        <p className={`text-sm ${isCleared ? 'text-white/80' : 'text-gray-600'}`}>
                          {isCleared ? ending.description : '未クリア'}
                        </p>
                      </div>
                    </div>
                    {isCleared && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                          ✓ クリア済み
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {completionRate === 100 && (
            <div className="mt-4 p-4 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-500/50 rounded-lg">
              <p className="text-center text-yellow-300 font-bold">
                🎉 全エンディングコンプリート！おめでとうございます！ 🎉
              </p>
            </div>
          )}
        </div>

        {/* ★★★ 既存のキャラクター作成UI ★★★ */}
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

        <div className="bg-black/50 backdrop-blur-md rounded-xl p-6 mb-6 border border-purple-500/30">
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

        <div className="text-center">
          <button
            onClick={handleStartGame}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-4 rounded-lg font-bold text-xl transition-all transform hover:scale-105 shadow-lg"
          >
            ゲームを開始する
          </button>
        </div>

        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>※ 職業技能Pは職業によって算出方法が異なります</p>
          <p>※ 年齢による修正は別途行ってください</p>
        </div>
      </div>
    </div>
  );
};
