import { ServiceDetailPage } from "@/components/marketing";
import { getServiceBySlug } from "@/lib/service-data";

export const metadata = {
  title: "多言語対応 | Creative Base",
  description:
    "68言語対応でグローバルな情報発信を。ネイティブ翻訳者とAI翻訳のハイブリッド体制で高品質なローカライゼーションを実現します。",
};

export default function MultilingualServicePage() {
  const service = getServiceBySlug("multilingual")!;
  return <ServiceDetailPage service={service} />;
}
