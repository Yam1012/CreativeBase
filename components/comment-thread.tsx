"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Comment {
  id: string;
  message: string;
  role: string;
  createdAt: string;
  user: { name: string; role: string };
}

interface CommentThreadProps {
  orderId: string;
  currentUserRole: "user" | "admin";
}

export function CommentThread({ orderId, currentUserRole }: CommentThreadProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "送信に失敗しました");
        return;
      }
      const newComment = await res.json();
      setComments((prev) => [...prev, newComment]);
      setMessage("");
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          コメント（{comments.length}件）
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* メッセージ一覧 */}
        <div className="max-h-[300px] overflow-y-auto space-y-3">
          {loading ? (
            <div className="text-center py-4 text-gray-400 text-sm">読み込み中...</div>
          ) : comments.length === 0 ? (
            <div className="text-center py-4 text-gray-400 text-sm">
              まだコメントはありません
            </div>
          ) : (
            comments.map((c) => {
              const isAdmin = c.role === "admin";
              const isMine =
                (currentUserRole === "admin" && isAdmin) ||
                (currentUserRole === "user" && !isAdmin);
              return (
                <div
                  key={c.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      isMine
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">{c.user.name}</span>
                      <Badge
                        className={`text-[10px] px-1.5 py-0 ${
                          isAdmin
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {isAdmin ? "管理者" : "ユーザー"}
                      </Badge>
                      <span className="text-[10px] text-gray-400">
                        {new Date(c.createdAt).toLocaleString("ja-JP", {
                          month: "numeric",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{c.message}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* 投稿フォーム */}
        <div className="flex gap-2 pt-2 border-t">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="コメントを入力..."
            className="min-h-[60px] text-sm resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button
            size="sm"
            className="shrink-0 self-end"
            onClick={handleSubmit}
            disabled={sending || !message.trim()}
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-gray-400">Ctrl+Enter で送信</p>
      </CardContent>
    </Card>
  );
}
