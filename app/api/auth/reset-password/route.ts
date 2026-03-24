import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// POST /api/auth/reset-password — リクエスト送信 or パスワード再設定
export async function POST(req: Request) {
  const body = await req.json();

  // トークン + 新パスワードがある場合 → パスワード再設定
  if (body.token && body.password) {
    return handleReset(body.token, body.password);
  }

  // メールアドレスのみ → リセットリクエスト送信
  if (body.email) {
    return handleRequest(body.email);
  }

  return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
}

// リセットリクエスト（メール送信）
async function handleRequest(email: string) {
  // ユーザーの存在有無に関わらず同じレスポンスを返す（セキュリティ）
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    // 既存の未使用トークンを無効化
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { expiresAt: new Date() },
    });

    // 新しいトークン生成（64文字のランダム文字列）
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1時間

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    await sendEmail(user.id, "password_reset", {
      to: user.email,
      userName: user.name,
      resetUrl,
    });
  }

  return NextResponse.json({
    message: "入力されたメールアドレス宛にパスワード再設定のご案内を送信しました。",
  });
}

// パスワード再設定
async function handleReset(token: string, password: string) {
  if (password.length < 8) {
    return NextResponse.json(
      { error: "パスワードは8文字以上で設定してください" },
      { status: 400 }
    );
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "リンクが無効または有効期限切れです。再度リセットをお試しください。" },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ message: "パスワードを再設定しました。ログインしてください。" });
}
