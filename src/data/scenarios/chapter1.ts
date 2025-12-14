import { Scene } from '../../types/game';

export const chapter1: Scene[] = [
  {
    id: 'chap1_intro',
    title: '第1章：アベンチュリンの"推し活"',
    description: '限られた時間での推し活ミッション',
    text: '【第1章：アベンチュリンの"推し活"】\n\n「推し活とは、時間との勝負だ」\n\n限られた時間の中で、いかに効率よく成分（レイシオ）を摂取し、明日への活力を得るか。\n今日のミッションは以下の通りだ。\n\n1. 祭壇の設営と礼拝\n2. ネット上の供給確認\n3. 証拠隠滅して何食わぬ顔で出迎える',
    choices: [
      { text: 'ミッション開始', nextScene: 'chap1_action_select', action: (s) => ({ ...s, turn: 1 }) }
    ]
  },
  {
    id: 'chap1_action_select',
    title: '行動選択',
    description: 'レイシオの帰宅までの行動を選択',
    text: '現在時刻：{{TIME}}。\nレイシオの帰宅（23:00）まで、あと数ターン行動できそうだ。\n何をしようか？',
    choices: [
      { 
        text: '祭壇を愛でる', 
        nextScene: 'chap1_altar',
        condition: (s) => (s.turn || 0) < 5
      },
      { 
        text: 'グッズのメンテナンス', 
        nextScene: 'chap1_goods',
        condition: (s) => (s.turn || 0) < 5
      },
      { 
        text: 'カンパニーの端末でエゴサ', 
        nextScene: 'chap1_sns',
        condition: (s) => (s.turn || 0) < 5
      },
      { 
        text: 'もう十分だ、片付けよう', 
        nextScene: 'chap1_cleanup_early',
        condition: (s) => (s.turn || 0) >= 2
      }
    ]
  },
  {
    id: 'chap1_altar',
    title: '祭壇を愛でる',
    description: 'レイシオの写真を拝む',
    text: '現在時刻：{{TIME}}。\n\n祭壇の中央には、額装されたレイシオの写真（隠し撮り・寝顔）。\nLEDキャンドルの揺らめきが、彼の整った顔立ちを神々しく照らし出している。\n\n「ああ…教授…今日も眉間のシワが美しいよ…」\n「その不機嫌そうな口元、最高だね…」\n\n拝むことで心が洗われる。明日も頑張って生きよう。',
    choices: [
      { 
        text: '【目星判定】新しい魅力を発見する', 
        nextScene: 'chap1_altar_after',
        skillCheck: {
          skillName: '目星',
          onSuccess: 'chap1_altar_critical_success',
          onFailure: 'chap1_altar_after'
        }
      },
      { 
        text: 'そのまま次の行動へ', 
        nextScene: 'chap1_altar_after',
        action: (s) => ({ ...s, san: Math.min(s.san + 15, 90) }) 
      }
    ]
  },
  {
    id: 'chap1_altar_critical_success',
    title: '新たな発見',
    description: '推しの新たな魅力を発見',
    text: '祭壇を眺めていると、写真の中のレイシオの表情に新たな発見が！\n\n「待って…この角度から見ると、耳の形が完璧すぎる…！」\n「それに、この髪の流れ方…計算されたような美しさ…！」\n\n新たな"推しポイント"を発見した喜びで、心が満たされる。\n（SAN値大幅回復）',
    choices: [
      { 
        text: '至福の時間だった', 
        nextScene: 'chap1_action_select',
        action: (s) => ({ ...s, san: Math.min(s.san + 25, 90), otakuLevel: s.otakuLevel + 2, turn: (s.turn || 0) + 1 }) 
      }
    ]
  },
  {
    id: 'chap1_altar_after',
    title: '心の安らぎ',
    description: 'SAN値が回復した',
    text: '祭壇を愛でることで、心が落ち着いた。\n（SAN値回復）',
    choices: [
      { 
        text: '次の行動へ', 
        nextScene: 'chap1_action_select',
        action: (s) => ({ ...s, san: Math.min(s.san + 15, 90), turn: (s.turn || 0) + 1 }) 
      }
    ]
  },
  {
    id: 'chap1_goods',
    title: 'グッズのメンテナンス',
    description: '自作の抱き枕カバーを愛でる',
    text: '現在時刻：{{TIME}}。\n\nアタッシュケースから「等身大抱き枕カバー（自作）」を取り出す。\n生地の質感、プリントの鮮明さ…完璧だ。\n\n「本人は抱かせてくれないけど、これなら文句言わないもんね」\n頬ずりをする。\n虚しい？ いや、これは高尚な儀式だ。',
    choices: [
      { 
        text: '次の行動へ', 
        nextScene: 'chap1_action_select',
        action: (s) => ({ ...s, otakuLevel: s.otakuLevel + 3, turn: (s.turn || 0) + 1 }) 
      }
    ]
  },
  {
    id: 'chap1_sns',
    title: 'エゴサーチ',
    description: 'SNSでレイシオ関連の情報を収集',
    text: '現在時刻：{{TIME}}。\n\nSNSを開く。\n『【悲報】レイシオ教授、また学会で論破祭り』というスレが立っている。\n\n「ふふ、相変わらずだね」\n動画を見ると、相手を完膚なきまでに叩きのめすレイシオの姿が。',
    choices: [
      { 
        text: '【コンピューター判定】効率的にエゴサする', 
        nextScene: 'chap1_sns_after',
        skillCheck: {
          skillName: 'コンピューター',
          onSuccess: 'chap1_sns_success',
          onFailure: 'chap1_sns_after'
        }
      },
      { 
        text: 'そのまま眺める', 
        nextScene: 'chap1_sns_after',
        action: (s) => ({ ...s, otakuLevel: s.otakuLevel + 1, affection: s.affection + 1 }) 
      }
    ]
  },
  {
    id: 'chap1_sns_success',
    title: '大量の成分摂取',
    description: '効率的な情報収集に成功',
    text: '検索スキルを駆使して、レイシオ関連の情報を効率的に収集した！\n\n「おっと、こんなところに未公開の講義動画が…」\n「それに、ファンアートも大量に…保存保存！」\n\n大量の"成分"を摂取できた。',
    choices: [
      { 
        text: '大満足だ', 
        nextScene: 'chap1_action_select',
        action: (s) => ({ ...s, otakuLevel: s.otakuLevel + 3, affection: s.affection + 2, turn: (s.turn || 0) + 1 }) 
      }
    ]
  },
  {
    id: 'chap1_sns_after',
    title: '興奮',
    description: 'レイシオの動画に興奮',
    text: '「この冷徹な目！ 蔑むような視線！ たまらないね！」\n興奮して「いいね」を連打した。',
    choices: [
      { 
        text: '次の行動へ', 
        nextScene: 'chap1_action_select',
        action: (s) => ({ ...s, otakuLevel: s.otakuLevel + 1, affection: s.affection + 1, turn: (s.turn || 0) + 1 }) 
      }
    ]
  },

  // --- 聞き耳判定（turn=3で自動発生） ---
  {
    id: 'chap1_listen_check',
    title: '物音',
    description: '遠くで物音が聞こえた',
    text: '現在時刻：{{TIME}}。\n\n祭壇を愛でていると、遠くで物音が聞こえた気がした…？\n\n「……気のせいかな？」',
    choices: [
      { 
        text: '【聞き耳判定】耳を澄ます', 
        nextScene: 'chap1_topaz_call',
        skillCheck: {
          skillName: '聞き耳',
          onSuccess: 'chap1_listen_success',
          onFailure: 'chap1_topaz_call'
        }
      },
      { 
        text: '気にせず続ける', 
        nextScene: 'chap1_topaz_call'
      }
    ]
  },
  {
    id: 'chap1_listen_success',
    title: '足音',
    description: '廊下から足音が近づいてくる',
    text: '耳を澄ますと…廊下から足音が近づいてくる！\n\n「まずい、レイシオが早く帰ってきた！？」\n\n慌てて祭壇を片付け始める。\n事前に気づけたおかげで、ギリギリ間に合いそうだ！',
    choices: [
      { 
        text: '【隠れる判定】急いで片付ける', 
        nextScene: 'chap1_topaz_call',
        skillCheck: {
          skillName: '隠れる',
          onSuccess: 'chap1_hide_success',
          onFailure: 'chap1_topaz_call'
        }
      }
    ]
  },
  {
    id: 'chap1_hide_success',
    title: '何とか隠蔽',
    description: '祭壇を片付けた',
    text: '何とか祭壇を片付けた。\n少し雑だが、パッと見では分からないだろう。\n\nしかし、足音は止まった。どうやらトパーズだったようだ。',
    choices: [
      { 
        text: '胸を撫で下ろす', 
        nextScene: 'chap1_topaz_call',
        action: (s) => ({ ...s, san: Math.min(s.san + 5, 90) })
      }
    ]
  },

  // --- トパーズからの電話 ---
  {
    id: 'chap1_topaz_call',
    title: 'トパーズからの電話',
    description: '仕事の連絡が入った',
    text: '現在時刻：{{TIME}}。\n\n端末が震えた。画面には「トパーズ」の文字。\n\n「……やれやれ。この時間に連絡してくるなんて、相変わらずワーカーホリックだね」\n\n無視することもできるが、後でカブに噛まれるのも面倒だ。\nどうする？',
    choices: [
      { 
        text: '手短に対応する', 
        nextScene: 'chap1_topaz_talk'
      },
      { 
        text: '居留守を使う', 
        nextScene: 'chap1_after_topaz',
        action: (s) => ({ ...s, san: s.san - 5, turn: (s.turn || 0) + 1 }) 
      }
    ]
  },
  {
    id: 'chap1_topaz_talk',
    title: '電話対応',
    description: 'トパーズの用件を処理',
    text: '「もしもし？ アベンチュリン、例の案件だけど…」\n「ハイハイ、明日一番で処理しておくよ。今は大事な商談中（推し活）でね」\n\n適当にあしらって電話を切った。\n少し時間を食ってしまったが、平和は守られた。',
    choices: [
      { 
        text: '次へ', 
        nextScene: 'chap1_after_topaz',
        action: (s) => ({ ...s, turn: (s.turn || 0) + 1 })
      }
    ]
  },
  {
    id: 'chap1_after_topaz',
    title: '時間確認',
    description: 'まだ時間はあるか？',
    text: '現在時刻：{{TIME}}。\n\n時計を確認する。まだ少し時間がありそうだ。',
    choices: [
      {
        text: 'もう少し推し活を続ける',
        nextScene: 'chap1_action_select',
        condition: (s) => (s.turn || 0) < 5
      },
      {
        text: 'そろそろ片付けよう',
        nextScene: 'chap1_cleanup_early'
      }
    ]
  },

  // --- クライマックス：帰宅 ---
  {
    id: 'chap1_cleanup_early',
    title: 'レイシオの帰宅',
    description: '予定より早く帰ってきた',
    text: '現在時刻：{{TIME}}。\n\n「今日はこれくらいにしておこう」\n満足して片付けを始めた、その時。\n\nガチャリ。\n\n「……アベンチュリン？」\nレイシオが帰ってきた。予定より早い！\nだが、君は既に片付けを終えている。完璧だ。',
    choices: [{ text: '余裕の笑みで迎える', nextScene: 'chap2_intro_safe' }]
  }
];
