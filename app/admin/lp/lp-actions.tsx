"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Send, Globe, EyeOff, Archive, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { canDeleteLp, type LpStatus } from "@/lib/lp-status";

interface LpActionsProps {
  lpId: string;
  currentStatus: string;
}

export function LpActions({ lpId, currentStatus }: LpActionsProps) {
  const router = useRouter();
  const status = currentStatus as LpStatus;

  const callApi = async (path: string, method: string = "POST") => {
    try {
      const res = await fetch(`/api/admin/lp/${lpId}/${path}`, { method });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "操作に失敗しました");
        return false;
      }
      toast.success(data.message || "操作が完了しました");
      router.refresh();
      return true;
    } catch {
      toast.error("エラーが発生しました");
      return false;
    }
  };

  const showSubmitPreview = status === "editing" || status === "revision";
  const showPublish = status === "approved";
  const showUnpublish = status === "published";
  const showArchive = status === "published";
  const showDelete = canDeleteLp(status) && status !== "archived";

  const hasAnyAction = showSubmitPreview || showPublish || showUnpublish || showArchive || showDelete;
  if (!hasAnyAction) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {showSubmitPreview && (
          <DropdownMenuItem
            onClick={() => callApi("submit-preview")}
            className="text-blue-600"
          >
            <Send className="w-4 h-4 mr-2" /> プレビュー提出
          </DropdownMenuItem>
        )}
        {showPublish && (
          <DropdownMenuItem
            onClick={() => callApi("publish")}
            className="text-green-600"
          >
            <Globe className="w-4 h-4 mr-2" /> 公開する
          </DropdownMenuItem>
        )}
        {showUnpublish && (
          <DropdownMenuItem onClick={() => callApi("unpublish")}>
            <EyeOff className="w-4 h-4 mr-2" /> 非公開にする
          </DropdownMenuItem>
        )}
        {showArchive && (
          <DropdownMenuItem onClick={() => callApi("archive")}>
            <Archive className="w-4 h-4 mr-2" /> アーカイブ
          </DropdownMenuItem>
        )}
        {(showDelete && (showSubmitPreview || showPublish || showUnpublish || showArchive)) && (
          <DropdownMenuSeparator />
        )}
        {showDelete && (
          <DropdownMenuItem
            onClick={() => {
              if (confirm("このLPを削除しますか？")) {
                callApi("delete", "DELETE");
              }
            }}
            className="text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" /> 削除
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
