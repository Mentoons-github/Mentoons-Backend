const generateEmiPaymentEmail = (userData, planData, emiDetails) => {
  const { name } = userData;
  const { name: planName, duration, age } = planData;
  const { emiAmount, nextDueDate, paidMonths, totalMonths } = emiDetails;

  const formattedDate = new Date(nextDueDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const remainingMonths = totalMonths - paidMonths;

  return {
    subject: "⚠️ EMI Payment Due Today - Action Required",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>EMI Payment Due</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fff8f0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff8f0; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(255,140,0,0.15); border: 2px solid #ffb84d;">
                
                <!-- Logo Section -->
                <tr>
                  <td style="background-color: #ffffff; padding: 30px 30px 20px 30px; text-align: center;">
                    <img src="https://mentoons-website.s3.ap-northeast-1.amazonaws.com/logo/ec9141ccd046aff5a1ffb4fe60f79316.png" alt="Mentoons Logo" style="max-width: 180px; height: auto; display: inline-block;" />
                  </td>
                </tr>

                <!-- Urgent Header with gradient -->
                <tr>
                  <td style="background: linear-gradient(135deg, #ff8c00 0%, #ffa500 50%, #ffb84d 100%); padding: 40px 30px; text-align: center; position: relative;">
                    <div style="background-color: #fff3cd; display: inline-block; padding: 8px 20px; border-radius: 20px; margin-bottom: 16px; border: 2px solid #ff8c00;">
                      <span style="color: #d97706; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                        ⚠️ Payment Due Today
                      </span>
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                      EMI Payment Required
                    </h1>
                    <p style="margin: 12px 0 0 0; color: #fff; font-size: 17px; font-weight: 500;">
                      Please complete your payment immediately
                    </p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    
                    <!-- Greeting -->
                    <p style="margin: 0 0 24px 0; color: #2d3748; font-size: 16px; line-height: 1.6;">
                      Dear <strong>${name}</strong>,
                    </p>

                    <!-- Urgent Alert Box -->
                    <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffe8b3 100%); border: 3px solid #ff8c00; padding: 20px 24px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 4px 12px rgba(255,140,0,0.2);">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 50px; vertical-align: top; padding-right: 16px;">
                            <div style="background-color: #ff8c00; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                              <span style="font-size: 28px; line-height: 48px; text-align: center; display: block;">⚠️</span>
                            </div>
                          </td>
                          <td style="vertical-align: top;">
                            <p style="margin: 0 0 8px 0; color: #d97706; font-size: 18px; font-weight: 700; line-height: 1.4;">
                              Immediate Action Required
                            </p>
                            <p style="margin: 0; color: #92400e; font-size: 15px; line-height: 1.6;">
                              Your EMI payment is <strong style="color: #c2410c;">due today</strong>. Please process your payment now to avoid any disruption to your workshop enrollment.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <!-- Workshop Details Card -->
                    <div style="background: linear-gradient(to bottom, #fffbf5, #fff8f0); border: 2px solid #ffd699; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #1a202c; font-size: 20px; font-weight: 600; border-bottom: 2px solid #ffb84d; padding-bottom: 12px;">
                        📚 Workshop Details
                      </h2>
                      
                      <table width="100%" cellpadding="8" cellspacing="0">
                        <tr>
                          <td style="color: #718096; font-size: 14px; padding: 8px 0;">Workshop Name:</td>
                          <td style="color: #2d3748; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${planName}</td>
                        </tr>
                        <tr>
                          <td style="color: #718096; font-size: 14px; padding: 8px 0;">Duration:</td>
                          <td style="color: #2d3748; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${duration}</td>
                        </tr>
                        <tr>
                          <td style="color: #718096; font-size: 14px; padding: 8px 0;">Age Group:</td>
                          <td style="color: #2d3748; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${age}</td>
                        </tr>
                      </table>
                    </div>

                    <!-- Payment Details Card with urgent styling -->
                    <div style="background: linear-gradient(135deg, #ff8c00 0%, #ffa500 50%, #ffb84d 100%); border-radius: 12px; padding: 28px; margin-bottom: 30px; color: #ffffff; box-shadow: 0 6px 20px rgba(255,140,0,0.3);">
                      <h2 style="margin: 0 0 24px 0; font-size: 22px; font-weight: 700; text-align: center; text-transform: uppercase; letter-spacing: 0.5px;">
                        💳 Payment Information
                      </h2>
                      
                      <!-- Amount Due - Highlighted -->
                      <div style="background-color: rgba(255,255,255,0.95); border-radius: 10px; padding: 20px; margin-bottom: 20px; text-align: center;">
                        <p style="margin: 0 0 8px 0; color: #92400e; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                          Amount Due Today
                        </p>
                        <p style="margin: 0; color: #ff8c00; font-size: 36px; font-weight: 800; line-height: 1.2;">
                          ₹${emiAmount.toLocaleString("en-IN")}
                        </p>
                      </div>
                      
                      <table width="100%" cellpadding="10" cellspacing="0" style="background-color: rgba(255,255,255,0.1); border-radius: 8px; padding: 4px;">
                        <tr>
                          <td style="color: rgba(255,255,255,0.95); font-size: 14px; padding: 10px 16px;">Due Date:</td>
                          <td style="color: #ffffff; font-size: 15px; font-weight: 700; text-align: right; padding: 10px 16px;">${formattedDate}</td>
                        </tr>
                        <tr style="border-top: 1px solid rgba(255,255,255,0.2);">
                          <td style="color: rgba(255,255,255,0.95); font-size: 14px; padding: 10px 16px;">Progress:</td>
                          <td style="color: #ffffff; font-size: 15px; font-weight: 600; text-align: right; padding: 10px 16px;">${paidMonths} of ${totalMonths} months paid</td>
                        </tr>
                        <tr style="border-top: 1px solid rgba(255,255,255,0.2);">
                          <td style="color: rgba(255,255,255,0.95); font-size: 14px; padding: 10px 16px;">Remaining:</td>
                          <td style="color: #ffffff; font-size: 15px; font-weight: 600; text-align: right; padding: 10px 16px;">${remainingMonths} months</td>
                        </tr>
                      </table>
                    </div>

                    <!-- CTA Button - More prominent -->
                    <div style="text-align: center; margin-bottom: 30px;">
                      <a href="https://mentoons.com/emi" style="display: inline-block; background: linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%); color: #ffffff; text-decoration: none; padding: 18px 60px; border-radius: 10px; font-size: 18px; font-weight: 700; box-shadow: 0 6px 20px rgba(255,107,0,0.4); text-transform: uppercase; letter-spacing: 0.5px; border: 3px solid #fff;">
                        🔒 Pay Now Securely
                      </a>
                      <p style="margin: 16px 0 0 0; color: #718096; font-size: 13px;">
                        Quick & secure payment process
                      </p>
                    </div>

                    <!-- Important Note -->
                    <div style="background: linear-gradient(to right, #fff4e6, #ffe8cc); border-left: 5px solid #ff8c00; padding: 18px 24px; border-radius: 8px; margin-bottom: 24px;">
                      <p style="margin: 0 0 8px 0; color: #c2410c; font-size: 15px; font-weight: 700;">
                        ⏰ Time-Sensitive Notice
                      </p>
                      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                        Late payments may result in temporary suspension of workshop access and may incur additional late fees. Please complete your payment today to maintain uninterrupted access.
                      </p>
                    </div>

                    <!-- Closing -->
                    <p style="margin: 0 0 8px 0; color: #2d3748; font-size: 15px; line-height: 1.6;">
                      Thank you for your prompt attention to this matter.
                    </p>
                    <p style="margin: 0; color: #2d3748; font-size: 15px; line-height: 1.6;">
                      Best regards,<br>
                      <strong>The Mentoons Team</strong>
                    </p>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background: linear-gradient(to bottom, #fffbf5, #fff4e6); padding: 30px; text-align: center; border-top: 2px solid #ffd699;">
                    <p style="margin: 0 0 12px 0; color: #718096; font-size: 13px;">
                      Need help? Contact us at <a href="mailto:info@mentoons.com" style="color: #ff8c00; text-decoration: none; font-weight: 600;">info@mentoons.com</a>
                    </p>
                    <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                      © ${new Date().getFullYear()} Mentoons. All rights reserved.
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
  };
};

module.exports = { generateEmiPaymentEmail };
