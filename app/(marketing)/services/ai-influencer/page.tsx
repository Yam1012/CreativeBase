import { ServiceDetailPage } from "@/components/marketing";
import { getServiceBySlug } from "@/lib/service-data";

export const metadata = {
  title: "AIインフルエンサー運用 | Creative Base",
  description:
    "AIインフルエンサー作成からSNS運用代行まで。多言語SNS展開と動画コンテンツ連携でグローバルなブランド発信を実現。",
};

export default function AiInfluencerServicePage() {
  const service = getServiceBySlug("ai-influencer")!;
  return <ServiceDetailPage service={service} />;
}
