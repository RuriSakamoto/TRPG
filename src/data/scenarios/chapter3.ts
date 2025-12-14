import { Scene } from '../../types/game';

export const chapter3: Scene[] = [
  {
    id: 'chap3_intro',
    text: '【第3章：解釈違いのPV撮影】\n\nカンパニー広報部からの依頼。\nそれは、アベンチュリンにとって悪夢の始まりだった。\n\n撮影当日。スタジオの楽屋。\n「……この衣装はなんだ」\nレイシオが不満げに自身の衣装を見下ろしている。\nフリル満載のアイドル風スーツだ。',
    choices: [
      { text: '「似合ってるよ（棒読み）」', nextSceneId: 'chap3_costume_lie' },
      { text: '「今すぐ脱いで！解釈違いだ！」', nextSceneId: 'chap3_costume_angry' }
    ]
  },
  {
    id: 'chap3_costume_lie',
    text: '「似合ってるよ、教授。王子様みたいだ」\n「……君の目は節穴か？ どう見ても道化だ」\nレイシオは不機嫌そうだ。信頼度が下がった気がする。',
    choices: [{ text: 'リハーサルへ', nextSceneId: 'chap3_wink_check', action: (s) => ({ ...s, affection: s.affection - 1 }) }]
  },
  {
    id: 'chap3_costume_angry',
    text: '「だよね！？ 教授はもっとこう、シンプルで知的な装いが至高なんだよ！」\n意気投合した二人だが、監督は止まらない。\n\n「じゃあリハいきまーす！ まずは『ウィンク』の練習ね！」\n「レイシオちゃん、カメラに向かってバチコーン！とお願い！」\n\n地獄のリハーサルが始まった。',
    choices: [
      { text: 'レイシオのウィンクを見る', nextSceneId: 'chap3_wink_check' }
    ]
  },
  {
    id: 'chap3_wink_check',
    text: 'レイシオは苦虫を噛み潰したような顔で、ぎこちなく片目を閉じた。\nパチッ。\n\n（SAN値チェック：成功で尊死、失敗で爆笑）',
    choices: [
      { 
        text: '尊すぎて倒れる', 
        nextSceneId: 'chap3_rehearsal_2',
        action: (s) => ({ ...s, san: s.san - 10 })
      },
      { 
        text: '「下手すぎて可愛い」と笑う', 
        nextSceneId: 'chap3_rehearsal_2',
        action: (s) => ({ ...s, affection: s.affection - 1 })
      }
    ]
  },
  {
    id: 'chap3_rehearsal_2',
    text: '「次は『壁ドン』だ！ アベンチュリンちゃんを壁に追い詰めて、甘い言葉を囁いて！」\n\nレイシオが君に近づく。\nその顔は真っ赤だ。\n「……なぜ僕がこんなことを」\n「仕事だからね、教授…（僕も恥ずかしい）」',
    choices: [
      { text: '本番へ挑む', nextSceneId: 'chap3_studio' }
    ]
  },

  // --- 運命の分岐点 ---
  {
    id: 'chap3_studio',
    text: 'いよいよ本番。\n監督の要求はエスカレートしていく。\n「もっと密着して！ 恋人繋ぎして！」\n\nレイシオの我慢も限界に近い。\n君の「解釈違いメーター」も爆発寸前だ。\nどうする？',
    choices: [
      // True Endルート A: オタク度が高い場合
      { 
        text: '「もう限界だ！教授を解放しろ！」と暴れる', 
        nextSceneId: 'chap3_revolt',
        condition: (s) => s.otakuLevel >= 5 // 第1章でグッズ磨き等を徹底していないと出ない
      },
      // True Endルート B: 好感度が高い場合
      {
        text: 'レイシオを信じて目配せする',
        nextSceneId: 'chap3_ratio_counter',
        condition: (s) => s.affection >= 3 // 第2章で勝利していないと出ない
      },
      // Normal Endルート (条件を満たさない場合のデフォルト)
      { 
        text: '仕事だと割り切って耐える', 
        nextSceneId: 'end_normal_route'
      },
      // Bad Endルート
      {
        text: 'あまりの解釈違いに気絶する',
        nextSceneId: 'end_bad_route',
        action: (s) => ({ ...s, san: 0 })
      }
    ]
  },

  // --- True End ルート ---
  {
    id: 'chap3_revolt',
    text: '「ふざけるな！ 教授はアイドルじゃない、学者だ！」\n君はセットを破壊した（物理）。\n「……よく言った、賭博師」\nレイシオがニヤリと笑った。\n「私も同感だ。こんな茶番は終わりにしよう」',
    choices: [{ text: 'True Endへ', nextSceneId: 'end_true_route' }]
  },
  {
    id: 'chap3_ratio_counter',
    text: '君の視線に気づいたレイシオが、小さく頷いた。\n「……いい加減にしたまえ」\n\n彼はチョークを取り出し、床に数式を書き始めた。\n「君の演出プランの非効率性を数式で証明した。これを見ろ」\n圧倒的な論理（と圧）で、現場が静まり返る。',
    choices: [
      { text: '「さすが教授！」と拍手する', nextSceneId: 'end_true_route' }
    ]
  },
  {
    id: 'end_true_route',
    text: '【True End: 究極の解釈一致】\n\n結局、PVはレイシオの主導で作り直された。\n完成したのは、ただひたすらに彼が講義をするだけの映像。\nだが、その眼差しは真剣で、美しかった。\n\n「これで満足か、賭博師」\n「ああ、最高だ。これこそが僕の推しだよ」\n\n君のコレクションに、また一つ至高の映像が加わった。\n（クリア特典：タイトル画面に「True End」バッジ追加）',
    choices: [
      { 
        text: 'タイトルへ戻る', 
        nextSceneId: 'start', 
        action: (s) => ({ 
          hp: 10, san: 60, affection: 0, items: [], otakuLevel: 0, turn: 0,
          clearedEndings: [...s.clearedEndings, 'true_end'],
          loopCount: s.loopCount + 1
        }) 
      }
    ]
  },

  // --- Normal End ルート ---
  {
    id: 'end_normal_route',
    text: '【Normal End: 妥協と供給】\n\n君は唇を噛み締めて耐えた。\n撮影は強行され、レイシオはぎこちなくウィンクをした。\n\n完成したPVは、キラキラしたエフェクト満載のアイドル動画だった。\n世間では「ギャップ萌え」と大好評で、再生数は100億回を突破した。\n\n「……まあ、顔が良いから許すか」\n解釈違いだが、供給は供給だ。\n君は複雑な気持ちで「いいね」を押した。',
    choices: [
      { 
        text: 'タイトルへ戻る', 
        nextSceneId: 'start', 
        action: (s) => ({ 
          hp: 10, san: 60, affection: 0, items: [], otakuLevel: 0, turn: 0,
          clearedEndings: [...s.clearedEndings, 'normal_end'],
          loopCount: s.loopCount + 1
        }) 
      }
    ]
  },

  // --- Bad End ルート ---
  {
    id: 'end_bad_route',
    text: '【Bad End: 虚無】\n\nプツン。\n君の中で何かが切れた。\n\n「違う……僕の好きな教授はこんなんじゃない……」\n\nあまりのショックに、君は寝込んだ。\n後日公開されたPVを見る気力もなく、ファンクラブの更新も忘れてしまった。\n推しへの熱が、急速に冷めていくのを感じながら……。',
    choices: [
      { 
        text: 'タイトルへ戻る', 
        nextSceneId: 'start', 
        action: (s) => ({ 
          hp: 10, san: 60, affection: 0, items: [], otakuLevel: 0, turn: 0,
          clearedEndings: [...s.clearedEndings, 'bad_end'],
          loopCount: s.loopCount + 1
        }) 
      }
    ]
  }
];
