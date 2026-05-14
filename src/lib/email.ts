/**
 * Email notifications via Resend.
 * Only sends when RESEND_API_KEY is configured.
 */

import type { Resend } from "resend";

let resendClient: Resend | null = null;

async function getResend() {
  if (resendClient) return resendClient;
  if (!process.env.RESEND_API_KEY) return null;

  try {
    const { Resend } = await import("resend");
    resendClient = new Resend(process.env.RESEND_API_KEY);
    return resendClient;
  } catch {
    return null;
  }
}

const FROM = process.env.RESEND_FROM_EMAIL || "FLY DEA <noreply@flydea.com.br>";

export async function sendRecurrenceNotification({
  to,
  userName,
  description,
  amount,
  date,
}: {
  to: string;
  userName: string;
  description: string;
  amount: number;
  date: Date;
}) {
  const resend = await getResend();
  if (!resend) return;

  const formatted = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);
  const dateStr = date.toLocaleDateString("pt-BR");

  await resend.emails.send({
    from: FROM,
    to,
    subject: `FLY DEA — Lançamento automático: ${description}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#09090B;color:#fff;padding:32px;border-radius:16px">
        <h1 style="font-size:24px;font-weight:900;margin-bottom:8px">FLY DEA</h1>
        <p style="color:#888;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:32px">Assistente Financeiro</p>
        <p style="font-size:16px">Olá, <strong>${userName}</strong>!</p>
        <p>Um lançamento automático foi gerado:</p>
        <div style="background:#1a1a1d;border-radius:12px;padding:24px;margin:24px 0">
          <p style="margin:0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.15em">Descrição</p>
          <p style="margin:4px 0 16px;font-size:18px;font-weight:700">${description}</p>
          <p style="margin:0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.15em">Valor</p>
          <p style="margin:4px 0 16px;font-size:24px;font-weight:900;color:#3B82F6">${formatted}</p>
          <p style="margin:0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.15em">Data</p>
<p style="margin:4px 0 0;font-size:16px;font-weight:700">${dateStr}</p>
        </div>
    `,
  });
}

export async function sendPasswordResetEmail({
  to,
  name,
  token,
}: {
  to: string;
  name: string;
  token: string;
}) {
  const resend = await getResend();
  if (!resend) return;

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://flydea.com.br'}/redefinir-senha?token=${token}`;

  await resend.emails.send({
    from: "FLY DEA <noreply@flydea.com.br>",
    to,
    subject: "FLY DEA — Recuperação de senha",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#09090B;color:#fff;padding:32px;border-radius:16px">
        <h1 style="font-size:24px;font-weight:900;margin-bottom:8px">FLY DEA</h1>
        <p style="color:#888;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:32px">Recuperação de Senha</p>
        <p>Olá, <strong>${name}</strong>!</p>
        <p>Você solicitou a recuperação de sua senha. Clique no botão abaixo para criar uma nova senha:</p>
        <a href="${resetUrl}" style="display:inline-block;background:#0071E3;color:#fff;padding:16px 32px;border-radius:12px;text-decoration:none;font-weight:700;margin:24px 0">Redefinir Senha</a>
        <p style="color:#666;font-size:12px">Este link expira em 1 hora.</p>
        <p style="color:#444;font-size:12px;margin-top:32px">Se você não solicitou isso, ignore este email.</p>
      </div>
    `,
  });
}

export async function sendBudgetAlert({
  to,
  userName,
  categoryName,
  spent,
  limit,
  percentage,
}: {
  to: string;
  userName: string;
  categoryName: string;
  spent: number;
  limit: number;
  percentage: number;
}) {
  const resend = await getResend();
  if (!resend) return;

  const fmtSpent = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(spent);
  const fmtLimit = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(limit);

  await resend.emails.send({
    from: FROM,
    to,
    subject: `FLY DEA — Alerta de orçamento: ${categoryName} (${percentage.toFixed(0)}%)`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#09090B;color:#fff;padding:32px;border-radius:16px">
        <h1 style="font-size:24px;font-weight:900;margin-bottom:8px">FLY DEA</h1>
        <p style="color:#888;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:32px">Alerta de Orçamento</p>
        <p>Olá, <strong>${userName}</strong>!</p>
        <p>Você atingiu <strong>${percentage.toFixed(0)}%</strong> do orçamento de <strong>${categoryName}</strong>.</p>
        <div style="background:#1a1a1d;border-radius:12px;padding:24px;margin:24px 0">
          <div style="background:#222;border-radius:8px;overflow:hidden;height:12px;margin-bottom:16px">
            <div style="background:#f43f5e;height:100%;width:${Math.min(percentage, 100)}%;transition:width 0.3s"></div>
          </div>
          <p style="margin:0;font-size:14px">Gasto: <strong style="color:#f43f5e">${fmtSpent}</strong> de <strong>${fmtLimit}</strong></p>
        </div>
        <p style="color:#666;font-size:12px">Acesse o FLY DEA para ajustar seu orçamento.</p>
      </div>
    `,
  });
}

export async function sendDueSoonAlert({
  to,
  userName,
  description,
  amount,
  dueDate,
}: {
  to: string;
  userName: string;
  description: string;
  amount: number;
  dueDate: Date;
}) {
  const resend = await getResend();
  if (!resend) return;

  const formatted = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);
  const dateStr = dueDate.toLocaleDateString("pt-BR");

  await resend.emails.send({
    from: FROM,
    to,
    subject: `FLY DEA — Vencimento próximo: ${description}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#09090B;color:#fff;padding:32px;border-radius:16px">
        <h1 style="font-size:24px;font-weight:900;margin-bottom:8px">FLY DEA</h1>
        <p style="color:#888;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:32px">Vencimento Próximo</p>
        <p>Olá, <strong>${userName}</strong>!</p>
        <p>Você tem uma pendência vencendo em breve.</p>
        <div style="background:#1a1a1d;border-radius:12px;padding:24px;margin:24px 0">
          <p style="margin:0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.15em">Descrição</p>
          <p style="margin:4px 0 16px;font-size:18px;font-weight:700">${description}</p>
          <p style="margin:0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.15em">Valor</p>
          <p style="margin:4px 0 16px;font-size:24px;font-weight:900;color:#f59e0b">${formatted}</p>
          <p style="margin:0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.15em">Vencimento</p>
          <p style="margin:4px 0 0;font-size:16px;font-weight:700">${dateStr}</p>
        </div>
      </div>
    `,
  });
}
