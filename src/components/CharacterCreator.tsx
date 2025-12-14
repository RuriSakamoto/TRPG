'use client';

import React, { useState, useEffect } from 'react';
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
  const [showCounterAnimation, setShowCounterAnimation] = useState(false);
  const [animatedCount, setAnimatedCount] = useState(0);
  const [isCounterLoading, setIsCounterLoading] = useState(false);

  // カウンターを取得する関数
  const fetchCounter = async () => {
    if (isCounterLoading) return; // 既にロード中の場合はスキップ
    
    setIsCounterLoading(true);
    try {
      const response = await fetch('/api/counter', {
        cache: 'no-store', // キャッシュを無効化
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const data = await response.json();
      if (data.count !== undefined) {
        setTotalCount(data.count);
      }
    } catch (error) {
      console.error('Failed to fetch counter:', error);
    } finally {
      setIsCounterLoading(false);
    }
  };

  useEffect(() => {
    // 認証状態が確定するまで待つ
    if (authLoading) return;

    // ログイン状態に応じてエンディングを読み込む
    const loadEndings = async () => {
      setLoadingEndings(true);
      try {
        const endings = await getClearedEndings(!!user);
        setClearedEndings(endings);

        // ログイン時にLocalStorageのデータをDBに移行
        if (user) {
          await migrateLocalEndingsToDB();
          // 移行後、再度DBから取得
          const updatedEndings = await getClearedEndings(true);
          setClearedEndings(updatedEndings);
        }
      } catch (error) {
        console.error('Failed to load endings:', error);
      } finally {
        setLoadingEndings(false);
      }
    };

    loadEndings();

    // 初回カウンター取得
    fetchCounter();

    // 10秒ごとにカウンターを更新
    const counterInterval = setInterval(() => {
      fetchCounter();
    }, 10000); // 10秒

    // クリーンアップ
    return () => {
      clearInterval(counterInterval);
    };
  }, [user, authLoading]);

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

  // 一括ロール機能
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

  const startGame = async () => {
    const isComplete = Object.keys(STAT_FORMULAS).every(
      stat => character[stat as keyof typeof STAT_FORMULAS] > 0
    );

    if (!isComplete) {
      alert('すべての能力値をロールしてください！');
      return;
    }

    // カウンターをインクリメント
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
        // カウントアップアニメーションを表示
        setShowCounterAnimation(true);
        setAnimatedCount(totalCount || 0); // 現在のカウントから開始
        
        // アニメーション効果
        const duration = 2000; // 2秒
        const steps = 60;
        const startCount = totalCount || 0;
        const increment = (data.count - startCount) / steps;
        let currentStep = 0;

        const timer = setInterval(() => {
          currentStep++;
          if (currentStep >= steps) {
            setAnimatedCount(data.count);
            clearInterval(timer);
            
            // 1秒後にゲーム画面へ遷移
            setTimeout(() => {
              // キャラクターデータと技能をLocalStorageに保存
              const gameData = {
                character,
                skills: selectedSkills,
                otakuLevel: 0, // 隠しパラメータ：常に0で初期化
                san: character.SAN,
              };
              
              localStorage.setItem('character', JSON.stringify(character));
              localStorage.setItem('gameData', JSON.stringify(gameData));
              
              router.push('/game');
            }, 1000);
          } else {
            setAnimatedCount(Math.floor(startCount + increment * currentStep));
          }
        }, duration / steps);
      } else {
        // カウントが取得できなくてもゲームは開始
        startGameWithoutCounter();
      }
    } catch (error) {
      console.error('Failed to increment counter:', error);
      // エラーでもゲームは開始できるようにする
      startGameWithoutCounter();
    }
  };

  // カウンターなしでゲームを開始する関数
  const startGameWithoutCounter = () => {
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
      {/* カウントアップアニメーションオーバーレイ */}
      {showCounterAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="text-center">
            <div className="mb-8">
              <div className="text-4xl sm:text-6xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200 animate-pulse">
                {animatedCount.toLocaleString()}
              </div>
              <div className="text-xl sm:text-2xl md:text-4xl mt-4 text-slate-200">
                人目のアベンチュリン
              </div>
            </div>
            <div className="text-base sm:text-lg text-slate-300 animate-bounce">
              ようこそ、探求者よ...
            </div>
          </div>
        </div>
      )}

      {/* ユーザーメニューを右上に追加 */}
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

        {/* カウンター表示 */}
        {totalCount !== null && (
          <div className="mb-6 text-center">
            <div className="inline-block bg-slate-700/50 border-2 border-amber-600/50 rounded-full px-4 sm:px-8 py-3 sm:py-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl">✨</span>
                <div className="text-sm sm:text-base">
                  <span className="text-slate-300">現在</span>
                  <span className="text-2xl sm:text-3xl font-bold mx-1 sm:mx-2 text-amber-400 transition-all duration-500">
                    {totalCount.toLocaleString()}
                  </span>
                  <span className="text-slate-300">人のアベンチュリンが誕生しています</span>
                </div>
                <span className="text-2xl sm:text-3xl">✨</span>
              </div>
              {/* リアルタイム更新インジケーター */}
              <div className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
                <span className={`inline-block w-2 h-2 rounded-full ${isCounterLoading ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></span>
                <span>リアルタイム更新中</span>
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
          disabled={showCounterAnimation}
          className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg text-lg sm:text-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {showCounterAnimation ? '準備中...' : 'ゲームを開始'}
        </button>
      </div>
    </div>
  );
};
