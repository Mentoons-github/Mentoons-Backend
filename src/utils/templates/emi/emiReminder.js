const generateEmiReminderEmail = (userData, planData, emiDetails) => {
  const { name } = userData;
  const { planName, duration, age } = planData;
  const { emiAmount, nextDueDate, paidMonths, totalMonths } = emiDetails;

  const formattedDate = new Date(nextDueDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const remainingMonths = totalMonths - paidMonths;

  return {
    subject: "⏰ EMI Payment Reminder - Tomorrow",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>EMI Reminder</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                
                <!-- Logo Section -->
                <tr>
                  <td style="background-color: #ffffff; padding: 30px 30px 20px 30px; text-align: center;">
                    <img src="https://mentoons-website.s3.ap-northeast-1.amazonaws.com/logo/ec9141ccd046aff5a1ffb4fe60f79316.png" alt="Mentoons Logo" style="max-width: 180px; height: auto; display: inline-block;" />
                  </td>
                </tr>

                <!-- Header with gradient -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                      EMI Payment Reminder
                    </h1>
                    <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                      Your payment is due tomorrow
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

                    <!-- Alert Box -->
                    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 16px 20px; border-radius: 8px; margin-bottom: 30px;">
                      <p style="margin: 0; color: #856404; font-size: 15px; line-height: 1.6;">
                        <strong>⚠️ Reminder:</strong> Your EMI payment for the workshop you enrolled in is due <strong>tomorrow</strong>.
                      </p>
                    </div>

                    <!-- Workshop Details Card -->
                    <div style="background-color: #f8f9fa; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #1a202c; font-size: 20px; font-weight: 600;">
                        Workshop Details
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

                    <!-- Payment Details Card -->
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 24px; margin-bottom: 30px; color: #ffffff;">
                      <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">
                        Payment Information
                      </h2>
                      
                      <table width="100%" cellpadding="8" cellspacing="0">
                        <tr>
                          <td style="color: rgba(255,255,255,0.9); font-size: 14px; padding: 8px 0;">EMI Amount:</td>
                          <td style="color: #ffffff; font-size: 18px; font-weight: 700; text-align: right; padding: 8px 0;">₹${emiAmount.toLocaleString(
                            "en-IN"
                          )}</td>
                        </tr>
                        <tr>
                          <td style="color: rgba(255,255,255,0.9); font-size: 14px; padding: 8px 0;">Due Date:</td>
                          <td style="color: #ffffff; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${formattedDate}</td>
                        </tr>
                        <tr>
                          <td style="color: rgba(255,255,255,0.9); font-size: 14px; padding: 8px 0;">Progress:</td>
                          <td style="color: #ffffff; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${paidMonths} of ${totalMonths} months paid</td>
                        </tr>
                        <tr>
                          <td style="color: rgba(255,255,255,0.9); font-size: 14px; padding: 8px 0;">Remaining:</td>
                          <td style="color: #ffffff; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${remainingMonths} months</td>
                        </tr>
                      </table>
                    </div>

                    <!-- CTA Button -->
                    <div style="text-align: center; margin-bottom: 30px;">
                      <a href="https://mentoons.com/payment" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                        Pay Now
                      </a>
                    </div>

                    <!-- Important Note -->
                    <div style="background-color: #e6f7ff; border-left: 4px solid #1890ff; padding: 16px 20px; border-radius: 8px; margin-bottom: 24px;">
                      <p style="margin: 0; color: #0050b3; font-size: 14px; line-height: 1.6;">
                        <strong>💡 Important:</strong> To maintain uninterrupted access to your workshop, please ensure timely payment. Late payments may affect your enrollment status.
                      </p>
                    </div>

                    <!-- Closing -->
                    <p style="margin: 0 0 8px 0; color: #2d3748; font-size: 15px; line-height: 1.6;">
                      Thank you for choosing Mentoons!
                    </p>
                    <p style="margin: 0; color: #2d3748; font-size: 15px; line-height: 1.6;">
                      Best regards,<br>
                      <strong>The Mentoons Team</strong>
                    </p>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0 0 12px 0; color: #718096; font-size: 13px;">
                      Need help? Contact us at <a href="mailto:info@mentoons.com" style="color: #667eea; text-decoration: none;">info@mentoons.com</a>
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

module.exports = { generateEmiReminderEmail };
