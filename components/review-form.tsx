"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  orderId: string;
  existingReview?: { rating: number; comment: string | null; createdAt: string } | null;
}

export function ReviewForm({ orderId, existingReview }: Props) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(!!existingReview);

  // 既存レビュー表示モード
  if (submitted && existingReview) {
    return (
      <Card className="border-amber-300 bg-amber-50/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-amber-600" />
            ご評価ありがとうございました
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={`w-5 h-5 ${n <= existingReview.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
              />
            ))}
            <span className="text-sm ml-2 text-gray-600">{existingReview.rating} / 5</span>
          </div>
          {existingReview.comment && (
            <div className="text-sm text-gray-700 bg-white rounded p-3 border border-amber-100 whitespace-pre-wrap">
              {existingReview.comment}
            </div>
          )}
          <div className="text-xs text-gray-400">
            投稿日: {new Date(existingReview.createdAt).toLocaleDateString("ja-JP")}
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async () => {
    if (rating < 1) {
      toast.error("評価（★）を選択してください");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/mypage/orders/${orderId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "送信に失敗しました");
        return;
      }
      toast.success("ご評価ありがとうございました！");
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-amber-300 bg-amber-50/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" />
          サービスをご評価ください
        </CardTitle>
        <p className="text-xs text-gray-600 mt-1">
          今回のオーダーはいかがでしたか？率直なご意見が今後の改善に繋がります
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 星評価 */}
        <div className="space-y-1.5">
          <div className="text-sm font-medium">評価 <span className="text-red-500">*</span></div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(n)}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-8 h-8 ${
                    n <= (hoverRating || rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"
                  }`}
                />
              </button>
            ))}
            {rating > 0 && <span className="text-sm ml-2 text-gray-600">{rating} / 5</span>}
          </div>
        </div>

        {/* コメント */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">コメント（任意）</label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="制作物の感想、改善希望、その他何でもお書きください..."
            className="min-h-[100px] bg-white"
            maxLength={1000}
          />
          <div className="text-xs text-gray-400 text-right">{comment.length} / 1000</div>
        </div>

        <Button
          className="bg-amber-500 hover:bg-amber-400 text-white"
          onClick={handleSubmit}
          disabled={submitting || rating < 1}
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Star className="w-4 h-4 mr-1" />}
          評価を送信
        </Button>
      </CardContent>
    </Card>
  );
}
