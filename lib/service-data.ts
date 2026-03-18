/* ────────────────────────────────────────────
   サービス詳細ページ用 共通データ定義
   ──────────────────────────────────────────── */

export interface ServiceFeature {
  number: string;
  title: string;
  description: string;
}

export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface ServiceProcess {
  number: string;
  title: string;
  description: string;
}

export interface ServiceData {
  slug: string;
  title: string;
  englishTitle: string;
  subtitle: string;
  accentColor: string;
  description: string;
  features: ServiceFeature[];
  process: ServiceProcess[];
  faq: ServiceFAQ[];
}

/* ─── 動画制作 ─── */
const videoService: ServiceData = {
  slug: "video",
  title: "動画制作",
  englishTitle: "VIDEO PRODUCTION",
  subtitle: "ブランドの魅力を動画で最大限に引き出す",
  accentColor: "#FFAFD4",
  description:
    "企業PVからSNS広告動画、プロモーション映像まで、目的に合わせた動画制作をワンストップでご提供。企画・構成からナレーション収録、編集まで一気通貫で対応します。",
  features: [
    {
      number: "01",
      title: "企画・構成から一気通貫",
      description:
        "ヒアリングで課題を明確化し、ターゲット設計からシナリオ作成、絵コンテ制作まで一括で対応。撮影・編集もワンチームで行うため、意図のブレがなくスピーディに完成します。",
    },
    {
      number: "02",
      title: "SNS・広告に最適化されたフォーマット",
      description:
        "YouTube、Instagram Reels、TikTokなど各プラットフォームの仕様に合わせた縦型・横型・スクエア動画を制作。再生数やCTRを意識した構成で、広告効果を最大化します。",
    },
    {
      number: "03",
      title: "多言語ナレーション & 字幕対応",
      description:
        "68言語に対応したナレーション収録・字幕生成が可能。海外向けプロモーションやインバウンド施策にも対応し、グローバルな動画展開をサポートします。",
    },
    {
      number: "04",
      title: "短納期 & 柔軟なリビジョン対応",
      description:
        "最短5営業日での納品に対応。初稿提出後の修正も迅速に反映し、お客様のスケジュールに合わせた柔軟な進行が可能です。",
    },
  ],
  process: [
    {
      number: "01",
      title: "ヒアリング & 企画",
      description: "目的・ターゲット・配信先を整理し、最適な動画の方向性をご提案します。",
    },
    {
      number: "02",
      title: "構成・シナリオ作成",
      description: "ストーリーボード（絵コンテ）をもとに、映像の流れとメッセージを設計します。",
    },
    {
      number: "03",
      title: "撮影 & 素材制作",
      description: "ロケ撮影やモーショングラフィックス制作を行い、高品質な素材を収集します。",
    },
    {
      number: "04",
      title: "編集 & 仕上げ",
      description: "BGM・ナレーション・テロップを組み込み、各種フォーマットに最適化して納品します。",
    },
  ],
  faq: [
    {
      question: "動画の長さはどれくらいが効果的ですか？",
      answer:
        "目的によって異なりますが、SNS広告は15〜30秒、企業PVは2〜3分が一般的です。ターゲットと配信プラットフォームに応じて最適な尺をご提案します。",
    },
    {
      question: "撮影なしでも動画制作は可能ですか？",
      answer:
        "はい、可能です。既存の写真素材やストックフォト、モーショングラフィックスを組み合わせた動画制作にも対応しています。",
    },
    {
      question: "納品までの期間はどのくらいですか？",
      answer:
        "内容にもよりますが、企画確定後おおよそ2〜4週間が目安です。お急ぎの場合は最短5営業日での納品も可能ですのでご相談ください。",
    },
    {
      question: "修正は何回まで対応していますか？",
      answer:
        "基本プランでは2回まで含まれています。大幅な構成変更を伴う修正は別途お見積りとなりますが、テロップや色調の軽微な調整は柔軟に対応いたします。",
    },
    {
      question: "制作した動画の著作権はどうなりますか？",
      answer:
        "納品後の動画の著作権はお客様に帰属します。Webサイト、SNS、展示会など、自由にご利用いただけます。",
    },
  ],
};

/* ─── LP制作 ─── */
const lpService: ServiceData = {
  slug: "lp",
  title: "LP制作",
  englishTitle: "LP CREATION",
  subtitle: "コンバージョンに特化したランディングページ",
  accentColor: "#D5BAFF",
  description:
    "広告のクリック先として最適化されたランディングページを設計・制作。ヒートマップ分析に基づく構成設計とA/Bテスト対応で、CVR最大化を目指します。",
  features: [
    {
      number: "01",
      title: "CV導線を徹底設計",
      description:
        "ファーストビューからフォーム到達までのユーザー心理を分析し、離脱ポイントを最小化。CTAボタンの配置・コピー・カラーまで綿密に設計します。",
    },
    {
      number: "02",
      title: "レスポンシブ & 高速表示",
      description:
        "スマートフォンファーストで設計し、Core Web Vitalsを意識した軽量実装を実現。表示速度の改善はSEO・広告品質スコアの向上にも直結します。",
    },
    {
      number: "03",
      title: "A/Bテスト & 改善提案",
      description:
        "Google Optimizeやヒートマップツールを活用した継続的な改善サイクルを提供。ファーストビュー、CTA文言、フォーム項目など、各要素のA/Bテストを実施しCVR向上を支援します。",
    },
  ],
  process: [
    {
      number: "01",
      title: "ヒアリング & ワイヤーフレーム",
      description: "ターゲット・KPIを整理し、情報構成とページ構造のワイヤーフレームを作成します。",
    },
    {
      number: "02",
      title: "デザインカンプ作成",
      description: "ブランドガイドラインに沿ったビジュアルデザインを制作。2案からお選びいただけます。",
    },
    {
      number: "03",
      title: "コーディング & 実装",
      description: "レスポンシブ対応・フォーム実装・タグ設置まで一括で対応します。",
    },
    {
      number: "04",
      title: "テスト & 公開",
      description: "各デバイス・ブラウザでの表示テスト後、本番環境へデプロイします。",
    },
    {
      number: "05",
      title: "運用改善サポート",
      description: "公開後のアクセス解析・ヒートマップ分析に基づく改善提案を継続的に実施します。",
    },
  ],
  faq: [
    {
      question: "LPとホームページの違いは何ですか？",
      answer:
        "LPは特定のアクション（問い合わせ・購入など）に特化した1枚ページです。ホームページが情報の網羅性を重視するのに対し、LPはコンバージョン率の最大化を目的として設計されます。",
    },
    {
      question: "スマートフォン対応は含まれていますか？",
      answer:
        "はい、全プランでレスポンシブ対応が標準で含まれています。スマートフォンファーストでデザインし、PC・タブレットでも最適な表示を実現します。",
    },
    {
      question: "フォームの設置も対応していますか？",
      answer:
        "はい、お問い合わせフォームや申し込みフォームの実装も含まれています。Google Forms連携やメール通知設定にも対応可能です。",
    },
    {
      question: "既存のLPの改善だけ依頼できますか？",
      answer:
        "はい、既存LPの分析・改善のみのご依頼も承っています。ヒートマップ分析に基づく具体的な改善提案と実装を行います。",
    },
  ],
};

/* ─── 多言語対応 ─── */
const multilingualService: ServiceData = {
  slug: "multilingual",
  title: "多言語対応",
  englishTitle: "MULTILINGUAL",
  subtitle: "68言語対応でグローバルな情報発信を",
  accentColor: "#88F2F2",
  description:
    "動画・LP・Webコンテンツの多言語展開をワンストップでサポート。ネイティブ翻訳者とAI翻訳のハイブリッド体制で、高品質かつスピーディなローカライゼーションを実現します。",
  features: [
    {
      number: "01",
      title: "68言語に対応",
      description:
        "英語・中国語・韓国語はもちろん、ベトナム語・タイ語・アラビア語など68言語をカバー。各言語のネイティブスピーカーが翻訳・校正を担当し、自然な表現を実現します。",
    },
    {
      number: "02",
      title: "文化的ローカライゼーション",
      description:
        "単なる翻訳ではなく、対象地域の文化・慣習・商習慣を考慮したローカライゼーションを提供。色彩・レイアウト・表現を現地市場に合わせて最適化します。",
    },
    {
      number: "03",
      title: "動画 & LP 一括多言語化",
      description:
        "動画の字幕・ナレーション差し替えからLP全体の翻訳・デザイン調整まで、コンテンツの多言語展開をワンストップで対応。メディアをまたいだ統一感のある多言語展開が可能です。",
    },
    {
      number: "04",
      title: "AI + ネイティブのハイブリッド翻訳",
      description:
        "AI翻訳による高速な初稿作成と、ネイティブ翻訳者によるクオリティチェックを組み合わせたハイブリッド体制。品質とスピードを両立します。",
    },
  ],
  process: [
    {
      number: "01",
      title: "対象言語 & 範囲の確認",
      description: "翻訳対象のコンテンツと言語をヒアリングし、最適なプランをご提案します。",
    },
    {
      number: "02",
      title: "用語集 & スタイルガイド作成",
      description: "業界用語やブランド固有の表現を用語集にまとめ、翻訳品質の一貫性を担保します。",
    },
    {
      number: "03",
      title: "翻訳 & ローカライゼーション",
      description: "AI初稿 → ネイティブ校正 → クロスチェックの3段階プロセスで高品質な翻訳を提供します。",
    },
    {
      number: "04",
      title: "デザイン反映 & 納品",
      description: "翻訳テキストを動画・LP・Webコンテンツに反映し、最終チェック後に納品します。",
    },
  ],
  faq: [
    {
      question: "対応していない言語はありますか？",
      answer:
        "主要68言語に対応していますが、一部の少数言語については別途ご相談ください。対応可否と費用を個別にお見積りいたします。",
    },
    {
      question: "翻訳の品質はどのように担保していますか？",
      answer:
        "ネイティブ翻訳者による翻訳 → 別のネイティブによる校正 → プロジェクトマネージャーによる最終チェックの3段階体制で品質を担保しています。",
    },
    {
      question: "既存の動画に字幕を追加することは可能ですか？",
      answer:
        "はい、可能です。既存の動画ファイルをお預かりし、指定言語の字幕ファイル（SRT等）の作成や、動画への焼き込みに対応しています。",
    },
    {
      question: "翻訳のボリューム割引はありますか？",
      answer:
        "大量の翻訳案件にはボリュームディスカウントをご用意しています。詳細は担当営業にお問い合わせください。",
    },
  ],
};

/* ─── 広告運用代行 ─── */
const adManagementService: ServiceData = {
  slug: "ad-management",
  title: "広告運用代行",
  englishTitle: "AD MANAGEMENT",
  subtitle: "データドリブンな広告運用でROIを最大化",
  accentColor: "#C9F77F",
  description:
    "Google広告・Meta広告・YouTube広告など主要プラットフォームの広告運用を一括代行。クリエイティブ制作から入稿・運用・レポーティングまで、広告成果の最大化にコミットします。",
  features: [
    {
      number: "01",
      title: "主要プラットフォーム一括運用",
      description:
        "Google広告（検索・ディスプレイ）、Meta広告（Facebook・Instagram）、YouTube広告、LINE広告など、主要媒体を横断的に運用。予算配分の最適化で全体ROIを最大化します。",
    },
    {
      number: "02",
      title: "クリエイティブ制作との連携",
      description:
        "動画制作・LP制作チームと密に連携し、広告クリエイティブの企画・制作から入稿まで一気通貫で対応。クリエイティブのPDCAを高速で回します。",
    },
    {
      number: "03",
      title: "週次レポート & 改善提案",
      description:
        "毎週の運用レポートに加え、データに基づく具体的な改善施策を提案。CPA・ROAS・CTRなどのKPIを可視化し、透明性の高い運用を実現します。",
    },
  ],
  process: [
    {
      number: "01",
      title: "現状分析 & 戦略策定",
      description: "現在の広告運用状況を分析し、目標KPIに基づく媒体戦略・予算配分を策定します。",
    },
    {
      number: "02",
      title: "アカウント設計 & クリエイティブ制作",
      description: "キャンペーン構成・ターゲティング設計を行い、広告クリエイティブを制作します。",
    },
    {
      number: "03",
      title: "入稿 & 運用開始",
      description: "各媒体への入稿後、入札調整・ターゲティング最適化を行いながら運用を開始します。",
    },
    {
      number: "04",
      title: "分析 & 継続改善",
      description: "週次レポートに基づきクリエイティブ・ターゲティング・入札の改善を継続的に実施します。",
    },
  ],
  faq: [
    {
      question: "最低出稿金額はありますか？",
      answer:
        "最低出稿金額の制限は設けていませんが、効果的な運用のためには月額10万円以上の広告費を推奨しています。予算に応じた最適な媒体選定をご提案します。",
    },
    {
      question: "運用手数料はどのくらいですか？",
      answer:
        "広告費の20%を運用手数料としていただいています。クリエイティブ制作費は別途となりますが、Creative Baseのプラン内で制作する場合は追加費用なしで対応可能です。",
    },
    {
      question: "既存のアカウントを引き継ぐことは可能ですか？",
      answer:
        "はい、既存の広告アカウントの引き継ぎに対応しています。過去のデータを活かした運用改善が可能です。新規アカウントの開設も無料で対応いたします。",
    },
    {
      question: "レポートはどのような形式で提供されますか？",
      answer:
        "Googleスプレッドシートによる週次レポートと、月次のサマリーレポート（PDF）を提供しています。ダッシュボードでリアルタイムの数値確認も可能です。",
    },
  ],
};

/* ─── AIモデル生成 ─── */
const aiModelService: ServiceData = {
  slug: "ai-model",
  title: "AIモデル生成",
  englishTitle: "AI MODEL",
  subtitle: "リアルなAIモデルでキャスティング不要・コスト大幅削減",
  accentColor: "#FFC68D",
  description:
    "最先端のAI技術により、年齢・性別・国籍を自由に設定したリアルなAIモデルを生成。従来のモデルキャスティングが不要になり、撮影コストを大幅に削減しながら、68言語対応のナレーション付きAIモデル動画やLP統合まで一気通貫で対応します。",
  features: [
    {
      number: "01",
      title: "年齢・性別・国籍を自由に設定",
      description:
        "ターゲット層に最適なAIモデルを自在に生成。日本人・外国人・ベビー・キッズ・シニアまで幅広いカテゴリに対応し、ブランドイメージに合った専属モデルを制作します。",
    },
    {
      number: "02",
      title: "キャスティング不要でコスト大幅削減",
      description:
        "モデルのキャスティング費用、撮影スタジオ代、ヘアメイク費用を大幅にカット。表情・ポーズ・衣装の変更も再撮影なしで対応でき、PDCAサイクルを高速で回せます。",
    },
    {
      number: "03",
      title: "68言語対応AIモデル動画",
      description:
        "生成したAIモデルに68言語のナレーションを組み合わせ、グローバル向け動画を一括制作。Creative Base独自の多言語×AI技術で、海外展開をスピーディに実現します。",
    },
    {
      number: "04",
      title: "AIモデル × LP・バナー統合",
      description:
        "生成したAIモデルをLP、広告バナー、SNS投稿まで横断的に活用。一貫したビジュアルでブランドの統一感を維持しながら、媒体ごとに最適化したクリエイティブを展開します。",
    },
  ],
  process: [
    {
      number: "01",
      title: "ヒアリング & モデル設計",
      description:
        "ターゲット層・利用シーン・ブランドイメージをヒアリングし、最適なAIモデルの方向性を設計します。",
    },
    {
      number: "02",
      title: "AIモデル生成 & 確認",
      description:
        "複数のAIモデル候補を生成し、ご確認いただきます。表情・髪型・雰囲気の微調整も可能です。",
    },
    {
      number: "03",
      title: "商品撮影 & AI合成",
      description:
        "必要に応じて商品の撮影を行い、AIモデルとの高品質なグラフィック合成処理を実施します。",
    },
    {
      number: "04",
      title: "クリエイティブ展開 & 納品",
      description:
        "LP・バナー・動画などご指定の媒体向けにクリエイティブを展開し、各フォーマットで納品します。",
    },
  ],
  faq: [
    {
      question: "AIモデルの著作権はどうなりますか？",
      answer:
        "オリジナルAIモデルの場合、制作後の使用権はお客様に帰属します。商品数・媒体・エリアの使用制限はなく、自由にご利用いただけます。",
    },
    {
      question: "既存のAIモデルとオリジナル制作の違いは何ですか？",
      answer:
        "既存モデルは年間契約で即利用可能。オリジナル制作はお客様のブランドに合わせたカスタムモデルを買取形式で作成するため、他社との差別化が可能です。",
    },
    {
      question: "AIモデルの表情やポーズは変更できますか？",
      answer:
        "はい、生成後も表情・ヘアスタイル・ポーズ・衣装の変更が可能です。再撮影なしで複数パターンのビジュアルを制作できるため、A/Bテストにも最適です。",
    },
    {
      question: "印刷物にも使える画質ですか？",
      answer:
        "独自のアップスケール技術により4,000ピクセル以上の高解像度に対応。ポスター・チラシ・カタログなどの印刷媒体でも高品質な仕上がりを実現します。",
    },
  ],
};

/* ─── AIバナー・クリエイティブ制作 ─── */
const aiBannerService: ServiceData = {
  slug: "ai-banner",
  title: "AIバナー・クリエイティブ制作",
  englishTitle: "AI BANNER",
  subtitle: "AIモデル × デザインで高品質バナーを高速制作",
  accentColor: "#FFE066",
  description:
    "AIモデルとプロのデザインを組み合わせ、既視感のない高品質な広告バナーを高速制作。ダイエット・美容・アパレルなど11業種に対応したテンプレートと、68言語同時制作でグローバル展開をスピーディに実現します。",
  features: [
    {
      number: "01",
      title: "AIモデル × プロデザインの融合",
      description:
        "リアルなAIモデルとプロのグラフィックデザインを組み合わせ、ストックフォトの「既視感」を排除。ターゲットの悩みにダイレクトに訴求するオリジナルバナーでCTR向上を実現します。",
    },
    {
      number: "02",
      title: "11業種対応テンプレート",
      description:
        "ダイエット・サプリ、美容整形、アパレル、介護、ウエディング、飲食店、専門学校など11業種のノウハウを蓄積。業種特有のクリエイティブパターンで効果的なバナーを制作します。",
    },
    {
      number: "03",
      title: "68言語バナー同時制作",
      description:
        "Creative Base独自の多言語対応技術により、1つのデザインベースから68言語のバナーを同時制作。グローバルキャンペーンの展開スピードを飛躍的に向上させます。",
    },
    {
      number: "04",
      title: "LP連動クリエイティブ",
      description:
        "バナーからLP、SNS投稿まで一貫したビジュアルで制作。広告→LP→コンバージョンの導線全体を最適化し、CPAの改善に貢献します。",
    },
  ],
  process: [
    {
      number: "01",
      title: "ヒアリング & ターゲット設計",
      description:
        "配信媒体・ターゲット層・訴求ポイントをヒアリングし、最適なクリエイティブの方向性を設計します。",
    },
    {
      number: "02",
      title: "AIモデル選定 & デザイン制作",
      description:
        "ターゲットに最適なAIモデルを選定・生成し、キャッチコピーとデザインを組み合わせたバナーを制作します。",
    },
    {
      number: "03",
      title: "多言語展開 & フォーマット調整",
      description:
        "各媒体（Google・Meta・LINE等）の仕様に合わせたサイズ展開と多言語バリエーションを一括制作します。",
    },
    {
      number: "04",
      title: "納品 & 効果検証サポート",
      description:
        "バナーデータを納品後、配信結果に基づくA/Bテスト用バリエーション制作もスピーディに対応します。",
    },
  ],
  faq: [
    {
      question: "バナー1点あたりの制作期間は？",
      answer:
        "通常3〜5営業日で納品可能です。AIモデル生成とデザイン制作を並行して進めるため、従来の撮影→デザインフローより大幅に短縮できます。",
    },
    {
      question: "どの広告媒体に対応していますか？",
      answer:
        "Google広告（検索・ディスプレイ・YouTube）、Meta広告（Facebook・Instagram）、LINE広告、TikTok広告など主要媒体の全サイズに対応しています。",
    },
    {
      question: "バナーのみの依頼も可能ですか？",
      answer:
        "はい、バナー制作のみのスポット依頼も承っています。広告運用代行やLP制作との組み合わせでよりシナジーの高い施策も可能です。",
    },
    {
      question: "修正は何回まで対応していますか？",
      answer:
        "基本プランでは2回まで含まれています。AIモデルの変更やコピーの修正は迅速に対応可能です。大幅なデザイン変更は別途お見積りとなります。",
    },
  ],
};

/* ─── AIインフルエンサー運用 ─── */
const aiInfluencerService: ServiceData = {
  slug: "ai-influencer",
  title: "AIインフルエンサー運用",
  englishTitle: "AI INFLUENCER",
  subtitle: "AIインフルエンサー作成からSNS運用代行まで",
  accentColor: "#FFA2A2",
  description:
    "パーソナリティとストーリー性を持つオリジナルAIインフルエンサーを作成し、Instagram・TikTok・YouTube ShortsのSNS運用まで一括代行。Creative Base独自の多言語SNS展開と動画コンテンツ連携で、グローバルなブランド発信を実現します。",
  features: [
    {
      number: "01",
      title: "オリジナルAIインフルエンサー作成",
      description:
        "リアルさと個性を兼ね備えたAIインフルエンサーを作成。年齢・性別・キャラクター設定まで自由にカスタマイズし、ブランドの世界観に合った唯一無二のインフルエンサーを生み出します。",
    },
    {
      number: "02",
      title: "SNS運用代行（企画・制作・投稿）",
      description:
        "投稿企画からコンテンツ制作、投稿スケジュール管理まで一括代行。AIインフルエンサーの世界観を維持しながら、エンゲージメント率の最大化を目指します。",
    },
    {
      number: "03",
      title: "多言語SNS展開",
      description:
        "68言語対応の翻訳・ローカライズ技術を活かし、1つのAIインフルエンサーで多言語のSNSアカウントを同時展開。海外市場へのリーチを効率的に拡大します。",
    },
    {
      number: "04",
      title: "動画コンテンツ連携",
      description:
        "AIインフルエンサーを活用した縦型ショート動画（Reels・TikTok・Shorts）の制作にも対応。静止画だけでなく動画でのブランド訴求でバズ化を狙います。",
    },
  ],
  process: [
    {
      number: "01",
      title: "コンセプト設計",
      description:
        "ブランド・ターゲット層に合わせたAIインフルエンサーのキャラクター設定（性格・ビジュアル・ストーリー）を設計します。",
    },
    {
      number: "02",
      title: "AIインフルエンサー生成",
      description:
        "設計に基づきAIインフルエンサーを生成。複数パターンからお選びいただき、微調整を行います。",
    },
    {
      number: "03",
      title: "SNS戦略策定 & コンテンツ制作",
      description:
        "投稿カレンダー・コンテンツテーマを策定し、写真・動画コンテンツを制作します。",
    },
    {
      number: "04",
      title: "運用開始 & PDCA",
      description:
        "投稿・エンゲージメント分析・改善を継続的に実施。月次レポートで効果を可視化します。",
    },
    {
      number: "05",
      title: "マルチプラットフォーム展開",
      description:
        "Instagram→TikTok→YouTube Shortsの順に展開を拡大。プレスリリース連携でメディア露出も狙います。",
    },
  ],
  faq: [
    {
      question: "AIインフルエンサーとは何ですか？",
      answer:
        "AI技術で生成された架空の人物をSNS上でインフルエンサーとして運用するサービスです。実在のインフルエンサーと異なり、スキャンダルリスクがなく、24時間365日安定した活動が可能です。",
    },
    {
      question: "どのSNSプラットフォームに対応していますか？",
      answer:
        "Instagram、TikTok、YouTube Shorts、X（Twitter）に対応しています。プラットフォームごとにコンテンツを最適化して投稿します。",
    },
    {
      question: "フォロワーの増加は保証されますか？",
      answer:
        "フォロワー数の保証はしておりませんが、エンゲージメント率の向上を重視した運用を行います。広告運用と組み合わせることで、効率的なフォロワー獲得も可能です。",
    },
    {
      question: "途中でAIインフルエンサーのビジュアルを変更できますか？",
      answer:
        "大幅な変更はブランドの一貫性に影響するため推奨しませんが、髪型・メイク・ファッションの季節変更などは柔軟に対応可能です。",
    },
  ],
};

/* ─── Export ─── */
export const ALL_SERVICES: ServiceData[] = [
  videoService,
  lpService,
  multilingualService,
  adManagementService,
  aiModelService,
  aiBannerService,
  aiInfluencerService,
];

export function getServiceBySlug(slug: string): ServiceData | undefined {
  return ALL_SERVICES.find((s) => s.slug === slug);
}
