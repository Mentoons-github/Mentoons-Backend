const generateEmiReminderEmail = (userData, planData, emiDetails) => {
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
  const progressPercentage = ((paidMonths / totalMonths) * 100).toFixed(0);

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
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #FFF5E6 0%, #FFE8CC 100%);">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #FFF5E6 0%, #FFE8CC 100%); padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(255, 140, 0, 0.15);">
                
                <!-- Logo Section -->
                <tr>
                  <td style="background-color: #ffffff; padding: 30px 30px 20px 30px; text-align: center;">
                    <img src="https://mentoons-website.s3.ap-northeast-1.amazonaws.com/logo/ec9141ccd046aff5a1ffb4fe60f79316.png" alt="Mentoons Logo" style="max-width: 180px; height: auto; display: inline-block;" />
                  </td>
                </tr>

                <!-- Header with gradient -->
                <tr>
                  <td style="background: linear-gradient(135deg, #FF8C00 0%, #FFA500 50%, #FFB347 100%); padding: 40px 30px; text-align: center;">
                    <div style="background: rgba(255, 255, 255, 0.25); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: inline-flex; align-items: center; justify-content: center;">
                      <span style="font-size: 48px;">⏰</span>
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; text-shadow: 0 2px 8px rgba(0,0,0,0.2);">
                      Payment Due Tomorrow
                    </h1>
                    <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; font-weight: 500; text-shadow: 0 1px 4px rgba(0,0,0,0.15);">
                      Don't miss your EMI deadline
                    </p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 30px 30px 20px;">
                    
                    <!-- Greeting -->
                    <p style="margin: 0; color: #1a1a1a; font-size: 18px; line-height: 1.6; font-weight: 500;">
                      Dear <strong style="color: #FF8C00;">${name}</strong>,
                    </p>
                    <p style="margin: 15px 0 0; color: #333333; font-size: 15px; line-height: 1.7;">
                      This is a friendly reminder that your EMI payment for the workshop you enrolled in is due tomorrow. Please ensure timely payment to continue enjoying uninterrupted access.
                    </p>

                  </td>
                </tr>

                <!-- Alert Box -->
                <tr>
                  <td style="padding: 0 30px 20px;">
                    <div style="background: linear-gradient(135deg, #FFF4E6 0%, #FFE8CC 100%); border-left: 5px solid #FF8C00; padding: 20px; border-radius: 8px;">
                      <p style="margin: 0; color: #C2410C; font-size: 15px; font-weight: 700; display: flex; align-items: center;">
                        <span style="font-size: 22px; margin-right: 12px;">⚠️</span>
                        <span>Action Required: Payment due in 24 hours</span>
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Workshop Details Card -->
                <tr>
                  <td style="padding: 0 30px 20px;">
                    <div style="background: linear-gradient(135deg, #FFFAF0 0%, #FFF5E6 100%); border-radius: 12px; padding: 25px; border: 2px solid #FFD699;">
                      <h2 style="margin: 0 0 20px; color: #E67700; font-size: 19px; font-weight: 700; display: flex; align-items: center;">
                        <span style="font-size: 26px; margin-right: 12px;">📚</span>
                        Workshop Details
                      </h2>
                      
                      <table width="100%" cellpadding="10" cellspacing="0">
                        <tr>
                          <td style="color: #4a4a4a; font-size: 15px; padding: 10px 0; font-weight: 500;">Workshop Name:</td>
                          <td style="color: #1a1a1a; font-size: 15px; font-weight: 700; text-align: right; padding: 10px 0;">${planName}</td>
                        </tr>
                        <tr style="border-top: 1px solid #FFE8CC;">
                          <td style="color: #4a4a4a; font-size: 15px; padding: 10px 0; font-weight: 500;">Duration:</td>
                          <td style="color: #1a1a1a; font-size: 15px; font-weight: 700; text-align: right; padding: 10px 0;">${duration}</td>
                        </tr>
                        <tr style="border-top: 1px solid #FFE8CC;">
                          <td style="color: #4a4a4a; font-size: 15px; padding: 10px 0; font-weight: 500;">Age Group:</td>
                          <td style="color: #1a1a1a; font-size: 15px; font-weight: 700; text-align: right; padding: 10px 0;">${age}</td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>

                <!-- Payment Details Card -->
                <tr>
                  <td style="padding: 0 30px 20px;">
                    <div style="background: linear-gradient(135deg, #FF8C00 0%, #FFA500 100%); border-radius: 12px; padding: 28px; color: #ffffff;">
                      <h2 style="margin: 0 0 20px; font-size: 19px; font-weight: 700; display: flex; align-items: center; color: #ffffff; text-shadow: 0 1px 3px rgba(0,0,0,0.2);">
                        <span style="font-size: 26px; margin-right: 12px;">💰</span>
                        Payment Information
                      </h2>
                      
                      <table width="100%" cellpadding="10" cellspacing="0">
                        <tr>
                          <td style="font-size: 15px; padding: 10px 0; color: #ffffff; font-weight: 500;">EMI Amount:</td>
                          <td style="color: #ffffff; font-size: 24px; font-weight: 700; text-align: right; padding: 10px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.15);">₹${emiAmount.toLocaleString("en-IN")}</td>
                        </tr>
                        <tr style="border-top: 1px solid rgba(255,255,255,0.3);">
                          <td style="font-size: 15px; padding: 10px 0; color: #ffffff; font-weight: 500;">Due Date:</td>
                          <td style="color: #ffffff; font-size: 15px; font-weight: 700; text-align: right; padding: 10px 0;">${formattedDate}</td>
                        </tr>
                      </table>
                      
                      <!-- Progress Bar -->
                      <div style="margin-top: 25px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                          <span style="font-size: 14px; color: #ffffff; font-weight: 500;">Payment Progress</span>
                          <span style="font-size: 14px; font-weight: 700; color: #ffffff;">${paidMonths} of ${totalMonths} months</span>
                        </div>
                        <div style="background: rgba(255, 255, 255, 0.25); border-radius: 12px; height: 14px; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);">
                          <div style="background: #ffffff; width: ${progressPercentage}%; height: 100%; border-radius: 12px; box-shadow: 0 0 12px rgba(255, 255, 255, 0.6);"></div>
                        </div>
                        <p style="margin: 10px 0 0; font-size: 14px; color: #ffffff; font-weight: 500;">${remainingMonths} months remaining</p>
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- CTA Button -->
                <tr>
                  <td style="padding: 0 30px 30px; text-align: center;">
                    <a href="https://mentoons.com/payment" style="display: inline-block; background: linear-gradient(135deg, #FF8C00 0%, #FFA500 100%); color: #ffffff; text-decoration: none; padding: 18px 55px; border-radius: 30px; font-size: 17px; font-weight: 700; box-shadow: 0 6px 20px rgba(255, 140, 0, 0.35); text-shadow: 0 1px 2px rgba(0,0,0,0.2);">
                      💳 Pay Now
                    </a>
                  </td>
                </tr>

                <!-- Important Note -->
                <tr>
                  <td style="padding: 0 30px 30px;">
                    <div style="background: #FFF9F0; border-left: 4px solid #FFB347; padding: 22px; border-radius: 10px; border: 2px dashed #FFB347;">
                      <p style="margin: 0; color: #B45309; font-size: 15px; line-height: 1.7; font-weight: 500; display: flex; align-items: flex-start;">
                        <span style="font-size: 20px; margin-right: 12px; flex-shrink: 0;">💡</span>
                        <span><strong style="color: #92400E; font-weight: 700;">Important:</strong> To maintain uninterrupted access to your workshop, please ensure timely payment. Late payments may affect your enrollment status.</span>
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Closing -->
                <tr>
                  <td style="padding: 0 30px 30px;">
                    <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.6; font-weight: 500;">
                      Thank you for choosing Mentoons!
                    </p>
                    <p style="margin: 12px 0 0; color: #4a4a4a; font-size: 15px; font-weight: 600;">
                      Best regards,<br>
                      <span style="color: #FF8C00; font-weight: 700;">The Mentoons Team</span>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background: linear-gradient(135deg, #FFF5E6 0%, #FFE8CC 100%); padding: 30px; text-align: center; border-top: 3px solid #FFB347;">
                    <p style="margin: 0 0 10px; color: #4a4a4a; font-size: 14px; font-weight: 500;">
                      Need help? Contact us at <a href="mailto:info@mentoons.com" style="color: #E67700; text-decoration: none; font-weight: 700;">info@mentoons.com</a>
                    </p>
                    <p style="margin: 0; color: #666666; font-size: 12px; font-weight: 500;">
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
