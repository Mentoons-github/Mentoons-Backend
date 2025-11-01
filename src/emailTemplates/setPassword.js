const getWelcomeEmailTemplate = (
  name,
  frontendUrl,
  passwordSetupKey,
  employeeId
) => {
  const year = new Date().getFullYear();
  return {
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Mentoons</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fff8f0;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(255, 140, 0, 0.15);">
              
              <!-- Header with Logo -->
              <tr>
                <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #FF8C00 0%, #FFA500 50%, #FFD700 100%); border-radius: 8px 8px 0 0;">
                  <img src="https://mentoons-website.s3.ap-northeast-1.amazonaws.com/logo/ec9141ccd046aff5a1ffb4fe60f79316.png" 
                       alt="Mentoons Logo" 
                       style="max-width: 180px; height: auto; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">Welcome to Mentoons!</h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                    Hello <strong style="color: #FF8C00;">${name}</strong>,
                  </p>
                  
                  <p style="margin: 0 0 20px; color: #555555; font-size: 15px; line-height: 1.6;">
                    We're thrilled to welcome you to the <strong style="color: #FF8C00;">Mentoons</strong> team! Your account has been successfully created, and we're excited to have you on board.
                  </p>

                  <!-- Employee ID Box -->
                  <table role="presentation" style="width: 100%; background: linear-gradient(135deg, #FFF8DC 0%, #FFEBCD 100%); border: 2px solid #FF8C00; border-radius: 8px; margin: 25px 0;">
                    <tr>
                      <td style="padding: 20px; text-align: center;">
                        <p style="margin: 0 0 8px; color: #666666; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                          Your Employee ID
                        </p>
                        <p style="margin: 0; color: #FF8C00; font-size: 28px; font-weight: 700; letter-spacing: 2px;">
                          ${employeeId}
                        </p>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 0 0 30px; color: #555555; font-size: 15px; line-height: 1.6;">
                    To get started, please set up your password by clicking the button below. <strong>After setting up your password, you'll use your Employee ID (shown above) to log in to the system.</strong>
                  </p>

                  <!-- CTA Button -->
                  <table role="presentation" style="width: 100%;">
                    <tr>
                      <td style="text-align: center; padding: 20px 0;">
                        <a href="${frontendUrl}/add-password?key=${passwordSetupKey}&employeeId=${employeeId}" 
                           style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #FF8C00 0%, #FFA500 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(255, 140, 0, 0.3); transition: transform 0.2s;">
                          Set Up Password
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 20px 0 0; color: #888888; font-size: 13px; line-height: 1.6; text-align: center;">
                    If the button doesn't work, copy and paste this link into your browser:
                  </p>
                  <p style="margin: 10px 0 30px; color: #FF8C00; font-size: 13px; line-height: 1.6; text-align: center; word-break: break-all;">
                    ${frontendUrl}/add-password?key=${passwordSetupKey}&employeeId=${employeeId}
                  </p>

                  <!-- Warning Box -->
                  <table role="presentation" style="width: 100%; background: linear-gradient(135deg, #FFE4E1 0%, #FFD4D4 100%); border-left: 4px solid #DC2626; border-radius: 6px; margin: 25px 0;">
                    <tr>
                      <td style="padding: 16px;">
                        <p style="margin: 0; color: #DC2626; font-size: 14px; line-height: 1.5;">
                          <strong>⏰ Important:</strong> This setup link will expire in <strong>24 hours</strong>. Please complete your password setup as soon as possible.
                        </p>
                      </td>
                    </tr>
                  </table>

                  <!-- Login Instructions Box -->
                  <table role="presentation" style="width: 100%; background: linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%); border-left: 4px solid #0284C7; border-radius: 6px; margin: 25px 0;">
                    <tr>
                      <td style="padding: 16px;">
                        <p style="margin: 0 0 10px; color: #0369A1; font-size: 14px; line-height: 1.5; font-weight: 600;">
                          📋 How to Login After Setup:
                        </p>
                        <p style="margin: 0; color: #0369A1; font-size: 14px; line-height: 1.5;">
                          Use your <strong>Employee ID: ${employeeId}</strong> along with the password you create to log in to the Mentoons portal.
                        </p>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 30px 0 0; color: #555555; font-size: 15px; line-height: 1.6;">
                    If you have any questions or need assistance, feel free to reach out to our HR team.
                  </p>

                  <p style="margin: 20px 0 0; color: #555555; font-size: 15px; line-height: 1.6;">
                    Best regards,<br>
                    <strong style="color: #FF8C00;">The Mentoons HR Team</strong><br>
                    <span style="color: #888888; font-size: 13px;">Creating impactful mental wellness content</span>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background: linear-gradient(135deg, #fff8f0 0%, #ffebcd 100%); border-radius: 0 0 8px 8px; border-top: 2px solid #FFD700;">
                  <p style="margin: 0 0 10px; color: #888888; font-size: 12px; line-height: 1.5; text-align: center;">
                    This is an automated email. Please do not reply to this message.
                  </p>
                  <p style="margin: 0; color: #888888; font-size: 12px; line-height: 1.5; text-align: center;">
                    © ${year} <strong style="color: #FF8C00;">Mentoons</strong>. All rights reserved.
                  </p>
                  <p style="margin: 10px 0 0; color: #888888; font-size: 12px; line-height: 1.5; text-align: center;">
                    If you didn't expect this email, please contact us immediately at <a href="mailto:hr@mentoons.com" style="color: #FF8C00; text-decoration: none;">hr@mentoons.com</a>
                  </p>
                  <p style="margin: 10px 0 0; color: #888888; font-size: 11px; line-height: 1.5; text-align: center;">
                    <a href="https://mentoons.com" style="color: #FF8C00; text-decoration: none; margin: 0 8px;">Visit our website</a> |
                    <a href="https://mentoons.com/privacy" style="color: #FF8C00; text-decoration: none; margin: 0 8px;">Privacy Policy</a> |
                    <a href="https://mentoons.com/terms" style="color: #FF8C00; text-decoration: none; margin: 0 8px;">Terms of Service</a>
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
    Welcome to Mentoons!

    Hello ${name},

    We're thrilled to welcome you to the Mentoons team! Your account has been successfully created, and we're excited to have you on board.

    YOUR EMPLOYEE ID: ${employeeId}

    To get started, please set up your password by visiting this link:
    ${frontendUrl}/add-password?key=${passwordSetupKey}&employeeId=${employeeId}

    IMPORTANT: After setting up your password, you'll use your Employee ID (${employeeId}) to log in to the system.

    ⏰ This setup link will expire in 24 hours. Please complete your password setup as soon as possible.

    HOW TO LOGIN AFTER SETUP:
    Use your Employee ID: ${employeeId} along with the password you create to log in to the Mentoons portal.

    If you have any questions or need assistance, feel free to reach out to our HR team at hr@mentoons.com

    Best regards,
    The Mentoons HR Team
    Creating impactful mental wellness content

    ---
    This is an automated email. Please do not reply to this message.
    © ${year} Mentoons. All rights reserved.
    If you didn't expect this email, please contact us immediately at hr@mentoons.com
  `.trim(),
  };
};

module.exports = { getWelcomeEmailTemplate };
