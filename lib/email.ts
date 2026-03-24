import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

// 開発時はコンソール出力、本番はSMTP
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transporter = nodemailer.createTransport(
  process.env.NODE_ENV === "production"
    ? ({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      } as nodemailer.TransportOptions)
    : ({ jsonTransport: true } as nodemailer.TransportOptions)
);

export type EmailTemplate =
  | "account_created"
  | "info_changed"
  | "course_changed"
  | "course_added"
  | "course_cancelled"
  | "order_added"
  | "account_cancelled"
  | "inquiry_received"
  | "lp_preview_ready"
  | "lp_approved"
  | "lp_revision"
  | "lp_published"
  | "lp_unpublished"
  | "password_reset";

interface EmailData {
  to: string;
  userName: string;
  [key: string]: string;
}

function buildEmail(template: EmailTemplate, data: EmailData) {
  const subjects: Record<EmailTemplate, string> = {
    account_created: "【Creative Base】アカウント開設のご確認",
    info_changed: "【Creative Base】契約者情報変更のご確認",
    course_changed: "【Creative Base】ご契約コース変更のご確認",
    course_added: "【Creative Base】ご契約コース追加のご確認",
    course_cancelled: "【Creative Base】ご契約コース解約のご確認",
    order_added: "【Creative Base】オプションお申し込みのご確認",
    account_cancelled: "【Creative Base】アカウント解約のご確認",
    inquiry_received: "【Creative Base】お問い合わせ受付のご確認",
    lp_preview_ready: "【Creative Base】LP制作プレビューのご確認",
    lp_approved: "【Creative Base】LP制作の承認完了",
    lp_revision: "【Creative Base】LP制作の修正依頼",
    lp_published: "【Creative Base】LP公開のお知らせ",
    lp_unpublished: "【Creative Base】LP非公開のお知らせ",
    password_reset: "【Creative Base】パスワード再設定のご案内",
  };

  const footer = `━━━━━━━━━━━━━━━━━━━━
株式会社データノート　カスタマーサポート
Email：support@datanote.net
受付時間：平日 10:00〜18:00
━━━━━━━━━━━━━━━━━━━━
※このメールはシステムより自動送信されています。返信はお受けできませんのでご了承ください。`;

  const bodies: Record<EmailTemplate, string> = {
    account_created: `${data.userName} 様

この度はCreative Baseにご登録いただき、誠にありがとうございます。
アカウントの開設が完了しましたので、お知らせいたします。

■ご登録情報
・お名前：${data.userName} 様
・メールアドレス：${data.to}
・登録日：${data.date || new Date().toLocaleDateString("ja-JP")}

■ログインはこちら
${process.env.NEXT_PUBLIC_APP_URL}/login

ご不明な点がございましたら、下記サポート窓口までお気軽にお問い合わせください。

${footer}`,

    info_changed: `${data.userName} 様

契約者情報の変更が完了しましたので、お知らせいたします。

■変更内容
・変更日：${data.date || new Date().toLocaleDateString("ja-JP")}
・変更項目：${data.changedItem || "契約者情報"}

登録情報の確認はマイページよりご確認いただけます。
${process.env.NEXT_PUBLIC_APP_URL}/mypage

${footer}`,

    course_changed: `${data.userName} 様

ご契約コースの変更が完了しましたので、お知らせいたします。

■変更内容
・変更前のコース：${data.fromCourse}
・変更後のコース：${data.toCourse}
・適用開始日：${data.date || new Date().toLocaleDateString("ja-JP")}

${process.env.NEXT_PUBLIC_APP_URL}/mypage

${footer}`,

    course_added: `${data.userName} 様

ご契約コースの追加が完了しましたので、お知らせいたします。

■追加内容
・追加コース：${data.courseName}
・適用開始日：${data.date || new Date().toLocaleDateString("ja-JP")}

${process.env.NEXT_PUBLIC_APP_URL}/mypage

${footer}`,

    course_cancelled: `${data.userName} 様

ご契約コースの解約手続きが完了しましたので、お知らせいたします。

■解約内容
・解約コース：${data.courseName}
・解約申請日：${data.date || new Date().toLocaleDateString("ja-JP")}
・サービス終了日：${data.endDate || ""}

${footer}`,

    order_added: `${data.userName} 様

オプションサービスのお申し込みが完了しましたので、お知らせいたします。

■お申し込み内容
・オプション名：${data.optionName}
・適用開始日：${data.date || new Date().toLocaleDateString("ja-JP")}

${process.env.NEXT_PUBLIC_APP_URL}/mypage

${footer}`,

    account_cancelled: `${data.userName} 様

Creative Baseのアカウント解約手続きが完了しましたので、お知らせいたします。

■解約内容
・解約申請日：${data.date || new Date().toLocaleDateString("ja-JP")}
・アカウント削除日：${data.deleteDate || ""}

${footer}`,

    inquiry_received: `${data.userName} 様

お問い合わせを受け付けましたので、お知らせいたします。

■お問い合わせ内容
・受付日：${data.date || new Date().toLocaleDateString("ja-JP")}
・内容：
${data.message || ""}

担当者より順次ご対応させていただきます。
通常2〜3営業日以内にご返信いたします。

${footer}`,

    lp_preview_ready: `${data.userName} 様

LP制作のプレビューが完成しましたので、ご確認をお願いいたします。

■LP情報
・タイトル：${data.lpTitle || "LP"}
・プレビューURL：${process.env.NEXT_PUBLIC_APP_URL}/mypage/lp

内容をご確認いただき、承認または修正のご依頼をお願いいたします。

${footer}`,

    lp_approved: `${data.userName} 様

LP制作の承認ありがとうございます。公開準備を進めさせていただきます。

■LP情報
・タイトル：${data.lpTitle || "LP"}

公開完了後、改めてご連絡いたします。

${footer}`,

    lp_revision: `管理者様

LP制作の修正依頼がありましたのでご対応をお願いいたします。

■LP情報
・ユーザー：${data.userName}
・タイトル：${data.lpTitle || "LP"}
・修正内容：
${data.revisionNotes || ""}

管理画面よりご確認ください。
${process.env.NEXT_PUBLIC_APP_URL}/admin/lp

${footer}`,

    lp_published: `${data.userName} 様

LP制作の公開が完了しましたのでお知らせいたします。

■公開情報
・タイトル：${data.lpTitle || "LP"}
・公開URL：${process.env.NEXT_PUBLIC_APP_URL}/lp/${data.slug || ""}

マイページからもご確認いただけます。
${process.env.NEXT_PUBLIC_APP_URL}/mypage/lp

${footer}`,

    lp_unpublished: `${data.userName} 様

LPが非公開になりましたのでお知らせいたします。

■LP情報
・タイトル：${data.lpTitle || "LP"}

ご質問がございましたら、お気軽にお問い合わせください。

${footer}`,

    password_reset: `${data.userName} 様

パスワード再設定のリクエストを受け付けました。
下記URLより新しいパスワードを設定してください。

■パスワード再設定URL
${data.resetUrl}

※このURLの有効期限は1時間です。
※心当たりがない場合は、このメールを無視してください。

${footer}`,
  };

  return {
    from: process.env.EMAIL_FROM || "Creative Base <noreply@datanote.net>",
    to: data.to,
    subject: subjects[template],
    text: bodies[template],
  };
}

export async function sendEmail(
  userId: string,
  template: EmailTemplate,
  data: EmailData
) {
  const mailOptions = buildEmail(template, data);

  try {
    const info = await transporter.sendMail(mailOptions);

    // 開発時はコンソールに出力
    if (process.env.NODE_ENV !== "production") {
      console.log("\n========== [DEV EMAIL] ==========");
      console.log(`To: ${mailOptions.to}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Body:\n${mailOptions.text}`);
      console.log("=================================\n");
    }

    await prisma.emailLog.create({
      data: { userId, templateType: template, status: "sent" },
    });

    return { success: true, info };
  } catch (error) {
    console.error("Email send error:", error);
    await prisma.emailLog.create({
      data: { userId, templateType: template, status: "failed" },
    });
    return { success: false, error };
  }
}
