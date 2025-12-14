import { Scene } from '../../types/game';

export const chapter1: Scene[] = [
  {
    id: 'chap1_intro',
    text: '【第1章：アベンチュリンの”推し活”】\n\n「推し活とは、時間との勝負だ」\n\n限られた時間の中で、いかに効率よく成分（レイシオ）を摂取し、明日への活力を得るか。\n今日のミッションは以下の通りだ。\n\n1. 祭壇の設営と礼拝\n2. ネット上の供給確認\n3. 証拠隠滅して何食わぬ顔で出迎える',
    choices: [
      { text: 'ミッション開始', nextSceneId: 'chap1_action_select', action: (s) => ({ turn: 0 }) }
    ]
  },
  {
    id: 'chap1_action_select',
    text: '現在時刻：21:00。\nレイシオの帰宅まで、あと数ターン行動できそうだ。\n何をしようか？',
    choices: [
      { 
        text: '祭壇を愛でる (SAN値回復)', 
        nextSceneId: 'chap1_altar',
        condition: (s) => s.turn < 4
      },
      { 
        text: 'グッズのメンテナンス (オタク度UP)', 
        nextSceneId: 'chap1_goods',
        condition: (s) => s.turn < 4
      },
      { 
        text: 'カンパニーの端末でエゴサ (情報収集)', 
        nextSceneId: 'chap1_sns',
        condition: (s) => s.turn < 4
      },
      { 
        text: 'もう十分だ、片付けよう', 
        nextSceneId: 'chap1_cleanup_early',
        condition: (s) => s.turn >= 1
      }
    ]
  },
  {
    id: 'chap1_altar',
    text: '祭壇の中央には、額装されたレイシオの写真（隠し撮り・寝顔）。\nLEDキャンドルの揺らめきが、彼の整った顔立ちを神々しく照らし出している。\n\n「ああ…教授…今日も眉間のシワが美しいよ…」\n「その不機嫌そうな口元、最高だね…」\n\n拝むことで心が洗われる。明日も頑張って生きよう。',
    choices: [
      { 
        text: '次の行動へ', 
        nextSceneId: 'chap1_event_check',
        action: (s) => ({ san: Math.min(s.san + 15, 90), turn: s.turn + 1 }) 
      }
    ]
  },
  {
    id: 'chap1_goods',
    text: 'アタッシュケースから「等身大抱き枕カバー（自作）」を取り出す。\n生地の質感、プリントの鮮明さ…完璧だ。\n\n「本人は抱かせてくれないけど、これなら文句言わないもんね」\n頬ずりをする。\n虚しい？ いや、これは高尚な儀式だ。',
    choices: [
      { 
        text: '次の行動へ', 
        nextSceneId: 'chap1_event_check',
        action: (s) => ({ otakuLevel: s.otakuLevel + 2, turn: s.turn + 1 }) 
      }
    ]
  },
  {
    id: 'chap1_sns',
    text: 'SNSを開く。\n『【悲報】レイシオ教授、また学会で論破祭り』というスレが立っている。\n\n「ふふ、相変わらずだね」\n動画を見ると、相手を完膚なきまでに叩きのめすレイシオの姿が。\n「この冷徹な目！ 蔑むような視線！ たまらないね！」\n興奮して「いいね」を連打した。',
    choices: [
      { 
        text: '次の行動へ', 
        nextSceneId: 'chap1_event_check',
        action: (s) => ({ otakuLevel: s.otakuLevel + 1, affection: s.affection + 1, turn: s.turn + 1 }) 
      }
    ]
  },
  {
    id: 'chap1_event_check',
    text: '（時計の針が進む…）',
    choices: [
      { 
        text: '……おや？', 
        nextSceneId: 'chap1_random_event',
      }
    ]
  },
  {
    id: 'chap1_random_event',
    text: '突然、端末が着信音を鳴らした！\n画面には「トパーズ」の文字。\n\n「げっ、こんな時に…」\n出ないと怪しまれるが、出れば長話になるかもしれない。',
    choices: [
      { 
        text: '無視して推し活を続ける', 
        nextSceneId: 'chap1_action_select',
        action: (s) => ({ san: s.san - 5 }) 
      },
      { 
        text: '手短に対応する', 
        nextSceneId: 'chap1_topaz_talk',
        action: (s) => ({ turn: s.turn + 1 }) 
      }
    ]
  },
  {
    id: 'chap1_topaz_talk',
    text: '「もしもし？ アベンチュリン、例の案件だけど…」\n「ごめんトパーズ、今すごく大事な商談中（推し活）なんだ」\n「え？ 後ろで変なBGM流れてない？ お経…？」\n\n危ない。祭壇のBGMが漏れていた。\nなんとか誤魔化して電話を切った。時間をロスしてしまった。',
    choices: [{ text: '行動に戻る', nextSceneId: 'chap1_action_select' }]
  },
  {
    id: 'chap1_cleanup_early',
    text: '「今日はこれくらいにしておこう」\n満足して片付けを始めた、その時。\n\nガチャリ。\n\n「……アベンチュリン？」\nレイシオが帰ってきた。予定より早い！\nだが、君は既に片付けを終えている。完璧だ。',
    choices: [{ text: '余裕の笑みで迎える', nextSceneId: 'chap2_intro_safe' }]
  }
];
