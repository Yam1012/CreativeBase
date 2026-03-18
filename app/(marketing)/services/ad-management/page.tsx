import { ServiceDetailPage } from "@/components/marketing";
import { getServiceBySlug } from "@/lib/service-data";

export const metadata = {
  title: "広告運用代行 | Creative Base",
  description:
    "Google広告・Meta広告・YouTube広告など主要プラットフォームの広告運用を一括代行。ROI最大化にコミットします。",
};

export default function AdManagementServicePage() {
  const service = getServiceBySlug("ad-management")!;
  return <ServiceDetailPage service={service} />;
}
