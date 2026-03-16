/**
 * LP生成ステータス定数
 */

export type LpStatus =
  | "pending"
  | "reviewing"
  | "generating"
  | "editing"
  | "preview_ready"
  | "revision"
  | "approved"
  | "published"
  | "archived";

export const LP_STATUS_MAP: Record<
  LpStatus,
  { label: string; color: string; order: number }
> = {
  pending: { label: "受付中", color: "bg-yellow-100 text-yellow-700", order: 1 },
  reviewing: { label: "素材確認中", color: "bg-orange-100 text-orange-700", order: 2 },
  generating: { label: "生成中", color: "bg-cyan-100 text-cyan-700", order: 3 },
  editing: { label: "編集中", color: "bg-blue-100 text-blue-700", order: 4 },
  preview_ready: { label: "プレビュー待ち", color: "bg-indigo-100 text-indigo-700", order: 5 },
  revision: { label: "修正依頼", color: "bg-red-100 text-red-700", order: 6 },
  approved: { label: "承認済", color: "bg-emerald-100 text-emerald-700", order: 7 },
  published: { label: "公開中", color: "bg-green-100 text-green-700", order: 8 },
  archived: { label: "アーカイブ", color: "bg-gray-100 text-gray-700", order: 9 },
};

/**
 * ステータスのラベルを取得
 */
export function getLpStatusLabel(status: string): string {
  return (LP_STATUS_MAP as Record<string, { label: string }>)[status]?.label ?? status;
}

/**
 * ステータスのカラーCSSクラスを取得
 */
export function getLpStatusColor(status: string): string {
  return (LP_STATUS_MAP as Record<string, { color: string }>)[status]?.color ?? "bg-gray-100 text-gray-700";
}

/**
 * タイムライン表示用ステータス一覧（主要フローのみ）
 */
export const LP_TIMELINE_STATUSES: LpStatus[] = [
  "pending",
  "reviewing",
  "generating",
  "editing",
  "preview_ready",
  "approved",
  "published",
];

/**
 * 有効なステータス遷移マップ
 */
export const LP_STATUS_TRANSITIONS: Record<LpStatus, LpStatus[]> = {
  pending: ["reviewing"],
  reviewing: ["generating"],
  generating: ["editing"],
  editing: ["preview_ready"],
  preview_ready: ["approved", "revision"],
  revision: ["editing"],
  approved: ["published"],
  published: ["editing", "archived"],
  archived: [],
};

/**
 * ステータス遷移の妥当性チェック
 */
export function isValidLpTransition(from: LpStatus, to: LpStatus): boolean {
  return LP_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * LP削除可能かどうか（公開中は削除不可）
 */
export function canDeleteLp(status: LpStatus): boolean {
  return status !== "published";
}
