/**
 * SpotOrder ステータスのワークフロー定義
 * pending → in_progress → review_pending → completed
 *                              ↓
 *                       revision_requested → in_progress（戻る）
 */

export type OrderStatus =
  | "pending"
  | "in_progress"
  | "review_pending"
  | "revision_requested"
  | "completed";

export interface OrderStatusInfo {
  label: string;
  color: string;
  description: string;
  order: number;
}

export const ORDER_STATUS_MAP: Record<OrderStatus, OrderStatusInfo> = {
  pending: {
    label: "受付中",
    color: "bg-yellow-100 text-yellow-700",
    description: "ご注文を受け付けました。担当者の着手をお待ちください",
    order: 1,
  },
  in_progress: {
    label: "制作中",
    color: "bg-blue-100 text-blue-700",
    description: "担当者が制作中です",
    order: 2,
  },
  review_pending: {
    label: "確認待ち",
    color: "bg-indigo-100 text-indigo-700",
    description: "完成品をご確認ください（承認 or 修正依頼）",
    order: 3,
  },
  revision_requested: {
    label: "修正依頼中",
    color: "bg-orange-100 text-orange-700",
    description: "修正依頼を受け付けました。担当者が対応します",
    order: 3,
  },
  completed: {
    label: "完了",
    color: "bg-green-100 text-green-700",
    description: "ご承認いただきました。ご利用ありがとうございます",
    order: 4,
  },
};

export const ORDER_TIMELINE_STATUSES: OrderStatus[] = [
  "pending",
  "in_progress",
  "review_pending",
  "completed",
];

/**
 * 管理者が変更可能なステータス（全方向可）
 */
export const ADMIN_ALLOWED_STATUSES: OrderStatus[] = [
  "pending",
  "in_progress",
  "review_pending",
  "revision_requested",
  "completed",
];

export function getStatusInfo(status: string): OrderStatusInfo {
  return (
    ORDER_STATUS_MAP[status as OrderStatus] || {
      label: status,
      color: "bg-gray-100 text-gray-600",
      description: "",
      order: 0,
    }
  );
}
