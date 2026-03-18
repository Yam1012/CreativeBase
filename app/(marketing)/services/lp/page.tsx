import { ServiceDetailPage } from "@/components/marketing";
import { getServiceBySlug } from "@/lib/service-data";

export const metadata = {
  title: "LP制作 | Creative Base",
  description:
    "コンバージョンに特化したランディングページを設計・制作。ヒートマップ分析とA/Bテスト対応でCVR最大化を目指します。",
};

export default function LPServicePage() {
  const service = getServiceBySlug("lp")!;
  return <ServiceDetailPage service={service} />;
}
