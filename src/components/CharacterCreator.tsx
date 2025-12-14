'use client';

import React, { useState, useEffect } from 'react';
import { CharacterStats, STAT_FORMULAS } from '../types/character';
import { parseDiceFormula, calculateDB, calculateBuild, calculateMOV } from '../lib/dice';
import { ENDINGS, AVAILABLE_SKILLS } from '../types/game';
import { getClearedEndings, getCompletionRate, migrateLocalEndingsToDB } from '../lib/storage';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import UserMenu from './UserMenu';

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
  const [otakuLevel, setOtakuLevel] = useState(0);

  const [rollHistory, setRollHistory] = useState<Record<string, number[]>>({});
  const [clearedEndings, setClearedEndings] = useState<string[]>([]);
  const [showBadges, setShowBadges] = useState(false);
  const [loadingEndings, setLoadingEndings] = useState(true);

  // カウンター関連
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [showCounterAnimation, setShowCounterAnimation] = useState(false);
  const [animatedCount, setAnimatedCount] = useState(0);

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

    // 現在のカウンターを取得
    fetchCounter();
  }, [user, authLoading]);

  const fetchCounter = async () => {
    try {
      const response = await fetch('/api/counter');
      const data = await response.json();
      setTotalCount(data.count);
    } catch (error) {
      console.error('Failed to fetch counter:', error);
    }
  };

  const rollDice = (statName: keyof typeof STAT_FORMULAS) => {
    const formula = STAT_FORMULAS[statName];
    const result = parseDiceFormula(formula);
    
    setRollHistory(prev => ({
      ...prev,
      [statName]: [...(prev[statName] || []), result.total]
    }));

    setCharacter(prev => {
      const updated = { ...prev, [statName]: result.total };
      
      if (statName === 'POW') {
        updated.SAN = result.total;
        updated.MP = result.total;
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

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const startGame = async () => {
    const isComplete = Object.keys(STAT_FORMULAS).every(
      stat => character[stat as keyof CharacterStats] > 0
    );

    if (!isComplete) {
      alert('すべての能力値をロールしてください！');
      return;
    }

    // カウンターをインクリメント
    try {
      const response = await fetch('/api/counter/increment', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.count) {
        // カウントアップアニメーションを表示
        setShowCounterAnimation(true);
        setAnimatedCount(0);
        
        // アニメーション効果
        const duration = 2000; // 2秒
        const steps = 60;
        const increment = data.count / steps;
        let currentStep = 0;

        const timer = setInterval(() => {
          currentStep++;
          if (currentStep >= steps) {
            setAnimatedCount(data.count);
            clearInterval(timer);
            
            // 3秒後にゲーム画面へ遷移
            setTimeout(() => {
              // キャラクターデータと技能をLocalStorageに保存
              const gameData = {
                character,
                skills: selectedSkills,
                otakuLevel,
                san: character.SAN,
              };
              
              localStorage.setItem('character', JSON.stringify(character));
              localStorage.setItem('gameData', JSON.stringify(gameData));
              
              router.push('/game');
            }, 1000);
          } else {
            setAnimatedCount(Math.floor(increment * currentStep));
          }
        }, duration / steps);
      }
    } catch (error) {
      console.error('Failed to increment counter:', error);
      // エラーでもゲームは開始できるようにする
      alert('カウンターの更新に失敗しましたが、ゲームを開始します。');
      
      const gameData = {
        character,
        skills: selectedSkills,
        otakuLevel,
        san: character.SAN,
      };
      
      localStorage.setItem('character', JSON.stringify(character));
      localStorage.setItem('gameData', JSON.stringify(gameData));
      
      router.push('/game');
    }
  };

  const completionRate = getCompletionRate(clearedEndings, ENDINGS.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-8">
      {/* カウントアップアニメーションオーバーレイ */}
      {showCounterAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="mb-8">
              <div className="text-6xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 animate-pulse">
                {animatedCount.toLocaleString()}
              </div>
              <div className="text-2xl md:text-4xl mt-4 text-white">
                人目のアベンチュリン
              </div>
            </div>
            <div className="text-lg text-purple-200 animate-bounce">
              ようこそ、探求者よ...
            </div>
          </div>
        </div>
      )}

      {/* ユーザーメニューを右上に追加 */}
      <div className="absolute top-4 right-4">
        <UserMenu />
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
            推し活TRPG
          </h1>
          <p className="text-xl text-purple-200">Aventurine's Fan Activity</p>
        </div>

        {/* カウンター表示 */}
        {totalCount !== null && (
          <div className="mb-6 text-center">
            <div className="inline-block bg-gradient-to-r from-yellow-400/20 to-pink-400/20 border-2 border-yellow-400/50 rounded-full px-8 py-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="text-3xl">✨</span>
                <div>
                  <span className="text-sm text-yellow-200">現在</span>
                  <span className="text-3xl font-bold mx-2 bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-pink-300">
                    {totalCount.toLocaleString()}
                  </span>
                  <span className="text-sm text-yellow-200">人のアベンチュリンが誕生しています</span>
                </div>
                <span className="text-3xl">✨</span>
              </div>
            </div>
          </div>
        )}

        {/* エンディングコレクション */}
        <div className="mb-8 bg-white/10 backdrop-blur-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">🏆 エンディングコレクション</h2>
            <button
              onClick={() => setShowBadges(!showBadges)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              {showBadges ? '隠す' : '表示する'}
            </button>
          </div>
          
          {loadingEndings ? (
            <div className="text-center py-4">
              <p className="text-purple-200">読み込み中...</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg">達成率</span>
                  <span className="text-2xl font-bold">{completionRate}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-purple-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <p className="text-sm text-purple-200 mt-2">
                  {clearedEndings.length} / {ENDINGS.length} エンディング達成
                </p>
              </div>

              {showBadges && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                  {ENDINGS.map((ending) => {
                    const isCleared = clearedEndings.includes(ending.id);
                    return (
                      <div
                        key={ending.id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          isCleared
                            ? 'bg-gradient-to-br from-yellow-400/20 to-orange-400/20 border-yellow-400'
                            : 'bg-gray-800/50 border-gray-600'
                        }`}
                      >
                        <div className="text-3xl mb-2">{isCleared ? ending.icon : '🔒'}</div>
                        <h3 className="font-bold text-sm mb-1">
                          {isCleared ? ending.title : '???'}
                        </h3>
                        <p className="text-xs text-gray-300">
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
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-8">
          <h2 className="text-3xl font-bold mb-6 text-center">キャラクター作成</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(STAT_FORMULAS).map(([stat, formula]) => (
              <div key={stat} className="bg-white/5 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-lg">{stat}</span>
                  <span className="text-sm text-purple-300">{formula}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => rollDice(stat as keyof typeof STAT_FORMULAS)}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-2 px-4 rounded transition-all"
                  >
                    ロール
                  </button>
                  <div className="w-16 text-center">
                    <span className="text-2xl font-bold">
                      {character[stat as keyof CharacterStats] || '-'}
                    </span>
                  </div>
                </div>

                {rollHistory[stat] && rollHistory[stat].length > 0 && (
                  <div className="mt-2 text-xs text-purple-200">
                    履歴: {rollHistory[stat].join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 派生能力値 */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-sm text-purple-300 mb-1">HP</div>
              <div className="text-2xl font-bold">{character.HP || '-'}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-sm text-purple-300 mb-1">MP</div>
              <div className="text-2xl font-bold">{character.MP || '-'}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-sm text-purple-300 mb-1">SAN</div>
              <div className="text-2xl font-bold">{character.SAN || '-'}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-sm text-purple-300 mb-1">DB</div>
              <div className="text-2xl font-bold">{character.DB || '-'}</div>
            </div>
          </div>
        </div>

        {/* 技能選択エリア */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">技能選択</h2>
          <p className="text-sm text-purple-200 mb-4">
            習得した技能は判定成功率に+20%のボーナスがつきます。
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
            {AVAILABLE_SKILLS.map(skill => (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all border-2 ${
                  selectedSkills.includes(skill)
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/50'
                    : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>

          {/* オタク度設定 */}
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">初期オタク度</span>
              <input 
                type="number" 
                value={otakuLevel} 
                onChange={(e) => setOtakuLevel(Number(e.target.value))}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-24 text-right focus:outline-none focus:border-indigo-500 text-white"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        {/* ゲーム開始ボタン */}
        <button
          onClick={startGame}
          disabled={showCounterAnimation}
          className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {showCounterAnimation ? '準備中...' : 'ゲームを開始'}
        </button>
      </div>
    </div>
  );
};
