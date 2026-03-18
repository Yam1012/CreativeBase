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

/* ─── Export ─── */
export const ALL_SERVICES: ServiceData[] = [
  videoService,
  lpService,
  multilingualService,
  adManagementService,
];

export function getServiceBySlug(slug: string): ServiceData | undefined {
  return ALL_SERVICES.find((s) => s.slug === slug);
}
