'use strict';

const { Resend } = require('resend');

let resend;
function getResend() {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY não configurada');
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM = process.env.RESEND_FROM || 'PozziTech <noreply@pozzitech.com.br>';

// ── Template HTML ─────────────────────────────────────────────

function buildLeadEmailHtml({ name, segment, challenge, nextSteps }) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Seu resumo — PozziTech</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:40px 48px;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">PozziTech</p>
              <p style="margin:6px 0 0;font-size:14px;color:#c7d2fe;">Automação com IA para PMEs</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 48px;">
              <p style="margin:0 0 8px;font-size:16px;color:#6b7280;">Olá, <strong style="color:#111827;">${name}</strong> 👋</p>
              <p style="margin:0 0 32px;font-size:15px;color:#374151;line-height:1.6;">
                Obrigado por conversar com a gente! Aqui está o resumo da sua conversa e os próximos passos para a sua transformação digital.
              </p>

              <!-- Resumo da conversa -->
              <div style="background:#f9fafb;border-radius:8px;padding:24px;margin-bottom:28px;">
                <p style="margin:0 0 16px;font-size:13px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Resumo da conversa</p>
                ${segment ? `<p style="margin:0 0 10px;font-size:14px;color:#374151;"><span style="font-weight:600;color:#111827;">Segmento:</span> ${segment}</p>` : ''}
                ${challenge ? `<p style="margin:0;font-size:14px;color:#374151;"><span style="font-weight:600;color:#111827;">Principal desafio:</span> ${challenge}</p>` : ''}
              </div>

              <!-- Próximos passos -->
              <p style="margin:0 0 16px;font-size:15px;font-weight:600;color:#111827;">Seus próximos passos 🚀</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${nextSteps.map((step, i) => `
                <tr>
                  <td style="padding:0 0 12px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:top;padding-right:14px;">
                          <div style="width:28px;height:28px;background:#4F46E5;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#ffffff;">${i + 1}</div>
                        </td>
                        <td style="vertical-align:middle;font-size:14px;color:#374151;line-height:1.5;">${step}</td>
                      </tr>
                    </table>
                  </td>
                </tr>`).join('')}
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
                <tr>
                  <td align="center">
                    <a href="https://calendly.com/felipepozzi/30min"
                       style="display:inline-block;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;">
                      Agendar Diagnóstico Gratuito →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:24px 48px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
                PozziTech — Automação com IA para PMEs<br/>
                Você recebeu este email por ter conversado com nosso assistente virtual.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Envia email de resumo para o lead ─────────────────────────

async function sendLeadSummaryEmail({ name, email, segment, challenge }) {
  if (!email) return;

  const nextSteps = [
    'Agende seu <strong>Diagnóstico Gratuito de 30 minutos</strong> pelo link abaixo — sem compromisso.',
    'Vamos mapear os processos que mais consomem tempo na sua operação.',
    'Você receberá uma proposta personalizada de automação com IA, com ROI estimado.',
  ];

  try {
    const { error } = await getResend().emails.send({
      from: FROM,
      to: email,
      subject: `${name}, aqui está o resumo da sua conversa com a PozziTech 🚀`,
      html: buildLeadEmailHtml({ name, segment, challenge, nextSteps }),
    });

    if (error) {
      console.error('[email] Resend error:', error.message);
    } else {
      console.log(`[email] Resumo enviado para ${email}`);
    }
  } catch (err) {
    console.error('[email] Falha ao enviar:', err.message);
  }
}

// ── Envia notificação de novo lead para o dono ────────────────

async function sendLeadNotificationEmail({ name, email, phone, segment, challenge }) {
  const notifyTo = process.env.RESEND_NOTIFY_EMAIL;
  if (!notifyTo) return;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8" /><title>Novo Lead — PozziTech</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#111827,#1f2937);padding:32px 40px;">
              <p style="margin:0;font-size:13px;font-weight:600;color:#22C55E;text-transform:uppercase;letter-spacing:0.08em;">● Novo Lead Capturado</p>
              <p style="margin:8px 0 0;font-size:22px;font-weight:700;color:#ffffff;">${name}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${email ? `<tr><td style="padding:0 0 14px;font-size:14px;color:#6b7280;width:120px;">Email</td><td style="padding:0 0 14px;font-size:14px;color:#111827;font-weight:500;">${email}</td></tr>` : ''}
                ${phone ? `<tr><td style="padding:0 0 14px;font-size:14px;color:#6b7280;">Telefone</td><td style="padding:0 0 14px;font-size:14px;color:#111827;font-weight:500;">${phone}</td></tr>` : ''}
                ${segment ? `<tr><td style="padding:0 0 14px;font-size:14px;color:#6b7280;">Segmento</td><td style="padding:0 0 14px;font-size:14px;color:#111827;font-weight:500;">${segment}</td></tr>` : ''}
                ${challenge ? `<tr><td style="padding:0 0 14px;font-size:14px;color:#6b7280;">Desafio</td><td style="padding:0 0 14px;font-size:14px;color:#111827;font-weight:500;">${challenge}</td></tr>` : ''}
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                <tr>
                  <td>
                    <a href="https://calendly.com/felipepozzi/30min"
                       style="display:inline-block;background:#4F46E5;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:8px;">
                      Agendar com este lead →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:16px 40px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">Notificação automática — PozziTech Chatbot</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    const { error } = await getResend().emails.send({
      from: FROM,
      to: notifyTo,
      subject: `🔔 Novo lead: ${name}${phone ? ` — ${phone}` : ''}`,
      html,
    });

    if (error) {
      console.error('[email] Notificação error:', error.message);
    } else {
      console.log(`[email] Notificação enviada para ${notifyTo}`);
    }
  } catch (err) {
    console.error('[email] Falha ao notificar:', err.message);
  }
}

module.exports = { sendLeadSummaryEmail, sendLeadNotificationEmail };
