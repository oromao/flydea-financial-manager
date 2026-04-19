import { resend } from "@/lib/resend";

export interface EmailNotificationInput {
  recipient: string;
  agentName: string;
  agentType: string;
  executionStatus: "SUCCESS" | "FAILED";
  output?: Record<string, unknown>;
  error?: string;
}

export class EmailService {
  async sendAgentNotification(input: EmailNotificationInput): Promise<boolean> {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured. Skipping email notification.");
      return false;
    }

    try {
      const html = this.buildEmailHtml(input);

      await resend.emails.send({
        from: "Flydea Agentes IA <noreply@flydea.com.br>",
        to: input.recipient,
        subject: `Agente ${input.agentName} - Execução ${input.executionStatus === "SUCCESS" ? "✓ Sucesso" : "✗ Falha"}`,
        html,
      });

      return true;
    } catch (error) {
      console.error("Error sending email notification:", error);
      return false;
    }
  }

  private buildEmailHtml(input: EmailNotificationInput): string {
    const statusColor =
      input.executionStatus === "SUCCESS" ? "#10b981" : "#ef4444";
    const statusText =
      input.executionStatus === "SUCCESS" ? "Sucesso" : "Falha";

    let outputHtml = "";
    if (input.output) {
      outputHtml = `
        <div style="margin-top: 20px; background-color: #f3f4f6; padding: 15px; border-radius: 8px;">
          <h3 style="margin: 0 0 10px 0; color: #374151; font-size: 14px;">Resultado da Execução:</h3>
          <pre style="margin: 0; font-family: monospace; font-size: 12px; color: #4b5563; white-space: pre-wrap; word-wrap: break-word;">
${JSON.stringify(input.output, null, 2)}
          </pre>
        </div>
      `;
    }

    let errorHtml = "";
    if (input.error) {
      errorHtml = `
        <div style="margin-top: 20px; background-color: #fee2e2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444;">
          <h3 style="margin: 0 0 10px 0; color: #7f1d1d; font-size: 14px;">Erro:</h3>
          <p style="margin: 0; color: #991b1b; font-size: 13px;">${this.escapeHtml(input.error)}</p>
        </div>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #374151; }
            a { color: #3b82f6; text-decoration: none; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body style="background-color: #f9fafb; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px;">Flydea Agentes IA</h1>
            </div>

            <!-- Content -->
            <div style="padding: 30px;">
              <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background-color: ${statusColor}; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                  <span style="color: white; font-size: 24px; font-weight: bold;">
                    ${input.executionStatus === "SUCCESS" ? "✓" : "✕"}
                  </span>
                </div>
                <div>
                  <h2 style="margin: 0 0 5px 0; color: #111827; font-size: 20px;">${this.escapeHtml(input.agentName)}</h2>
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">Status: <strong>${statusText}</strong></p>
                </div>
              </div>

              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0; color: #6b7280; font-size: 13px;">
                  <strong>Tipo:</strong> ${this.escapeHtml(input.agentType)}<br>
                  <strong>Executado em:</strong> ${new Date().toLocaleString("pt-BR")}
                </p>
              </div>

              ${outputHtml}
              ${errorHtml}

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                  Este é um email automático de notificação do seu agente IA. Não responda a este email.
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © 2024 Flydea - Seu assistente financeiro inteligente
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}
