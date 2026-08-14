const getCandidateEmailTemplate = (name, message) => {
  const year = new Date().getFullYear();
  return {
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Message from Mentoons</title>
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
                    Dear <strong style="color: #FF8C00;">${name}</strong>,
                  </p>
                  <p style="margin: 0 0 30px; color: #555555; font-size: 15px; line-height: 1.8; white-space: pre-wrap;">${message}</p>
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
Dear ${name},

${message}

Best regards,
Mentoons

---
This is an automated email. Please do not reply to this message.
© ${year} Mentoons. All rights reserved.
  `.trim(),
  };
};

module.exports = { getCandidateEmailTemplate };
