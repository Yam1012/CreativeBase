import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import InquiryForm from "./inquiry-form";

export default async function InquiryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userName = (session.user as { name?: string }).name || "";

  return <InquiryForm userName={userName} />;
}
