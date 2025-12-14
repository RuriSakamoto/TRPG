import { Scene } from '../../types/game';

export const chapter2: Scene[] = [
  {
    id: 'chap2_intro_safe',
    text: '【第2章：ベリタス・レイシオの恋人は…】\n\nあの日から数日後。\nリビングでくつろいでいると、レイシオが分厚いファイルを持って現れた。\n「アベンチュリン。君の部屋の清掃業者が、ベッドの下から『奇妙な祭壇』を発見したと報告があった」\n\n……詰んだ。',
    choices: [
      { text: '「それは魔除けだよ」と嘘をつく', nextSceneId: 'chap2_lie_check' },
      { text: '素直に認めて土下座する', nextSceneId: 'chap2_dogeza' }
    ]
  },
  {
    id: 'chap2_lie_check',
    text: '「魔除け？ ほう…僕の写真が魔除けになると？」\nレイシオは眉をひそめた。\n「つまり君にとって僕は、魔物よりも恐ろしい存在ということか？」\n\n墓穴を掘った。彼の機嫌が目に見えて悪くなっている。',
    choices: [
      { text: '必死に弁解する', nextSceneId: 'chap2_debate_start', action: (s) => ({ affection: s.affection - 1 }) }
    ]
  },
  {
    id: 'chap2_dogeza',
    text: '床に額をこすりつけた。\n「ごめん、教授！ 君が尊すぎてつい！」\n\n「……はぁ」\n深い溜息が降ってくる。\n「顔を上げろ。怒っているわけではない。ただ、理解ができないだけだ」\n\n彼はファイルを机に置いた。\n「君のその『推し活』とやらの定義と、僕へのメリットを説明しろ。納得できれば許容する」',
    choices: [
      { text: 'プレゼンを開始する', nextSceneId: 'chap2_debate_start' }
    ]
  },
  {
    id: 'chap2_debate_start',
    text: '「第一の議題。君が収集している『グッズ』についてだ」\nレイシオは押収品リストを読み上げた。\n「アクリルスタンド、缶バッジ、抱き枕……これらは単なるプラスチックと布だ。これに大金を投じる合理的理由はあるのか？」',
    choices: [
      { 
        text: '「保存用、観賞用、布教用だ！」 (オタクの常識)', 
        nextSceneId: 'chap2_round1_win',
        condition: (s) => s.otakuLevel >= 3
      },
      { 
        text: '「予備がないと不安だから…」 (弱気)', 
        nextSceneId: 'chap2_round1_lose'
      }
    ]
  },
  {
    id: 'chap2_round1_win',
    text: '「保存用、観賞用、布教用…？」\nレイシオは眉をひそめたが、少し考え込んだ。\n「…リスク管理（予備）と、マーケティング（布教）の観点か。非合理的だが、目的意識は明確だな」\n\nよし、納得させた（？）ぞ！',
    choices: [{ text: '第2ラウンドへ', nextSceneId: 'chap2_round2', action: (s) => ({ affection: s.affection + 1 }) }]
  },
  {
    id: 'chap2_round1_lose',
    text: '「不安？ 非論理的だ」\n一蹴された。\n「君の精神的未熟さが露呈したな」',
    choices: [{ text: '第2ラウンドへ', nextSceneId: 'chap2_round2', action: (s) => ({ san: s.san - 5 }) }]
  },
  {
    id: 'chap2_round2',
    text: '【Round 2: 隠し撮り写真】\n\n「次はこれだ。僕の寝顔の写真」\nレイシオの目が座っている。\n「これは明白なプライバシーの侵害だ。弁明の余地はあるか？」',
    choices: [
      { 
        text: '「君の美しさは公共の利益だ」 (詭弁)', 
        nextSceneId: 'chap2_round2_check',
        skillCheck: { skillName: '言いくるめ', targetValue: 60, successSceneId: 'chap2_round2_win', failureSceneId: 'chap2_round2_lose' }
      }
    ]
  },
  {
    id: 'chap2_round2_win',
    text: '「公共の利益…？ 僕の顔が？」\n「そうだよ教授。君の顔を見ると、みんな幸せになる。これは社会貢献なんだ」\n「……君の頭の中はどうなっているんだ」\n\n呆れられたが、写真は没収されなかった。押し切った！',
    choices: [{ text: '最終ラウンドへ', nextSceneId: 'chap2_round3' }]
  },
  {
    id: 'chap2_round2_lose',
    text: '「却下だ。削除しろ」\nその場でデータを消去させられた。\nああ、僕の宝物が……。',
    choices: [{ text: '最終ラウンドへ', nextSceneId: 'chap2_round3', action: (s) => ({ san: s.san - 10 }) }]
  },
  {
    id: 'chap2_round3',
    text: '【Final Round: 愛か執着か】\n\n「最後だ。アベンチュリン」\nレイシオは真剣な眼差しで君を見た。\n「君のこれは、愛ではない。ただの執着だ。依存だ」\n「そんな不健全な関係を、僕は認めるわけにはいかない」\n\n彼の言葉は正論だ。だが、ここで引くわけにはいかない。',
    choices: [
      { 
        text: '「執着こそが愛の純度だ！」と叫ぶ', 
        nextSceneId: 'chap2_final_passion',
        condition: (s) => s.otakuLevel >= 5
      },
      { 
        text: '「……それでも、好きなんだ」と呟く', 
        nextSceneId: 'chap2_final_sincere'
      }
    ]
  },
  {
    id: 'chap2_final_passion',
    text: '「執着上等！ 依存上等！ 君なしじゃ生きられない、それが僕の愛だ！」\n開き直った君の勢いに、レイシオは目を丸くした。\n「……狂っているな。だが、そこまで言い切るとは」\n「いいだろう。その狂気、僕が引き受けてやる」',
    choices: [{ text: '第3章へ', nextSceneId: 'chap3_intro', action: (s) => ({ affection: s.affection + 5 }) }]
  },
  {
    id: 'chap2_final_sincere',
    text: '「……それでも、好きなんだ。理屈じゃないよ、教授」\n\n静かな部屋に、君の声が響いた。\nレイシオは大きく目を見開き、それからふっと力を抜いた。\n\n「……はぁ。理屈じゃない、か」\n「学者相手に一番言ってはいけない言葉だが……今回だけは不問にしよう」\n\n彼はファイルを閉じた。\n「勝負は君の勝ちだ。好きにするがいい」',
    choices: [{ text: '第3章へ', nextSceneId: 'chap3_intro', action: (s) => ({ affection: s.affection + 3 }) }]
  }
];
