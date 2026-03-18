import { ServiceDetailPage } from "@/components/marketing";
import { getServiceBySlug } from "@/lib/service-data";

export const metadata = {
  title: "AIバナー・クリエイティブ制作 | Creative Base",
  description:
    "AIモデル×デザインで高品質バナーを高速制作。11業種対応テンプレートと68言語同時制作でグローバル展開を加速。",
};

export default function AiBannerServicePage() {
  const service = getServiceBySlug("ai-banner")!;
  return <ServiceDetailPage service={service} />;
}
