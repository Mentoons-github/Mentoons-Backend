const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const truncate = (value = "", max = 200) =>
  value.length > max ? `${value.slice(0, max).trim()}...` : value;

const getDailyReportEmailTemplate = ({
  employeeName,
  dateLabel,
  isLate,
  isUpdate,
  complete,
  taskPreview,
  reportUrl,
  allReportsUrl,
}) => {
  const year = new Date().getFullYear();
  const name = escapeHtml(employeeName);
  const preview = escapeHtml(truncate(taskPreview || ""));
  const action = isUpdate ? "updated" : "submitted";
  const completeLabel = complete === "YES" ? "Completed" : "Not completed";
  const completeColor = complete === "YES" ? "#16a34a" : "#dc2626";

  return {
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Daily Report ${isUpdate ? "Updated" : "Submitted"}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fff8f0;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(255, 140, 0, 0.15);">
              <tr>
                <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #FF8C00 0%, #FFA500 50%, #FFD700 100%); border-radius: 8px 8px 0 0;">
                  <img src="https://mentoons-website.s3.ap-northeast-1.amazonaws.com/logo/ec9141ccd046aff5a1ffb4fe60f79316.png"
                       alt="Mentoons Logo"
                       style="max-width: 180px; height: auto; display: block; margin: 0 auto;">
                </td>
              </tr>
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                    Hello Admin,
                  </p>
                  <p style="margin: 0 0 25px; color: #555555; font-size: 15px; line-height: 1.8;">
                    <strong style="color: #FF8C00;">${name}</strong> has ${action}
                    the daily report for <strong>${escapeHtml(dateLabel)}</strong>.
                    Please open it to review and sign.
                  </p>

                  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fff8f0; border-radius: 8px; margin-bottom: 25px;">
                    <tr>
                      <td style="padding: 12px 20px; color: #888888; font-size: 14px; border-bottom: 1px solid #ffebcd;">Employee</td>
                      <td style="padding: 12px 20px; color: #333333; font-size: 14px; font-weight: 600; text-align: right; border-bottom: 1px solid #ffebcd;">${name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 20px; color: #888888; font-size: 14px; border-bottom: 1px solid #ffebcd;">Report date</td>
                      <td style="padding: 12px 20px; color: #333333; font-size: 14px; font-weight: 600; text-align: right; border-bottom: 1px solid #ffebcd;">${escapeHtml(dateLabel)}${isLate ? ' <span style="color: #dc2626;">(late)</span>' : ""}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 20px; color: #888888; font-size: 14px;">Status</td>
                      <td style="padding: 12px 20px; font-size: 14px; font-weight: 600; text-align: right; color: ${completeColor};">${completeLabel}</td>
                    </tr>
                  </table>

                  ${
                    preview
                      ? `<p style="margin: 0 0 8px; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Task</p>
                  <p style="margin: 0 0 30px; padding: 15px; background-color: #fffbeb; border-left: 4px solid #FFA500; color: #555555; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${preview}</p>`
                      : ""
                  }

                  <table role="presentation" style="margin: 0 auto;">
                    <tr>
                      <td style="padding: 5px;">
                        <a href="${reportUrl}" target="_blank"
                           style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #FF8C00 0%, #FFA500 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                          View &amp; Sign ${name}'s Report
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 5px; text-align: center;">
                        <a href="${allReportsUrl}" target="_blank"
                           style="display: inline-block; padding: 12px 26px; background-color: #ffffff; color: #FF8C00; text-decoration: none; border: 2px solid #FF8C00; border-radius: 8px; font-weight: 600; font-size: 14px;">
                          View All Reports for ${escapeHtml(dateLabel)}
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 30px 0 0; color: #555555; font-size: 15px; line-height: 1.6;">
                    Best regards,<br>
                    <strong style="color: #FF8C00;">Mentoons</strong>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px 40px; background: linear-gradient(135deg, #fff8f0 0%, #ffebcd 100%); border-radius: 0 0 8px 8px; border-top: 2px solid #FFD700;">
                  <p style="margin: 0; color: #888888; font-size: 12px; line-height: 1.5; text-align: center;">
                    This is an automated email. Please do not reply to this message.
                  </p>
                  <p style="margin: 10px 0 0; color: #888888; font-size: 12px; line-height: 1.5; text-align: center;">
                    © ${year} <strong style="color: #FF8C00;">Mentoons</strong>. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `,
    text: `
Hello Admin,

${employeeName} has ${action} the daily report for ${dateLabel}${isLate ? " (late)" : ""}.
Status: ${completeLabel}

View and sign this report:
${reportUrl}

View all reports for ${dateLabel}:
${allReportsUrl}

Best regards,
Mentoons

---
This is an automated email. Please do not reply to this message.
© ${year} Mentoons. All rights reserved.
  `.trim(),
  };
};

module.exports = { getDailyReportEmailTemplate };
