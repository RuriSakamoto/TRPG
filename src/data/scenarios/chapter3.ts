import { Scene } from '../../types/game';

export const chapter3: Scene[] = [
  {
    id: 'chap3_intro',
    text: '【第3章：解釈違いのPV撮影】\n\nカンパニー広報部からの依頼。\nそれは、アベンチュリンにとって悪夢の始まりだった。\n\n撮影当日。スタジオの楽屋。\n「……この衣装はなんだ」\nレイシオが不満げに自身の衣装を見下ろしている。\nフリル満載のアイドル風スーツだ。',
    choices: [
      { 
        text: '【目星判定】衣装の問題点を分析する', 
        nextSceneId: 'chap3_costume_angry',
        skillCheck: {
          skillName: '目星',
          successSceneId: 'chap3_costume_analysis',
          failureSceneId: 'chap3_costume_lie'
        }
      },
      { text: '「似合ってるよ（棒読み）」', nextSceneId: 'chap3_costume_lie' },
      { text: '「今すぐ脱いで！解釈違いだ！」', nextSceneId: 'chap3_costume_angry' }
    ]
  },
  {
    id: 'chap3_costume_analysis',
    text: '衣装を注意深く観察する…\n\n「待って、これは完全に解釈違いだ！」\n「レイシオのキャラクター性を無視している。彼はシンプルで機能的な服を好むはずだ」\n「それに、このフリルは彼の知的なイメージを損なう」\n\n君の的確な分析に、レイシオは少し驚いた様子だ。\n「……よく分かっているな。その通りだ」\n\n（好感度上昇）',
    choices: [
      { 
        text: '監督に抗議する', 
        nextSceneId: 'chap3_costume_angry',
        action: (s) => ({ affection: s.affection + 2 })
      }
    ]
  },
  {
    id: 'chap3_costume_lie',
    text: '「似合ってるよ、レイシオ。王子様みたいだ」\n「……君の目は節穴か？ どう見ても道化だ」\nレイシオは不機嫌そうだ。信頼度が下がった気がする。',
    choices: [
      { 
        text: 'リハーサルへ', 
        nextSceneId: 'chap3_wink_check', 
        action: (s) => ({ affection: s.affection - 1 }) 
      }
    ]
  },
  {
    id: 'chap3_costume_angry',
    text: '「だよね！？ レイシオはもっとこう、シンプルで知的な装いが至高なんだよ！」\n意気投合した二人だが、監督は止まらない。\n\n「じゃあリハいきまーす！ まずは『ウィンク』の練習ね！」\n「レイシオちゃん、カメラに向かってバチコーン！とお願い！」\n\n地獄のリハーサルが始まった。',
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
    text: '「次は『壁ドン』だ！ アベンチュリンちゃんを壁に追い詰めて、甘い言葉を囁いて！」\n\nレイシオが君に近づく。\nその顔は真っ赤だ。\n「……なぜ僕がこんなことを」\n「仕事だからね、レイシオ…（僕も恥ずかしい）」',
    choices: [
      { text: '本番へ挑む', nextSceneId: 'chap3_studio' }
    ]
  },

  // --- 運命の分岐点 ---
  {
    id: 'chap3_studio',
    text: 'いよいよ本番。\n監督の要求はエスカレートしていく。\n「もっと密着して！ 恋人繋ぎして！」\n\nレイシオの我慢も限界に近い。\n君の「解釈違いメーター」も爆発寸前だ。\nどうする？',
    choices: [
      {
        text: '【芸術判定】解釈一致の演出を提案する',
        nextSceneId: 'end_true_route',
        skillCheck: {
          skillName: '芸術',
          successSceneId: 'chap3_art_success',
          failureSceneId: 'chap3_revolt',
          criticalSceneId: 'chap3_art_critical'
        }
      },
      {
        text: '【情熱判定】オタクの魂で現場を制圧する',
        nextSceneId: 'chap3_revolt',
        skillCheck: {
          skillName: '情熱',
          successSceneId: 'chap3_passion_win',
          failureSceneId: 'chap3_passion_lose',
          criticalSceneId: 'chap3_passion_critical'
        }
      },
      {
        text: '【幸運判定】奇跡的に良いカットが撮れることを祈る',
        nextSceneId: 'end_normal_route',
        skillCheck: {
          skillName: '幸運',
          successSceneId: 'chap3_luck_success',
          failureSceneId: 'end_normal_route'
        }
      },
      {
        text: '「いくらだ？ このスタジオごと買い取る」',
        nextSceneId: 'end_ceo_route',
        condition: (s) => s.otakuLevel >= 7
      },
      {
        text: 'レイシオの手を引いて逃走する',
        nextSceneId: 'end_secret_route',
        condition: (s) => s.loopCount >= 2 && s.affection >= 8
      },
      { 
        text: '「もう限界だ！レイシオを解放しろ！」と暴れる', 
        nextSceneId: 'chap3_revolt',
        condition: (s) => s.otakuLevel >= 5
      },
      {
        text: 'レイシオを信じて目配せする',
        nextSceneId: 'chap3_ratio_counter',
        condition: (s) => s.affection >= 6
      },
      { 
        text: '仕事だと割り切って耐える', 
        nextSceneId: 'end_normal_route'
      },
      {
        text: 'あまりの解釈違いに気絶する',
        nextSceneId: 'end_bad_route',
        action: (s) => ({ san: 0 })
      }
    ]
  },

  // --- 芸術判定ルート ---
  {
    id: 'chap3_art_critical',
    text: '「待ってください！」\n君は監督の前に立ちはだかった。\n\n「この演出では、レイシオレイシオの本質が伝わりません」\n「彼の魅力は、知性と情熱です。それを表現するには…」\n\n君は即興で絵コンテを描き始めた。\nレイシオが黒板の前で講義をする姿。\nチョークを握る手。真剣な眼差し。\n\n「……これだ！ 天才か君は！」\n監督が目を輝かせた。\n\n（好感度最大上昇＋True End確定）',
    choices: [
      { 
        text: '新しい演出で撮影開始', 
        nextSceneId: 'end_true_route',
        action: (s) => ({ affection: s.affection + 5 })
      }
    ]
  },
  {
    id: 'chap3_art_success',
    text: '「監督、提案があります」\n君は代替案を提示した。\n\n「レイシオレイシオの魅力を活かすなら、もっとシンプルな演出がいいと思います」\n「例えば、研究室で本を読むシーンとか…」\n\n監督は少し考え込んだ。\n「……悪くないわね。試してみましょう」\n\n（好感度上昇）',
    choices: [
      { 
        text: '撮影を続ける', 
        nextSceneId: 'end_true_route',
        action: (s) => ({ affection: s.affection + 2 })
      }
    ]
  },

  // --- 情熱判定ルート ---
  {
    id: 'chap3_passion_critical',
    text: '「違う！ 全部違う！！」\n君の叫びが撮影現場に響き渡る。\n\n「レイシオレイシオは、こんな薄っぺらいキャラじゃない！」\n「彼の知性、彼の誇り、彼の不器用な優しさ！」\n「それを理解せずに、表面だけを撮ろうとするな！」\n\n君の熱量に、現場が静まり返った。\n監督も、スタッフも、言葉を失っている。\n\nレイシオが君の肩に手を置いた。\n「……ありがとう、アベンチュリン」\n\n（好感度最大上昇＋オタク度上昇＋True End確定）',
    choices: [
      { 
        text: '新しい撮影を始める', 
        nextSceneId: 'end_true_route',
        action: (s) => ({ affection: s.affection + 7, otakuLevel: s.otakuLevel + 5 })
      }
    ]
  },
  {
    id: 'chap3_passion_win',
    text: '「もう我慢できない！ レイシオの魅力はこんなんじゃない！」\n君の熱弁に、監督が少し引いている。\n\n「え、ええと…じゃあどうすれば…？」\n「レイシオに講義をさせてください！ それが一番輝くんです！」\n\n（好感度上昇）',
    choices: [
      { 
        text: '撮影方針を変更する', 
        nextSceneId: 'end_true_route',
        action: (s) => ({ affection: s.affection + 3 })
      }
    ]
  },
  {
    id: 'chap3_passion_lose',
    text: '「レイシオの魅力が…全然伝わってない…！」\n君は必死に訴えたが、声が震えている。\n\n「はいはい、オタクさんの意見は聞いたから」\n監督に軽くあしらわれてしまった。\n\n（SAN値減少）',
    choices: [
      { 
        text: '悔しさを噛み締める', 
        nextSceneId: 'chap3_revolt',
        action: (s) => ({ san: s.san - 5 })
      }
    ]
  },

  // --- 幸運判定ルート ---
  {
    id: 'chap3_luck_success',
    text: 'その時、奇跡が起きた。\n\nレイシオが台本を読んでいる瞬間、カメラが偶然彼を捉えた。\n真剣な表情で文字を追う横顔。\n知的で、美しく、まさに「レイシオらしい」一枚。\n\n「……これよ！ これが欲しかったの！」\n監督が歓喜の声を上げた。\n\n（好感度上昇＋Normal End回避）',
    choices: [
      { 
        text: 'この路線で撮影を続ける', 
        nextSceneId: 'end_true_route',
        action: (s) => ({ affection: s.affection + 2 })
      }
    ]
  },

  // --- True End ルート ---
  {
    id: 'chap3_revolt',
    text: '「ふざけるな！ レイシオはアイドルじゃない、学者だ！」\n君はセットを破壊した（物理）。\n「……よく言った、賭博師」\nレイシオがニヤリと笑った。\n「私も同感だ。こんな茶番は終わりにしよう」',
    choices: [
      { text: 'True Endへ', nextSceneId: 'end_true_route' }
    ]
  },
  {
    id: 'chap3_ratio_counter',
    text: '君の視線に気づいたレイシオが、小さく頷いた。\n「……いい加減にしたまえ」\n\n彼はチョークを取り出し、床に数式を書き始めた。\n「君の演出プランの非効率性を数式で証明した。これを見ろ」\n圧倒的な論理（と圧）で、現場が静まり返る。',
    choices: [
      { text: '「さすがレイシオ！」と拍手する', nextSceneId: 'end_true_route' }
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
          hp: 10, san: 60, affection: 0, items: [], skills: [], skillValues: {}, otakuLevel: 0, turn: 0,
          clearedEndings: [...s.clearedEndings, 'true_end'],
          loopCount: s.loopCount + 1
        }) 
      }
    ]
  },

  // --- CEO End ルート ---
  {
    id: 'end_ceo_route',
    text: '【CEO End: 資本主義の勝利】\n\n「うるさいな。この企画、僕が買い取るよ」\n君はブラックカードを取り出した。\n\n数分後、スタジオのオーナーは君になった。\n「さあレイシオ、僕の指示通りに動いてくれ。最高の映像を撮ろう」\n「……やれやれ。監督が君なら、少しはマシになるか」\n\n完成したPVは、君の性癖が詰め込まれたマニアックな傑作となった。\n（クリア特典：タイトル画面に「CEO」バッジ追加）',
    choices: [
      { 
        text: 'タイトルへ戻る', 
        nextSceneId: 'start', 
        action: (s) => ({ 
          hp: 10, san: 60, affection: 0, items: [], skills: [], skillValues: {}, otakuLevel: 0, turn: 0,
          clearedEndings: [...s.clearedEndings, 'ceo_end'],
          loopCount: s.loopCount + 1
        }) 
      }
    ]
  },

  // --- Secret End ルート ---
  {
    id: 'end_secret_route',
    text: '【Secret End: 秘密の補習】\n\n「付き合いきれん。帰るぞ」\n君はレイシオの手を引き、スタジオを飛び出した。\n\n「おい、どこへ行く気だ」\n「君の研究室だよ。二人きりで、個人的な講義（ファンサ）をしてくれるんだろ？」\n\nレイシオは呆れたように笑った。\n「……高くつくぞ」\n\nその後の二人の時間は、誰にも邪魔されることはなかった。\n（クリア特典：タイトル画面に「Secret」バッジ追加）',
    choices: [
      { 
        text: 'タイトルへ戻る', 
        nextSceneId: 'start', 
        action: (s) => ({ 
          hp: 10, san: 60, affection: 0, items: [], skills: [], skillValues: {}, otakuLevel: 0, turn: 0,
          clearedEndings: [...s.clearedEndings, 'secret_end'],
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
          hp: 10, san: 60, affection: 0, items: [], skills: [], skillValues: {}, otakuLevel: 0, turn: 0,
          clearedEndings: [...s.clearedEndings, 'normal_end'],
          loopCount: s.loopCount + 1
        }) 
      }
    ]
  },

  // --- Bad End ルート ---
  {
    id: 'end_bad_route',
    text: '【Bad End: 虚無】\n\nプツン。\n君の中で何かが切れた。\n\n「違う……僕の好きなレイシオはこんなんじゃない……」\n\nあまりのショックに、君は寝込んだ。\n後日公開されたPVを見る気力もなく、ファンクラブの更新も忘れてしまった。\n推しへの熱が、急速に冷めていくのを感じながら……。',
    choices: [
      { 
        text: 'タイトルへ戻る', 
        nextSceneId: 'start', 
        action: (s) => ({ 
          hp: 10, san: 60, affection: 0, items: [], skills: [], skillValues: {}, otakuLevel: 0, turn: 0,
          clearedEndings: [...s.clearedEndings, 'bad_end'],
          loopCount: s.loopCount + 1
        }) 
      }
    ]
  }
];
