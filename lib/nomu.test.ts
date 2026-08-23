/**
 * 「何飲む？」の集計ロジックのテスト
 *
 * 実行: npm run test:nomu
 * （テストランナーは導入していないので node:assert のみで書く）
 */

import assert from "node:assert/strict";
import {
  aggregateOrders,
  buildOrderText,
  diffOrders,
  pickRandomItem,
  pruneOrders,
  setQty,
  splitEvenly,
  type Member,
  type MenuItem,
  type OrderMap,
} from "@/lib/nomu";

const items: MenuItem[] = [
  { id: "i1", name: "生ビール（中）", price: 580, category: "ビール" },
  { id: "i2", name: "ハイボール", price: 500, category: "ハイボール・ウイスキー" },
  { id: "i3", name: "本日の日本酒", price: null, category: "日本酒" },
  { id: "i4", name: "枝豆", price: 380, category: "フード" },
];

const members: Member[] = [
  { id: "m1", name: "あさこ" },
  { id: "m2", name: "ベン" },
  { id: "m3", name: "ちひろ" },
];

let orders: OrderMap = {};
orders = setQty(orders, "m1", "i1", 2);
orders = setQty(orders, "m2", "i1", 1);
orders = setQty(orders, "m2", "i2", 2);
orders = setQty(orders, "m3", "i3", 1);

const agg = aggregateOrders(items, members, orders);

// 杯数の多い順に並ぶ
assert.deepEqual(
  agg.lines.map((l) => [l.item.name, l.qty]),
  [
    ["生ビール（中）", 3],
    ["ハイボール", 2],
    ["本日の日本酒", 1],
  ]
);
assert.equal(agg.totalQty, 6);
// 価格不明の品は合計金額に含めず、フラグを立てる
assert.equal(agg.totalAmount, 580 * 3 + 500 * 2);
assert.equal(agg.hasUnknownPrice, true);
assert.deepEqual(agg.undecided, []);

// 誰が何杯頼んだか
assert.deepEqual(
  agg.lines[0].orderedBy.map((e) => [e.member.name, e.qty]),
  [
    ["あさこ", 2],
    ["ベン", 1],
  ]
);
assert.deepEqual(
  agg.memberTotals.map((t) => [t.member.name, t.qty, t.amount]),
  [
    ["あさこ", 2, 1160],
    ["ベン", 3, 1580],
    ["ちひろ", 1, 0],
  ]
);

// まだ選んでいない人を検出する
const withNewcomer = aggregateOrders(
  items,
  [...members, { id: "m4", name: "でん" }],
  orders
);
assert.deepEqual(
  withNewcomer.undecided.map((m) => m.name),
  ["でん"]
);

// 0 杯にしたらキーごと消える
const cleared = setQty(orders, "m1", "i1", 0);
assert.equal(cleared.m1.i1, undefined);
assert.equal(aggregateOrders(items, members, cleared).totalQty, 4);

// 削除された品目・メンバーへの参照は落ちる
assert.deepEqual(pruneOrders(orders, [members[0]], [items[1]]), { m1: {} });

// 「今回頼む分」= 現在の注文 − 発注済み
const confirmed: OrderMap = { m1: { i1: 2 }, m2: { i1: 1, i2: 2 } };
const pending = diffOrders(orders, confirmed);
assert.deepEqual(pending, { m1: {}, m2: {}, m3: { i3: 1 } });
assert.equal(aggregateOrders(items, members, pending).totalQty, 1);

// おかわりした分だけが次のラウンドに出る
const afterRefill = setQty(orders, "m1", "i1", 3);
assert.deepEqual(diffOrders(afterRefill, confirmed).m1, { i1: 1 });

// 数え間違いで減らした場合はマイナスにならない
const afterFix = setQty(orders, "m2", "i2", 1);
assert.deepEqual(diffOrders(afterFix, confirmed).m2, {});

// 発注前は全量が「今回頼む分」
assert.deepEqual(diffOrders(orders, {}), orders);

// 共有用テキスト
const text = buildOrderText(agg, { includeMembers: true, shopName: "とりや" });
assert.ok(text.startsWith("【注文】とりや"));
assert.ok(text.includes("・生ビール（中） 3点（あさこ×2・ベン）"));
assert.ok(text.includes("合計 6点 / ¥2,740〜（価格不明の品あり）"));
assert.ok(
  buildOrderText(aggregateOrders(items, members, {})).includes(
    "（まだ何も選ばれていません）"
  )
);

// 割り勘は合計とぴったり一致する
assert.deepEqual(splitEvenly(3800, 3), [1300, 1300, 1200]);
assert.deepEqual(splitEvenly(2740, 3), [1000, 1000, 740]);
assert.deepEqual(splitEvenly(3000, 3), [1000, 1000, 1000]);
assert.deepEqual(splitEvenly(150, 4), [100, 50, 0, 0]);
for (const [total, count] of [
  [3800, 3],
  [2740, 3],
  [150, 4],
  [12345, 7],
] as const) {
  assert.equal(
    splitEvenly(total, count).reduce((a, b) => a + b, 0),
    total
  );
}
assert.deepEqual(splitEvenly(0, 3), []);
assert.deepEqual(splitEvenly(1000, 0), []);

// おまかせはフードを除外する
for (let i = 0; i < 50; i++) {
  assert.notEqual(pickRandomItem(items)?.category, "フード");
}
assert.equal(pickRandomItem([]), null);
// 該当カテゴリが無い場合も何かしら返す（提案が空にならないように）
assert.ok(pickRandomItem(items, { softOnly: true }) !== null);

console.log("nomu: すべてのテストに合格しました");
