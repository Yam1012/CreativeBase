// Stripe モック実装
// 実際のStripe APIは使用せず、成功レスポンスを返すモック

export interface MockPaymentResult {
  success: boolean;
  paymentId: string;
  amount: number;
  status: "completed" | "failed";
}

export async function mockCreatePayment(
  amount: number,
  description: string
): Promise<MockPaymentResult> {
  // モック: 常に成功
  await new Promise((resolve) => setTimeout(resolve, 500)); // 疑似遅延

  return {
    success: true,
    paymentId: `mock_pi_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    amount,
    status: "completed",
  };
}

export async function mockCreateSubscription(
  userId: string,
  courseId: string
): Promise<{ subscriptionId: string; status: string }> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    subscriptionId: `mock_sub_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    status: "active",
  };
}

export async function mockCancelSubscription(
  subscriptionId: string
): Promise<{ success: boolean }> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { success: true };
}

// 日割り残金計算
export function calcProrationRefund(
  monthlyFee: number,
  cancelDate: Date,
  periodEndDate: Date
): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const remainDays = Math.max(
    0,
    Math.ceil((periodEndDate.getTime() - cancelDate.getTime()) / msPerDay)
  );
  const daysInMonth = new Date(
    cancelDate.getFullYear(),
    cancelDate.getMonth() + 1,
    0
  ).getDate();
  return Math.floor((monthlyFee / daysInMonth) * remainDays);
}
