/**
 * 「何飲む？」アプリのドメインロジック
 *
 * メニュー写真から読み取った品目に対して、
 * 参加メンバーそれぞれの注文を積み上げ → 店員さんに伝える単位で集計する。
 *
 * 副作用を持たない純粋関数のみを置く（UI からもテストからも使える）。
 */

export const DRINK_CATEGORIES = [
  "ビール",
  "サワー・チューハイ",
  "ハイボール・ウイスキー",
  "日本酒",
  "焼酎",
  "ワイン",
  "カクテル",
  "ソフトドリンク",
  "フード",
  "その他",
] as const;

export type DrinkCategory = (typeof DRINK_CATEGORIES)[number];

/** カテゴリごとの表示色（Tailwind クラス） */
export const CATEGORY_STYLES: Record<DrinkCategory, string> = {
  ビール: "bg-amber-100 text-amber-800",
  "サワー・チューハイ": "bg-lime-100 text-lime-800",
  "ハイボール・ウイスキー": "bg-orange-100 text-orange-800",
  日本酒: "bg-sky-100 text-sky-800",
  焼酎: "bg-emerald-100 text-emerald-800",
  ワイン: "bg-rose-100 text-rose-800",
  カクテル: "bg-fuchsia-100 text-fuchsia-800",
  ソフトドリンク: "bg-cyan-100 text-cyan-800",
  フード: "bg-stone-200 text-stone-700",
  その他: "bg-slate-100 text-slate-700",
};

export interface MenuItem {
  id: string;
  name: string;
  /** 読み取れなかった場合は null */
  price: number | null;
  category: DrinkCategory;
}

export interface Member {
  id: string;
  name: string;
}

/** memberId → itemId → 杯数 */
export type OrderMap = Record<string, Record<string, number>>;

export interface AggregatedLine {
  item: MenuItem;
  qty: number;
  /** 価格不明の場合は null */
  subtotal: number | null;
  /** 誰が頼んだか（表示順はメンバー登録順） */
  orderedBy: { member: Member; qty: number }[];
}

export interface MemberTotal {
  member: Member;
  qty: number;
  /** 価格不明の品は 0 円として加算される */
  amount: number;
}

export interface Aggregation {
  /** 数量の多い順 → 同数ならカテゴリ順のライン一覧 */
  lines: AggregatedLine[];
  totalQty: number;
  totalAmount: number;
  /** 価格不明の品が含まれているか（合計金額が参考値になる） */
  hasUnknownPrice: boolean;
  memberTotals: MemberTotal[];
  /** まだ 1 杯も選んでいないメンバー */
  undecided: Member[];
}

/** 衝突しにくい ID を生成（DB を使わないのでクライアント側で採番する） */
export function newId(prefix = "id"): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}

export function formatYen(value: number): string {
  return `¥${value.toLocaleString("ja-JP")}`;
}

export function isDrinkCategory(value: unknown): value is DrinkCategory {
  return (
    typeof value === "string" &&
    (DRINK_CATEGORIES as readonly string[]).includes(value)
  );
}

/** 注文表から 1 品の杯数を取り出す */
export function getQty(orders: OrderMap, memberId: string, itemId: string): number {
  return orders[memberId]?.[itemId] ?? 0;
}

/**
 * 杯数を増減した新しい注文表を返す（0 以下になったキーは削除して肥大化を防ぐ）
 */
export function setQty(
  orders: OrderMap,
  memberId: string,
  itemId: string,
  qty: number
): OrderMap {
  const next: OrderMap = { ...orders, [memberId]: { ...(orders[memberId] ?? {}) } };
  if (qty > 0) {
    next[memberId][itemId] = qty;
  } else {
    delete next[memberId][itemId];
  }
  return next;
}

/** メンバー削除・品目削除に追従して、参照切れの注文を落とす */
export function pruneOrders(
  orders: OrderMap,
  members: Member[],
  items: MenuItem[]
): OrderMap {
  const memberIds = new Set(members.map((m) => m.id));
  const itemIds = new Set(items.map((i) => i.id));
  const next: OrderMap = {};
  for (const [memberId, byItem] of Object.entries(orders)) {
    if (!memberIds.has(memberId)) continue;
    const cleaned: Record<string, number> = {};
    for (const [itemId, qty] of Object.entries(byItem)) {
      if (itemIds.has(itemId) && qty > 0) cleaned[itemId] = qty;
    }
    next[memberId] = cleaned;
  }
  return next;
}

/**
 * 注文をテーブル全体で集計する。
 * 店員さんには「品目 × 合計杯数」で伝えるので、そこを最上位の並びにする。
 */
export function aggregateOrders(
  items: MenuItem[],
  members: Member[],
  orders: OrderMap
): Aggregation {
  const categoryRank = new Map<DrinkCategory, number>(
    DRINK_CATEGORIES.map((c, i) => [c, i])
  );

  const lines: AggregatedLine[] = [];
  let totalQty = 0;
  let totalAmount = 0;
  let hasUnknownPrice = false;

  for (const item of items) {
    const orderedBy = members
      .map((member) => ({ member, qty: getQty(orders, member.id, item.id) }))
      .filter((entry) => entry.qty > 0);

    const qty = orderedBy.reduce((sum, entry) => sum + entry.qty, 0);
    if (qty === 0) continue;

    const subtotal = item.price === null ? null : item.price * qty;
    if (subtotal === null) {
      hasUnknownPrice = true;
    } else {
      totalAmount += subtotal;
    }
    totalQty += qty;

    lines.push({ item, qty, subtotal, orderedBy });
  }

  lines.sort((a, b) => {
    if (b.qty !== a.qty) return b.qty - a.qty;
    const rankDiff =
      (categoryRank.get(a.item.category) ?? 99) -
      (categoryRank.get(b.item.category) ?? 99);
    if (rankDiff !== 0) return rankDiff;
    return a.item.name.localeCompare(b.item.name, "ja");
  });

  const memberTotals: MemberTotal[] = members.map((member) => {
    const byItem = orders[member.id] ?? {};
    let qty = 0;
    let amount = 0;
    for (const item of items) {
      const q = byItem[item.id] ?? 0;
      if (q <= 0) continue;
      qty += q;
      amount += (item.price ?? 0) * q;
    }
    return { member, qty, amount };
  });

  return {
    lines,
    totalQty,
    totalAmount,
    hasUnknownPrice,
    memberTotals,
    undecided: memberTotals.filter((t) => t.qty === 0).map((t) => t.member),
  };
}

/**
 * 店員さんに読み上げる／LINE に貼る用のテキストを組み立てる
 */
export function buildOrderText(
  aggregation: Aggregation,
  options: { includeMembers?: boolean; shopName?: string } = {}
): string {
  const { includeMembers = false, shopName } = options;
  const lines: string[] = [];

  lines.push(shopName ? `【注文】${shopName}` : "【注文】");

  if (aggregation.lines.length === 0) {
    lines.push("（まだ何も選ばれていません）");
    return lines.join("\n");
  }

  for (const line of aggregation.lines) {
    const who =
      includeMembers && line.orderedBy.length > 0
        ? `（${line.orderedBy
            .map((e) => (e.qty > 1 ? `${e.member.name}×${e.qty}` : e.member.name))
            .join("・")}）`
        : "";
    lines.push(`・${line.item.name} ${line.qty}点${who}`);
  }

  lines.push("");
  const total = aggregation.hasUnknownPrice
    ? `${formatYen(aggregation.totalAmount)}〜（価格不明の品あり）`
    : formatYen(aggregation.totalAmount);
  lines.push(`合計 ${aggregation.totalQty}点 / ${total}`);

  return lines.join("\n");
}

/**
 * 均等割り勘。1 人あたりを roundTo 単位に切り上げ、切り上げで出た超過分は
 * 後ろの人から差し引く（合計は必ず total ちょうどになる）。
 * 例: 3,800円 / 3人 / 100円単位 → [1300, 1300, 1200]
 *     2,740円 / 3人 / 100円単位 → [1000, 1000, 740]
 */
export function splitEvenly(
  total: number,
  count: number,
  roundTo = 100
): number[] {
  if (count <= 0 || total <= 0) return [];
  const unit = Math.max(1, roundTo);
  const each = Math.ceil(total / count / unit) * unit;
  const shares = Array<number>(count).fill(each);
  let excess = each * count - total;
  for (let i = count - 1; i >= 0 && excess > 0; i--) {
    const cut = Math.min(shares[i], excess);
    shares[i] -= cut;
    excess -= cut;
  }
  return shares;
}

/**
 * 「迷ったらおまかせ」用のランダム 1 杯。
 * ノンアル希望のときはソフトドリンクだけから選ぶ。
 */
export function pickRandomItem(
  items: MenuItem[],
  options: { softOnly?: boolean } = {}
): MenuItem | null {
  const pool = options.softOnly
    ? items.filter((i) => i.category === "ソフトドリンク")
    : items.filter((i) => i.category !== "フード");
  const candidates = pool.length > 0 ? pool : items;
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}
