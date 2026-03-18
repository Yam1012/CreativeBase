import { ServiceDetailPage } from "@/components/marketing";
import { getServiceBySlug } from "@/lib/service-data";

export const metadata = {
  title: "AIモデル生成 | Creative Base",
  description:
    "リアルなAIモデルを生成。キャスティング不要でコスト削減。年齢・性別・国籍を自由に設定し、68言語対応ナレーション付きAIモデル動画まで対応。",
};

export default function AiModelServicePage() {
  const service = getServiceBySlug("ai-model")!;
  return <ServiceDetailPage service={service} />;
}
