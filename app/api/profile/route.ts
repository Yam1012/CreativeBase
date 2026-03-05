import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/email";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const { name, nameKana, email, phone, address, password } = await req.json();

  // メール重複チェック
  if (email) {
    const existing = await prisma.user.findFirst({
      where: { email, NOT: { id: userId } },
    });
    if (existing) return NextResponse.json({ error: "このメールアドレスはすでに使用されています" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {
    name, nameKana, email, phone, address,
  };

  if (password) {
    updateData.passwordHash = await bcrypt.hash(password, 12);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  await sendEmail(userId, "info_changed", {
    to: user.email,
    userName: user.name,
    changedItem: "契約者情報",
    date: new Date().toLocaleDateString("ja-JP"),
  });

  return NextResponse.json({ success: true });
}
