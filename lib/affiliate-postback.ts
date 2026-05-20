/**
 * アフィリエイトASPへのS2S Postback送信
 * Stripe決済成功時に呼び出される
 *
 * 環境変数で URL とテンプレートを管理:
 * - RENTRACKS_POSTBACK_URL=https://www.rentracks.jp/c/postback?sid=15534&aff_id={affiliateId}&order_id={paymentId}&price={amount}
 * - MOSHIMO_POSTBACK_URL=https://api.moshimo.com/postback?promotion_id=xxx&aff_id={affiliateId}&order={paymentId}&amount={amount}
 *
 * URL内のプレースホルダ {affiliateId} {paymentId} {amount} {userId} {timestamp} を実値で置換
 */
import { prisma } from "@/lib/prisma";

interface PostbackParams {
  source: string;       // rentracks | moshimo | other
  affiliateId: string;  // ASPから受け取った識別子
  paymentId: string;    // CreativeBase の Payment ID
  amount: number;       // 決済額（税別）
  userId: string;
}

/**
 * 設定された Postback URL に応じてASPへS2S通知
 */
export async function sendAffiliatePostback(
  logId: string,
  params: PostbackParams
): Promise<{ success: boolean; url?: string; error?: string }> {
  const envKey = `${params.source.toUpperCase()}_POSTBACK_URL`;
  const template = process.env[envKey];

  if (!template) {
    // 未設定はスキップ（CVタグ側で対応）
    await prisma.externalAffiliateLog.update({
      where: { id: logId },
      data: { notificationStatus: "skipped", notificationError: `${envKey} 未設定` },
    });
    return { success: false, error: `${envKey} 未設定（スキップ）` };
  }

  // プレースホルダ置換
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const url = template
    .replaceAll("{affiliateId}", encodeURIComponent(params.affiliateId))
    .replaceAll("{paymentId}", encodeURIComponent(params.paymentId))
    .replaceAll("{amount}", String(params.amount))
    .replaceAll("{userId}", encodeURIComponent(params.userId))
    .replaceAll("{timestamp}", timestamp);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "CreativeBase-Postback/1.0",
      },
      signal: AbortSignal.timeout(10000), // 10秒タイムアウト
    });

    if (res.ok || res.status === 302) {
      await prisma.externalAffiliateLog.update({
        where: { id: logId },
        data: {
          notificationStatus: "sent",
          notifiedAt: new Date(),
          notificationError: null,
        },
      });
      return { success: true, url };
    } else {
      const errorText = `HTTP ${res.status}`;
      await prisma.externalAffiliateLog.update({
        where: { id: logId },
        data: { notificationStatus: "failed", notificationError: errorText },
      });
      return { success: false, url, error: errorText };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.externalAffiliateLog.update({
      where: { id: logId },
      data: { notificationStatus: "failed", notificationError: message },
    });
    return { success: false, url, error: message };
  }
}
