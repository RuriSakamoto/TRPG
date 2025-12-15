'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CharacterStats, STAT_FORMULAS } from '../types/character';
import { parseDiceFormula, calculateDB, calculateBuild, calculateMOV } from '../lib/dice';
import { ENDINGS, AVAILABLE_SKILLS } from '../types/game';
import { getClearedEndings, getCompletionRate, migrateLocalEndingsToDB } from '../lib/storage';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import UserMenu from './UserMenu';
import { Dices } from 'lucide-react';

export const CharacterCreator = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  // キャラクター能力値
  const [character, setCharacter] = useState<CharacterStats>({
    STR: 0, CON: 0, POW: 0, DEX: 0, APP: 0, SIZ: 0, INT: 0, EDU: 0, LUK: 0,
    SAN: 0, HP: 0, MP: 0, DB: '0', BUILD: 0, MOV: 0,
    occupationPoints: 0, interestPoints: 0,
  });

  // 技能選択
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const [rollHistory, setRollHistory] = useState<Record<string, number[]>>({});
  const [clearedEndings, setClearedEndings] = useState<string[]>([]);
  const [showBadges, setShowBadges] = useState(false);
  const [loadingEndings, setLoadingEndings] = useState(true);

  // カウンター関連
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const hasIncrementedRef = useRef(false);
  const counterIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // カウンターを取得する関数
  const fetchCounter = async () => {
    try {
      const response = await fetch('/api/counter', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.count !== undefined && data.count !== null) {
        setTotalCount(data.count);
      } else {
        setTotalCount(0);
      }
    } catch (error) {
      console.error('カウンター取得エラー:', error);
      setTotalCount(0);
    }
  };

  // カウンターをインクリメントする関数（静かに実行）
  const incrementCounter = async () => {
    if (hasIncrementedRef.current) {
      return;
    }

    try {
      const response = await fetch('/api/counter/increment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('カウンターの更新に失敗しました');
      }

      const data = await response.json();
      
      if (data.count) {
        hasIncrementedRef.current = true;
        setTotalCount(data.count);
        
        // 定期取得を開始
        startCounterInterval();
      }
    } catch (error) {
      console.error('カウンターインクリメントエラー:', error);
      startCounterInterval();
    }
  };

  // 定期取得を開始する関数
  const startCounterInterval = () => {
    if (counterIntervalRef.current) {
      clearInterval(counterIntervalRef.current);
    }
    
    counterIntervalRef.current = setInterval(() => {
      fetchCounter();
    }, 10000);
  };

  useEffect(() => {
    if (authLoading) return;

    const loadEndings = async () => {
      setLoadingEndings(true);
      try {
        const endings = await getClearedEndings(!!user);
        setClearedEndings(endings);

        if (user) {
          await migrateLocalEndingsToDB();
          const updatedEndings = await getClearedEndings(true);
          setClearedEndings(updatedEndings);
        }
      } catch (error) {
        console.error('エンディング読み込みエラー:', error);
      } finally {
        setLoadingEndings(false);
      }
    };

    loadEndings();

    // 初回カウンター取得
    fetchCounter();

    // クリーンアップ
    return () => {
      if (counterIntervalRef.current) {
        clearInterval(counterIntervalRef.current);
      }
    };
  }, [user, authLoading]);

  // コンポーネントマウント時にカウンターをインクリメント（静かに）
  useEffect(() => {
    if (!hasIncrementedRef.current && totalCount !== null) {
      const timer = setTimeout(() => {
        incrementCounter();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [totalCount]);

  const rollDice = (statName: keyof typeof STAT_FORMULAS) => {
    const formula = STAT_FORMULAS[statName];
    const result = parseDiceFormula(formula);
    
    setRollHistory(prev => ({
      ...prev,
      [statName]: [...(prev[statName] || []), result.total]
    }));

    updateCharacterStat(statName, result.total);
  };

  const updateCharacterStat = (statName: keyof typeof STAT_FORMULAS, value: number) => {
    setCharacter(prev => {
      const updated = { ...prev, [statName]: value };
      
      if (statName === 'POW') {
        updated.SAN = value;
        updated.MP = value;
      }
      if (statName === 'CON' || statName === 'SIZ') {
        updated.HP = Math.floor((updated.CON + updated.SIZ) / 10);
      }
      if (statName === 'STR' || statName === 'SIZ') {
        updated.DB = calculateDB(updated.STR, updated.SIZ);
        updated.BUILD = calculateBuild(updated.STR, updated.SIZ);
      }
      if (statName === 'DEX' || statName === 'STR' || statName === 'SIZ') {
        updated.MOV = calculateMOV(updated.DEX, updated.STR, updated.SIZ);
      }
      if (statName === 'EDU') {
        updated.occupationPoints = updated.EDU * 4;
        updated.interestPoints = updated.INT * 2;
      }
      if (statName === 'INT') {
        updated.interestPoints = updated.INT * 2;
      }

      return updated;
    });
  };

  const rollAllDice = () => {
    const stats = Object.keys(STAT_FORMULAS) as Array<keyof typeof STAT_FORMULAS>;
    const newHistory: Record<string, number[]> = { ...rollHistory };
    
    stats.forEach(stat => {
      const formula = STAT_FORMULAS[stat];
      const result = parseDiceFormula(formula);
      newHistory[stat] = [...(newHistory[stat] || []), result.total];
      updateCharacterStat(stat, result.total);
    });

    setRollHistory(newHistory);
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const startGame = () => {
    const isComplete = Object.keys(STAT_FORMULAS).every(
      stat => character[stat as keyof typeof STAT_FORMULAS] > 0
    );

    if (!isComplete) {
      alert('すべての能力値をロールしてください！');
      return;
    }

    const gameData = {
      character,
      skills: selectedSkills,
      otakuLevel: 0,
      san: character.SAN,
    };
    
    localStorage.setItem('character', JSON.stringify(character));
    localStorage.setItem('gameData', JSON.stringify(gameData));
    
    router.push('/game');
  };

  const completionRate = getCompletionRate(clearedEndings, ENDINGS.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 text-white p-4 sm:p-6 lg:p-8">
      <div className="absolute top-4 right-4 z-10">
        <UserMenu />
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-amber-500">
            推し活TRPG
          </h1>
          <p className="text-lg sm:text-xl text-slate-300">Aventurine's Fan Activity</p>
        </div>

        {/* カウンター表示（シンプル版） */}
        {totalCount !== null && (
          <div className="mb-6 text-center">
            <div className="inline-block bg-slate-700/50 border-2 border-amber-600/50 rounded-full px-4 sm:px-8 py-3 sm:py-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl">✨</span>
                <div className="text-sm sm:text-base">
                  <span className="text-2xl sm:text-3xl font-bold text-amber-400 transition-all duration-500">
                    {totalCount.toLocaleString()}
                  </span>
                  <span className="text-slate-300 ml-2">人のアベンチュリンが誕生しています</span>
                </div>
                <span className="text-2xl sm:text-3xl">✨</span>
              </div>
            </div>
          </div>
        )}

        {/* エンディングコレクション */}
        <div className="mb-6 sm:mb-8 bg-slate-800/60 backdrop-blur-md rounded-lg p-4 sm:p-6 border border-slate-600">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">🏆 エンディングコレクション</h2>
            <button
              onClick={() => setShowBadges(!showBadges)}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors text-sm sm:text-base w-full sm:w-auto"
            >
              {showBadges ? '隠す' : '表示する'}
            </button>
          </div>
          
          {loadingEndings ? (
            <div className="text-center py-4">
              <p className="text-slate-300">読み込み中...</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-base sm:text-lg text-slate-200">達成率</span>
                  <span className="text-xl sm:text-2xl font-bold text-amber-400">{completionRate}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3 sm:h-4">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-amber-600 h-3 sm:h-4 rounded-full transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-2">
                  {clearedEndings.length} / {ENDINGS.length} エンディング達成
                </p>
              </div>

              {showBadges && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mt-4">
                  {ENDINGS.map((ending) => {
                    const isCleared = clearedEndings.includes(ending.id);
                    return (
                      <div
                        key={ending.id}
                        className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                          isCleared
                            ? 'bg-gradient-to-br from-amber-900/30 to-amber-800/30 border-amber-500'
                            : 'bg-slate-700/50 border-slate-600'
                        }`}
                      >
                        <div className="text-2xl sm:text-3xl mb-2">{isCleared ? ending.icon : '🔒'}</div>
                        <h3 className="font-bold text-xs sm:text-sm mb-1 text-slate-100">
                          {isCleared ? ending.title : '???'}
                        </h3>
                        <p className="text-xs text-slate-300">
                          {isCleared ? ending.description : '未達成'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* キャラクター作成 */}
        <div className="bg-slate-800/60 backdrop-blur-md rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-slate-600">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">キャラクター作成</h2>
            <button
              onClick={rollAllDice}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-all shadow-lg w-full sm:w-auto justify-center"
            >
              <Dices size={20} />
              <span>一括ロール</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {Object.entries(STAT_FORMULAS).map(([stat, formula]) => (
              <div key={stat} className="bg-slate-700/50 rounded-lg p-3 sm:p-4 border border-slate-600">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-base sm:text-lg text-slate-100">{stat}</span>
                  <span className="text-xs sm:text-sm text-slate-400">{formula}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => rollDice(stat as keyof typeof STAT_FORMULAS)}
                    className="flex-1 bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400 text-white font-bold py-2 px-3 sm:px-4 rounded transition-all text-sm sm:text-base"
                  >
                    ロール
                  </button>
                  <div className="w-12 sm:w-16 text-center">
                    <span className="text-xl sm:text-2xl font-bold text-amber-400">
                      {character[stat as keyof CharacterStats] || '-'}
                    </span>
                  </div>
                </div>

                {rollHistory[stat] && rollHistory[stat].length > 0 && (
                  <div className="mt-2 text-xs text-slate-400 truncate">
                    履歴: {rollHistory[stat].join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 派生能力値 */}
          <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-slate-700/50 rounded-lg p-3 sm:p-4 text-center border border-slate-600">
              <div className="text-xs sm:text-sm text-slate-400 mb-1">HP</div>
              <div className="text-xl sm:text-2xl font-bold text-amber-400">{character.HP || '-'}</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3 sm:p-4 text-center border border-slate-600">
              <div className="text-xs sm:text-sm text-slate-400 mb-1">MP</div>
              <div className="text-xl sm:text-2xl font-bold text-amber-400">{character.MP || '-'}</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3 sm:p-4 text-center border border-slate-600">
              <div className="text-xs sm:text-sm text-slate-400 mb-1">SAN</div>
              <div className="text-xl sm:text-2xl font-bold text-amber-400">{character.SAN || '-'}</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3 sm:p-4 text-center border border-slate-600">
              <div className="text-xs sm:text-sm text-slate-400 mb-1">DB</div>
              <div className="text-xl sm:text-2xl font-bold text-amber-400">{character.DB || '-'}</div>
            </div>
          </div>
        </div>

        {/* 技能選択エリア */}
        <div className="bg-slate-800/60 backdrop-blur-md rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-slate-600">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-100">技能選択</h2>
          <p className="text-xs sm:text-sm text-slate-300 mb-4">
            習得した技能は判定成功率に+20%のボーナスがつきます。
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {AVAILABLE_SKILLS.map(skill => (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all border-2 ${
                  selectedSkills.includes(skill)
                    ? 'bg-amber-700 border-amber-500 text-white shadow-lg shadow-amber-900/50'
                    : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* ゲーム開始ボタン */}
        <button
          onClick={startGame}
          className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg text-lg sm:text-xl transition-all transform hover:scale-105 shadow-lg"
        >
          ゲームを開始
        </button>
      </div>
    </div>
  );
};
