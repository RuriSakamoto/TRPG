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
    choices: [{ text: 'リハーサルへ', nextSceneId: 'chap3_wink_check', action: (s) => ({ affection: s.affection - 1 }) }]
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
        action: (s) => ({ san: s.san - 10 })
      },
      { 
        text: '「下手すぎて可愛い」と笑う', 
        nextSceneId: 'chap3_rehearsal_2',
        action: (s) => ({ affection: s.affection - 1 })
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
  {
    id: 'chap3_studio',
    text: 'いよいよ本番。\n監督の要求はエスカレートしていく。\n「もっと密着して！ 恋人繋ぎして！」\n\nレイシオの我慢も限界に近い。\n君の「解釈違いメーター」も爆発寸前だ。\nどうする？',
    choices: [
      { 
        text: '「もう限界だ！教授を解放しろ！」と暴れる', 
        nextSceneId: 'chap3_revolt',
        condition: (s) => s.otakuLevel >= 5
      },
      { 
        text: 'レイシオに判断を委ねる', 
        nextSceneId: 'chap3_ratio_counter'
      }
    ]
  },
  {
    id: 'chap3_revolt',
    text: '「ふざけるな！ 教授はアイドルじゃない、学者だ！」\n君はセットを破壊した（物理）。\n「……よく言った、賭博師」\nレイシオがニヤリと笑った。\n「私も同感だ。こんな茶番は終わりにしよう」',
    choices: [{ text: 'True Endへ', nextSceneId: 'end_true_route' }]
  },
  {
    id: 'chap3_ratio_counter',
    text: '「……いい加減にしたまえ」\nレイシオの声がスタジオに響いた。\n彼はチョークを取り出し、床に数式を書き始めた。\n\n「君の演出プランの非効率性を数式で証明した。これを見ろ」\n「現在の市場トレンドと僕の顧客層（学会）の乖離率は87%。このPVがもたらす損失は計り知れない」\n\n圧倒的な論理（と圧）で、現場が静まり返る。',
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
  }
];
