"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ContractActions({
  contractId,
  currentStatus,
}: {
  contractId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  async function handleUpdate() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/contracts/${contractId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) { toast.error("更新に失敗しました"); return; }
      toast.success("ステータスを更新しました");
      router.refresh();
    } finally { setLoading(false); }
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-28 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">契約中</SelectItem>
          <SelectItem value="pending">処理中</SelectItem>
          <SelectItem value="cancelled">解約済</SelectItem>
        </SelectContent>
      </Select>
      <Button
        size="sm"
        className="h-8 text-xs bg-slate-700 hover:bg-slate-600"
        onClick={handleUpdate}
        disabled={loading || status === currentStatus}
      >
        更新
      </Button>
    </div>
  );
}
