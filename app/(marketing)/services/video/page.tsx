import { ServiceDetailPage } from "@/components/marketing";
import { getServiceBySlug } from "@/lib/service-data";

export const metadata = {
  title: "動画制作 | Creative Base",
  description:
    "企業PVからSNS広告動画、プロモーション映像まで。企画・構成からナレーション収録、編集までワンストップでご提供します。",
};

export default function VideoServicePage() {
  const service = getServiceBySlug("video")!;
  return <ServiceDetailPage service={service} />;
}
