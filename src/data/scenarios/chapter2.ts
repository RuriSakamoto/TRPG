import { Scene } from '../../types/game';

export const chapter2: Scene[] = [
  {
    id: 'chap2_intro_safe',
    title: '第2章：ベリタス・レイシオの恋人は…',
    description: '祭壇が発見されてしまった',
    text: '【第2章：ベリタス・レイシオの恋人は…】\n\nあの日から数日後。\nリビングでくつろいでいると、レイシオが分厚いファイルを持って現れた。\n「アベンチュリン。君の部屋の清掃業者が、ベッドの下から『奇妙な祭壇』を発見したと報告があった」\n\n……詰んだ。',
    choices: [
      { 
        text: '【心理学判定】彼の本心を読む', 
        nextScene: 'chap2_lie_check',
        skillCheck: {
          skillName: '心理学',
          onSuccess: 'chap2_psychology_success',
          onFailure: 'chap2_psychology_fail'
        }
      },
      { text: '「それは魔除けだよ」と嘘をつく', nextScene: 'chap2_lie_check' },
      { text: '素直に認めて土下座する', nextScene: 'chap2_dogeza' }
    ]
  },
  {
    id: 'chap2_psychology_success',
    title: '本心を見抜く',
    description: 'レイシオは困惑しているだけだった',
    text: 'レイシオの表情を注意深く観察する…\n\n眉間のシワ、口元の微かな動き、視線の動き…\n\n「……待って。これ、怒っているんじゃない。困惑している？」\n\n彼は本当に理解できないだけなのだ。\n「どうやら、正直に話せば理解してくれるかもしれない」',
    choices: [
      { 
        text: '正直に話す', 
        nextScene: 'chap2_dogeza',
        action: (s) => ({ ...s, affection: s.affection + 2 })
      }
    ]
  },
  {
    id: 'chap2_psychology_fail',
    title: '誤読',
    description: 'レイシオの表情を読み間違えた',
    text: 'レイシオの表情を読もうとしたが…\n\n「……完全に怒っている！ これは言い訳するしかない！」\n\n（実際は困惑していただけだが、誤読してしまった）',
    choices: [
      { text: '慌てて言い訳する', nextScene: 'chap2_lie_check' }
    ]
  },
  {
    id: 'chap2_lie_check',
    title: '墓穴を掘る',
    description: '言い訳が裏目に出た',
    text: '「魔除け？ ほう…僕の写真が魔除けになると？」\nレイシオは眉をひそめた。\n「つまり君にとって僕は、魔物よりも恐ろしい存在ということか？」\n\n墓穴を掘った。彼の機嫌が目に見えて悪くなっている。',
    choices: [
      { 
        text: '【言いくるめ判定】詭弁で煙に巻く', 
        nextScene: 'chap2_debate_start',
        skillCheck: {
          skillName: '言いくるめ',
          targetValue: 50,
          onSuccess: 'chap2_fastalk_success',
          onFailure: 'chap2_fastalk_fail'
        }
      },
      { 
        text: '必死に弁解する', 
        nextScene: 'chap2_debate_start', 
        action: (s) => ({ ...s, affection: s.affection - 1 }) 
      }
    ]
  },
  {
    id: 'chap2_fastalk_success',
    title: '詭弁成功',
    description: '何とか誤魔化せた',
    text: '「違う違う！ 魔除けじゃなくて『守護神』だよ！」\n「君の写真があれば、どんな困難も乗り越えられる気がするんだ！」\n\nレイシオは目を細めた。\n「……詭弁だな。だが、まあいい」\n\n何とか誤魔化せた！',
    choices: [
      { text: 'プレゼンを開始する', nextScene: 'chap2_debate_start' }
    ]
  },
  {
    id: 'chap2_fastalk_fail',
    title: '言い訳失敗',
    description: '支離滅裂な弁解',
    text: '「いや、その…魔除けというか、お守りというか…」\n「言い訳が支離滅裂だぞ、アベンチュリン」\n\nレイシオの冷たい視線が突き刺さる。',
    choices: [
      { 
        text: '必死に弁解する', 
        nextScene: 'chap2_debate_start', 
        action: (s) => ({ ...s, affection: s.affection - 2, san: s.san - 5 }) 
      }
    ]
  },
  {
    id: 'chap2_dogeza',
    title: '土下座',
    description: '素直に謝罪する',
    text: '床に額をこすりつけた。\n「ごめん、教授！ 君が尊すぎてつい！」\n\n「……はぁ」\n深い溜息が降ってくる。\n「顔を上げろ。怒っているわけではない。ただ、理解ができないだけだ」\n\n彼はファイルを机に置いた。\n「君のその『推し活』とやらの定義と、僕へのメリットを説明しろ。納得できれば許容する」',
    choices: [
      { text: 'プレゼンを開始する', nextScene: 'chap2_debate_start' }
    ]
  },
  {
    id: 'chap2_debate_start',
    title: 'Round 1: グッズについて',
    description: 'レイシオとの論戦が始まった',
    text: '「第一の議題。君が収集している『グッズ』についてだ」\nレイシオは押収品リストを読み上げた。\n「アクリルスタンド、缶バッジ、抱き枕……これらは単なるプラスチックと布だ。これに大金を投じる合理的理由はあるのか？」',
    choices: [
      { 
        text: '【説得判定】論理的に説明する', 
        nextScene: 'chap2_round1_win',
        skillCheck: {
          skillName: '説得',
          onSuccess: 'chap2_persuade_success',
          onFailure: 'chap2_round1_lose'
        }
      },
      { 
        text: '「保存用、観賞用、布教用だ！」', 
        nextScene: 'chap2_round1_win',
        condition: (s) => s.otakuLevel >= 3
      },
      { 
        text: '「予備がないと不安だから…」', 
        nextScene: 'chap2_round1_lose'
      }
    ]
  },
  {
    id: 'chap2_persuade_success',
    title: '完璧なプレゼン',
    description: '論理的な説明で納得させた',
    text: '「これは投資だよ、教授」\n君は冷静に説明を始めた。\n\n「グッズは資産価値がある。限定品は市場で高値で取引される」\n「それに、精神的安定による生産性向上も見込める」\n「つまり、合理的な自己投資なんだ」\n\nレイシオは目を見開いた。\n「……なるほど。君がそこまで考えているとは思わなかった」\n\n完璧なプレゼンだった！',
    choices: [
      { 
        text: '第2ラウンドへ', 
        nextScene: 'chap2_round2', 
        action: (s) => ({ ...s, affection: s.affection + 3 }) 
      }
    ]
  },
  {
    id: 'chap2_round1_win',
    title: 'Round 1 勝利',
    description: 'オタクの常識で押し切った',
    text: '「保存用、観賞用、布教用…？」\nレイシオは眉をひそめたが、少し考え込んだ。\n「…リスク管理（予備）と、マーケティング（布教）の観点か。非合理的だが、目的意識は明確だな」\n\nよし、納得させた（？）ぞ！',
    choices: [
      { 
        text: '第2ラウンドへ', 
        nextScene: 'chap2_round2', 
        action: (s) => ({ ...s, affection: s.affection + 1 }) 
      }
    ]
  },
  {
    id: 'chap2_round1_lose',
    title: 'Round 1 敗北',
    description: '一蹴されてしまった',
    text: '「不安？ 非論理的だ」\n一蹴された。\n「君の精神的未熟さが露呈したな」',
    choices: [
      { 
        text: '第2ラウンドへ', 
        nextScene: 'chap2_round2', 
        action: (s) => ({ ...s, san: s.san - 5 }) 
      }
    ]
  },
  {
    id: 'chap2_round2',
    title: 'Round 2: 隠し撮り写真',
    description: 'プライバシー侵害の弁明',
    text: '【Round 2: 隠し撮り写真】\n\n「次はこれだ。僕の寝顔の写真」\nレイシオの目が座っている。\n「これは明白なプライバシーの侵害だ。弁明の余地はあるか？」',
    choices: [
      { 
        text: '【オカルト判定】「推し活は現代の宗教儀式」と説明', 
        nextScene: 'chap2_round2_check',
        skillCheck: {
          skillName: 'オカルト',
          onSuccess: 'chap2_occult_success',
          onFailure: 'chap2_round2_lose'
        }
      },
      { 
        text: '【言いくるめ判定】「君の美しさは公共の利益だ」', 
        nextScene: 'chap2_round2_check',
        skillCheck: { 
          skillName: '言いくるめ', 
          targetValue: 60, 
          onSuccess: 'chap2_round2_win', 
          onFailure: 'chap2_round2_lose' 
        }
      },
      { 
        text: '素直に謝る', 
        nextScene: 'chap2_round2_lose'
      }
    ]
  },
  {
    id: 'chap2_occult_success',
    title: '学術的アプローチ',
    description: '宗教学的な説明が功を奏した',
    text: '「教授、これは宗教学的に見て正当な行為なんだ」\n君は真剣な表情で説明を始めた。\n\n「古来より、人々は崇拝対象の像を作り、それを拝んできた」\n「推し活も同じ。現代における信仰の形なんだよ」\n\nレイシオは呆れた顔をしたが、少し興味を持ったようだ。\n「……宗教学か。まあ、一理あるな」\n\n学術的アプローチが功を奏した！',
    choices: [
      { 
        text: '最終ラウンドへ', 
        nextScene: 'chap2_round3',
        action: (s) => ({ ...s, affection: s.affection + 2 })
      }
    ]
  },
  {
    id: 'chap2_round2_win',
    title: 'Round 2 勝利',
    description: '押し切った',
    text: '「公共の利益…？ 僕の顔が？」\n「そうだよレイシオ。君の顔を見ると、みんな幸せになる。これは社会貢献なんだ」\n「……君の頭の中はどうなっているんだ」\n\n呆れられたが、写真は没収されなかった。押し切った！',
    choices: [
      { text: '最終ラウンドへ', nextScene: 'chap2_round3' }
    ]
  },
  {
    id: 'chap2_round2_lose',
    title: 'Round 2 敗北',
    description: '写真を削除させられた',
    text: '「却下だ。削除しろ」\nその場でデータを消去させられた。\nああ、僕の宝物が……。',
    choices: [
      { 
        text: '最終ラウンドへ', 
        nextScene: 'chap2_round3', 
        action: (s) => ({ ...s, san: s.san - 10 }) 
      }
    ]
  },
  {
    id: 'chap2_round2_check',
    title: 'Round 2 継続',
    description: '次のラウンドへ',
    text: 'レイシオとの論戦は続く…',
    choices: [
      { text: '最終ラウンドへ', nextScene: 'chap2_round3' }
    ]
  },
  {
    id: 'chap2_round3',
    title: 'Final Round: 愛か執着か',
    description: '最後の論戦',
    text: '【Final Round: 愛か執着か】\n\n「最後だ。アベンチュリン」\nレイシオは真剣な眼差しで君を見た。\n「君のこれは、愛ではない。ただの執着だ。依存だ」\n「そんな不健全な関係を、僕は認めるわけにはいかない」\n\n彼の言葉は正論だ。だが、ここで引くわけにはいかない。',
    choices: [
      { 
        text: '【情熱判定】オタクの魂を燃やす', 
        nextScene: 'chap2_final_passion',
        skillCheck: {
          skillName: '情熱',
          onSuccess: 'chap2_passion_critical',
          onFailure: 'chap2_final_passion'
        }
      },
      { 
        text: '「執着こそが愛の純度だ！」と叫ぶ', 
        nextScene: 'chap2_final_passion',
        condition: (s) => s.otakuLevel >= 5
      },
      { 
        text: '「……それでも、好きなんだ」と呟く', 
        nextScene: 'chap2_final_sincere'
      }
    ]
  },
  {
    id: 'chap2_passion_critical',
    title: '魂の叫び',
    description: '全力の告白',
    text: '「違う！ これは執着じゃない！」\n君の声が部屋に響き渡る。\n\n「君の論文を読んで感動した。君の講義を聞いて尊敬した」\n「君の不器用な優しさに気づいて、好きになった」\n「これは依存じゃない。君という人間を、全力で愛しているんだ！」\n\nレイシオは完全に言葉を失った。\n彼の頬が、微かに赤く染まっている。\n\n「……参った。完全に、君の勝ちだ」',
    choices: [
      { 
        text: '第3章へ', 
        nextScene: 'chap3_intro', 
        action: (s) => ({ ...s, affection: s.affection + 10, otakuLevel: s.otakuLevel + 3 }) 
      }
    ]
  },
  {
    id: 'chap2_final_passion',
    title: '開き直り',
    description: '狂気の愛を宣言',
    text: '「執着上等！ 依存上等！ 君なしじゃ生きられない、それが僕の愛だ！」\n開き直った君の勢いに、レイシオは目を丸くした。\n「……狂っているな。だが、そこまで言い切るとは」\n「いいだろう。その狂気、僕が引き受けてやる」',
    choices: [
      { 
        text: '第3章へ', 
        nextScene: 'chap3_intro', 
        action: (s) => ({ ...s, affection: s.affection + 5 }) 
      }
    ]
  },
  {
    id: 'chap2_final_sincere',
    title: '静かな告白',
    description: '理屈じゃない愛',
    text: '「……それでも、好きなんだ。理屈じゃないよ、レイシオ」\n\n静かな部屋に、君の声が響いた。\nレイシオは大きく目を見開き、それからふっと力を抜いた。\n\n「……はぁ。理屈じゃない、か」\n「学者相手に一番言ってはいけない言葉だが……今回だけは不問にしよう」\n\n彼はファイルを閉じた。\n「勝負は君の勝ちだ。好きにするがいい」',
    choices: [
      { 
        text: '第3章へ', 
        nextScene: 'chap3_intro', 
        action: (s) => ({ ...s, affection: s.affection + 3 }) 
      }
    ]
  }
];
