const Email = require("../models/email");
const { sendEmail } = require("../services/emailService");
const messageHelper = require("../utils/messageHelper");
const { errorResponse, successResponse } = require("../utils/responseHelper");
const asyncHandler = require("../utils/asyncHandler");
const emailHelper = require("../helpers/emailHelper");
const ExcelJS = require("exceljs");
const { saveOTPToDB, validateOtp } = require("../helpers/otpHelpers");
const whatsappMessage = require("../services/twillioWhatsappService");
const { createOtp, hashData } = require("../utils/functions");

// Newsletter Email Template function

module.exports = {
  subscribeNewsletter: asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
      errorResponse(res, 404, messageHelper.BAD_REQUEST);
    }
    const adminOptions = {
      from: process.env.EMAIL_USER,
      to: "metalmahesh@gmail.com",
      subject: "New Newsletter Subscription",
      text: `You have a new newsletter subscription.\n\nDetails:\nEmail: ${email}`,
    };

    const userOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thank you for subscribing!",
      html: NewsletterEmailTemplate(),
    };

    await emailHelper.saveEmailToDB({
      email,
    });
    await sendEmail(userOptions);
    await sendEmail(adminOptions);
    return successResponse(res, 200, messageHelper.NEWSLETTER_SUBSCRIBED);
  }),
  sendEmailToUser: asyncHandler(async (req, res, next) => {
    const { type, email, data } = req.body;
    if (!email || !data) {
      return errorResponse(res, 404, messageHelper.BAD_REQUEST);
    }
    const userOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to Mentoons!",
      html: WelcomeEmailTemplate(email, data),
    };
    const isEmailSent = await sendEmail(userOptions);

    return successResponse(res, 200, messageHelper.EMAIL_SENT);
  }),
  sendProductEmail: asyncHandler(async (req, res, next) => {
    const { name, email, productName, productPrice } = req.body;
    if (!name || !email || !productName || !productPrice) {
      return errorResponse(res, 404, messageHelper.BAD_REQUEST);
    }
    const userOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Product Purchase Confirmation",
      html: ProductEmailTemplate(name, email, productName, productPrice),
    };
    const isEmailSent = await sendEmail(userOptions);
    return successResponse(res, 200, messageHelper.EMAIL_SENT);
  }),

  sendSubscriptionEmail: asyncHandler(async (req, res, next) => {
    const { name, email, phone, pdf, thumbnail } = req.body;
    if (!name || !email || !phone || !pdf || !thumbnail) {
      return errorResponse(res, 404, messageHelper.BAD_REQUEST);
    }
    const userOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to Premium Subscription",
      html: SubscriptionEmailTemplate(name, email, phone, pdf, thumbnail),
    };
    const isEmailSent = await sendEmail(userOptions);
    return successResponse(res, 200, messageHelper.EMAIL_SENT);
  }),

  sendAssessmentEmail: asyncHandler(async (req, res, next) => {
    const { name, email, phone, pdf, thumbnail } = req.body;
    if (!name || !email || !phone || !pdf || !thumbnail) {
      return errorResponse(res, 404, messageHelper.BAD_REQUEST);
    }
    const userOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Assessment Results",
      html: AssessementEmailTemplate(name, email, phone, pdf, thumbnail),
    };
    const isEmailSent = await sendEmail(userOptions);
    return successResponse(res, 200, messageHelper.EMAIL_SENT);
  }),

  // freeDownloads: asyncHandler(async (req, res, next) => {
  //     const { name, email, phone ,pdf,thumbnail } = req.body

  //     if (!name && !email && !phone && !pdf && !thumbnail) {
  //         errorResponse(res, 404, messageHelper.BAD_REQUEST)
  //     }
  //     const adminOptions = {
  //         from: process.env.EMAIL_USER,
  //         to: 'metalmahesh@gmail.com',
  //         subject: 'New free download claimed',
  //         text: `You have a new free download claimed.\n\nDetails:\nName: ${name}\nEmail: ${email}\nPhone: ${phone}`,
  //     };

  //     const userOptions = {
  //         from: process.env.EMAIL_USER,
  //         to: email,
  //         subject: 'Thank you for subscribing!',
  //         html: `
  //             <div style="font-family: 'Futura', sans-serif; background-color: #fff3cd; padding: 20px; border-radius: 8px; border: 2px solid #ffc107;">
  //                 <h1 style="color: #ffc107;">Thank you for subscribing!</h1>
  //                 <p style="color: #6c757d; font-size: 16px;">We're thrilled to have you! Click the thumbnail below to download your free PDF:</p>
  //                 <a href="${pdf}" download style="display: inline-block; text-decoration: none;">
  //                     <img src="${thumbnail}" alt="PDF Thumbnail" style="max-width: 100%; height: auto; border: 2px solid #ffc107; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" />
  //                 </a>
  //                 <p style="font-size: 14px; color: #6c757d; margin-top: 10px;">Happy reading!</p>
  //             </div>
  //         `,
  //     };
  //     await emailHelper.saveEmailToDB({ name, email, phone });
  //     await sendEmail(userOptions);
  //     await sendEmail(adminOptions);
  //     return successResponse(res, 200, messageHelper.FREE_DOWNLOAD_CLAIMED);
  // }),

  freeDownloadsRequest: asyncHandler(async (req, res, next) => {
    const { phone, countryCode } = req.body;
    if (!phone || !countryCode) {
      return errorResponse(res, 400, messageHelper.BAD_REQUEST);
    }
    const phoneNo = `${countryCode}${phone}`;
    console.log(phoneNo);
    const otp = await createOtp();
    const hashedOtp = await hashData(otp);
    const otpData = await saveOTPToDB({ phone, countryCode, otp: hashedOtp });
    whatsappMessage(`Your 6 digit OTP is: ${otp}`, phoneNo);
    return successResponse(res, 200, messageHelper.OTP_SENT_SUCCESSFULLY);
  }),

  freeDownloadsVerifyOtp: asyncHandler(async (req, res, next) => {
    const { name, email, phone, countryCode, pdf, thumbnail, otp } = req.body;

    if (!name || !email || !phone || !countryCode || !pdf || !thumbnail) {
      return errorResponse(res, 404, messageHelper.BAD_REQUEST);
    }
    const isValid = await validateOtp(phone, countryCode, otp);
    if (!isValid) {
      return errorResponse(res, 400, messageHelper.INVALID_OTP);
    }
    const adminOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: "New free download claimed",
      text: `You have a new free download claimed.\n\nDetails:\nName: ${name}\nEmail: ${email}\nPhone: ${phone}`,
    };
    const userOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thank you for subscribing!",
      html: `
                <div style="font-family: 'Futura', sans-serif; background-color: #fff3cd; padding: 20px; border-radius: 8px; border: 2px solid #ffc107;">
                    <h1 style="color: #ffc107;">Thank you for subscribing!</h1>
                    <p style="color: #6c757d; font-size: 16px;">We're thrilled to have you! Click the thumbnail below to download your free PDF:</p>
                    <a href="${pdf}" download style="display: inline-block; text-decoration: none;">
                        <img src="${thumbnail}" alt="PDF Thumbnail" style="max-width: 50%; height: auto; border: 2px solid #ffc107; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" />
                    </a>
                    <p style="font-size: 14px; color: #6c757d; margin-top: 10px;">Happy reading!</p>
                </div>
            `,
    };

    await emailHelper.saveEmailToDB({ name, email, countryCode, phone });
    await sendEmail(userOptions);
    await sendEmail(adminOptions);
    return successResponse(res, 200, messageHelper.FREE_DOWNLOAD_CLAIMED);
  }),

  getLeadData: asyncHandler(async (req, res, next) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Leads");

    worksheet.columns = [
      { header: "Name", key: "name", width: 30 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 20 },
      { header: "Message", key: "message", width: 50 },
    ];
    const leadData = await emailHelper.getLeadsFromDB();
    leadData.forEach((user) => {
      worksheet.addRow({
        name: user.name,
        email: user.email,
        phone: user.phone,
        message: user.message,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=users.xlsx");
    await workbook.xlsx.write(res);
    res.end();
  }),

  freeDownloadComic: asyncHandler(async (req, res, next) => {
    const { email, data } = req.body;

    if (!email || !data) {
      throw new Error("Missing fields are required fields");
    }

    const adminOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: "Free Comic from Mentoons",
      text: `You have a new free download claimed.\n\nDetails:\nEmail: ${email}\n`,
    };

    const userOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Enjoy your Free Downloads from Mentoons!",
      html: `
                  <div style="font-family: 'Futura', sans-serif; background-color: #f7bbc3; padding: 20px; border-radius: 8px; border: 2px solid #eb3f56;">
                      <h1 style="color: #eb3f56;">Thank you for subscribing!</h1>
                      <p style="color: #6c757d; font-size: 16px;">We're thrilled to have you! Click the thumbnail below to download your free PDF:</p>
                      <a href="${data.pdf}" download style="display: inline-block; text-decoration: none;">
                          <img src="${data.thumbnail}" alt="PDF Thumbnail" style="max-width: 50%; height: auto; border: 2px solid #eb3f56; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" />
                      </a>
                      <p style="font-size: 14px; color: #6c757d; margin-top: 10px;">Happy reading!</p>
                  </div>
              `,
    };

    await sendEmail(userOptions);
    await sendEmail(adminOptions);
    return successResponse(
      res,
      200,
      messageHelper.FREE_DOWNLOAD_CLAIMED,
      email
    );
  }),

  sendNewsletterEmail: asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, 400, messageHelper.BAD_REQUEST);
    }

    const adminOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: "Newsletter Email Sent",
      text: `A newsletter email has been sent to: ${email}`,
    };

    const userOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Mentoons Newsletter - Latest Updates!",
      html: NewsletterEmailTemplate(),
    };

    await sendEmail(userOptions);
    await sendEmail(adminOptions);
    return successResponse(res, 200, messageHelper.EMAIL_SENT);
  }),
};

const WelcomeEmailTemplate = (email, data) => {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px; padding: 30px; position: relative; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        
        <div style="text-align: center; margin-bottom: 25px;">
            <img src="https://mentoons-website.s3.ap-northeast-1.amazonaws.com/logo/ec9141ccd046aff5a1ffb4fe60f79316.png" alt="Mentoons Logo" style="max-width: 120px; height: auto;"/>
        </div>
        
        <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; margin-bottom: 25px; ">
            <div style="background: #FFE5D4; padding: 10px; border-radius: 8px; margin-bottom: 15px;">
                <h1 style="color: #FF6B35; text-align: center; font-size: 24px; margin: 0; font-weight: 600;">
                    🎉 Welcome to Mentoons! 🎉
                </h1>
            </div>
            <p style="color: #6c757d; font-size: 16px; text-align: center; margin: 15px 0; line-height: 1.6;">
                Thank you for joining us! 🌟 Your complimentary PDF is ready for download below.
            </p>
        </div>

        <div style="text-align: center; background-color: #ffffff; border-radius: 8px; padding: 20px; margin-bottom: 25px; position: relative;">
            <!-- Decorative ribbon -->
            
            
            <a href="${data.pdf}" download style="display: inline-block; text-decoration: none;">
                <img src="${data.thumbnail}" alt="PDF Thumbnail" style="max-width: 50%; height: auto; border: 3px solid #FF6B35; border-radius: 8px; box-shadow: 0 4px 15px rgba(255,107,53,0.2); transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" />
            </a>
        </div>

        <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; text-align: center; border: 2px solid #FFE5D4;">
            <p style="color: #FF6B35; font-size: 16px; margin: 0;">
                ✨ We hope you enjoy your magical reading experience with Mentoons! ✨
            </p>
        </div>

        <div style="text-align: center; margin-top: 20px;">
            <p style="color: #adb5bd; font-size: 12px; margin: 0;">
                © 2025 Mentoons. All rights reserved. 🌟
            </p>
        </div>

        <style>
            @keyframes float {
                0% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
                100% { transform: translateY(0px); }
            }
        </style>
    </div>
  `;
};

const SubscriptionEmailTemplate = (name, email, phone, pdf, thumbnail) => {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <div style="background: linear-gradient(135deg, #FF6B35 0%, #FF6B35 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <img src="https://mentoons-website.s3.ap-northeast-1.amazonaws.com/logo/ec9141ccd046aff5a1ffb4fe60f79316.png" alt="Mentoons Logo" style="width: 120px; margin-bottom: 20px;">
        <h1 style="color: #ffffff; font-size: 28px; margin: 0;">Welcome to Premium!</h1>
      </div>

      <div style="padding: 40px 30px;">
        <div style="background-color: #F3F4F6; border-radius: 6px; padding: 20px; margin-bottom: 30px;">
          <h2 style="color: #1F2937; font-size: 20px; margin: 0 0 15px 0;">Subscription Details</h2>
          <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin: 0;">
            <strong>Name:</strong> ${name}<br>
            <strong>Email:</strong> ${email}<br>
            <strong>Phone:</strong> ${phone}
          </p>
        </div>

        <div style="text-align: center; margin-bottom: 30px;">
          <p style="color: #1F2937; font-size: 16px; line-height: 1.6;">
            Your premium content is ready! Click below to access your materials:
          </p>
          <a href="${pdf}" download style="display: inline-block; text-decoration: none;">
            <img src="${thumbnail}" alt="Content Preview" style="max-width: 300px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          </a>
        </div>

        <div style="border-top: 1px solid #E5E7EB; padding-top: 30px;">
          <h3 style="color: #1F2937; font-size: 18px; margin: 0 0 15px 0;">What's Next?</h3>
          <ul style="color: #4B5563; font-size: 16px; line-height: 1.6; padding-left: 20px;">
            <li>Explore your premium dashboard</li>
            <li>Access exclusive content</li>
            <li>Join our community discussions</li>
            <li>Get priority support</li>
          </ul>
        </div>
      </div>

      <div style="background-color: #F3F4F6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
        <p style="color: #6B7280; font-size: 14px; margin: 0;">
          Need help? Contact us at <a href="mailto:info@mentoons.com">info@mentoons.com"</a><br>
          Follow us on social media @mentoons
        </p>
      </div>
    </div>
  </div>
  `;
};

const AssessementEmailTemplate = (name, email, phone, pdf, thumbnail) => {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 15px; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.2);">
      <!-- Header Section -->
      <div style="background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); padding: 40px 20px; text-align: center; border-radius: 15px 15px 0 0; position: relative;">
        <img src="https://mentoons-website.s3.ap-northeast-1.amazonaws.com/logo/ec9141ccd046aff5a1ffb4fe60f79316.png" alt="Mentoons Logo" style="width: 150px; margin-bottom: 20px;">
        <h1 style="color: #ffffff; font-size: 32px; margin: 0;">Your Assessment Results Are Here! 🎉</h1>
      </div>

      <!-- Main Content -->
      <div style="padding: 40px 30px;">
        <!-- Personal Greeting -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #FF6B35; font-size: 24px; margin: 0 0 15px 0;">Dear ${name},</h2>
          <p style="color: #4B5563; font-size: 18px; line-height: 1.6;">
            Thank you for completing the Mentoons Assessment! We're excited to share your personalized results and help you unlock your full potential. 🌟
          </p>
        </div>

        <!-- Assessment Report Section -->
        <div style="background-color: #FFF3EE; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
          <h3 style="color: #FF6B35; font-size: 22px; margin: 0 0 15px 0;">📊 Your Assessment Report</h3>
          <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            We've analyzed your responses and created a comprehensive report just for you. Click below to view your detailed assessment:
          </p>
          <div style="text-align: center;">
            <a href="${pdf}" download style="display: inline-block; text-decoration: none;">
              <img src="${thumbnail}" alt="Assessment Report" style="max-width: 300px; border-radius: 8px; margin: 20px 0; box-shadow: 0 4px 8px rgba(255, 107, 53, 0.15); transition: transform 0.3s ease;">
            </a>
          </div>
        </div>

        <!-- Next Steps Section -->
        <div style="background-color: #F9FAFB; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
          <h3 style="color: #FF6B35; font-size: 22px; margin: 0 0 15px 0;">🚀 Ready to Transform?</h3>
          <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
            Want to achieve your full potential? We're here to help! Check out our:
          </p>
          <ul style="color: #4B5563; font-size: 16px; line-height: 1.8; padding-left: 20px;">
            <li><a href="https://mentoons.com" style="color: #FF6B35; text-decoration: none;">Visit our website</a> for more resources</li>
            <li><a href="https://mentoons.com/workshops" style="color: #FF6B35; text-decoration: none;">Join our workshops</a> for hands-on learning</li>
            <li>Book a <a href="https://mentoons.com/bookings" style="color: #FF6B35; text-decoration: none;">free consultation</a> with our experts</li>
          </ul>
        </div>

        <!-- Contact Information -->
        <div style="text-align: center; margin-top: 30px;">
          <h3 style="color: #FF6B35; font-size: 20px; margin: 0 0 15px 0;">📞 Let's Connect!</h3>
          <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
            Phone: +91 XXXXXXXXXX<br>
            Email: support@mentoons.com<br>
            Follow us: @mentoons
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #FF6B35; padding: 20px; text-align: center; border-radius: 0 0 15px 15px;">
        <p style="color: #ffffff; font-size: 14px; margin: 0;">
          © 2025 Mentoons. All rights reserved.<br>
          Helping young minds reach their full potential!
        </p>
      </div>
    </div>
  `;
};

//NOTE: Create utility function for emails instead of controllers.
const NewsletterEmailTemplate = () => {
  return ` <div
      style="
        font-family: 'Helvetica Neue', Arial, sans-serif;
        max-width: 60%;
        margin: 0 auto;
        background-color: #f7e0c3;
      "
    >
      <!-- Header with Logo -->
      <div
        style="text-align: start; padding: 20px 18px; background-color: #e39712"
      >
        <img
          src="https://mentoons-website.s3.ap-northeast-1.amazonaws.com/logo/ec9141ccd046aff5a1ffb4fe60f79316.png"
          alt="Mentoons Logo"
          style="max-width: 180px; height: auto"
        />
      </div>

      <!-- Welcome Section -->
      <div
        style="
          text-align: start;
          margin-bottom: 20px;
          padding: 32px;
          padding-top: 0px;
          background-color: #e39712;
        "
      >
        <h1
          style="
            color: #ffffff;
            font-size: 42px;
            margin: 0;
            text-transform: uppercase;
            font-weight: bold;
          "
        >
          WELCOME TO
        </h1>
        <h1
          style="
            color: #ffffff;
            font-size: 42px;
            margin: 0;
            text-transform: uppercase;
            font-weight: bold;
          "
        >
          MENTOONS
        </h1>
        <h1
          style="
            color: #ffffff;
            font-size: 42px;
            margin: 0;
            text-transform: uppercase;
            font-weight: bold;
          "
        >
          NEWSLETTER
        </h1>
      </div>

      <!-- Introduction -->
      <div
        style="
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
          display: flex-inline;
        "
      >
        <p
          style="
            color: #333333;
            font-size: 18px;
            line-height: 1.5;
            margin: 0;
            text-align: center;
          "
        >
          Greetings, Special welcome to Mentoons! As part of the Mentoons
          Newsletter, in this issue we bring you insightful articles, upcoming
          workshops, and exciting news. Stay tuned for more updates!
        </p>
        <div
          style="
            height: 6px;
            width: 48px;
            background-color: #000000;
            margin: 20px auto;
          "
        ></div>
      </div>

      <!-- What's New Today Section -->
      <div style="margin-bottom: 20px">
        <div style="border-radius: 8px; padding: 10px; text-align: center">
          <h2 style="color: #e39712; font-size: 30px; margin: 0">
            WHAT'S NEW TODAY?
          </h2>
        </div>

        <!-- New Item 1 -->
        <div
          style="
            background-color: #9fe9ff;
            padding: 32px;
            margin-top: 15px;
            display: flex;
          "
        >
          <div style="flex: 0 0 40%">
            <img
              src="https://plus.unsplash.com/premium_photo-1717774172640-b7d9a3192c5e?q=80&w=1502&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Eclipse"
              style="width: 100%; height: 100%;  border-radius: 5px"
            />
          </div>
          <div style="flex: 0 0 60%; padding-left: 15px">
            <h3 style="color: #333333; font-size: 24px; margin: 0 0 10px 0; padding:12px;">
              Introducing Mentoons Mythos
            </h3>
            <p
              style="color: #666666; font-size: 18px; line-height: 1.8; margin: 0;padding: 12px;;"
            >
             Mentoons Mythos isn’t just about reports; it’s a thriving community of individuals seeking purpose, clarity, and cosmic guidance. Whether you’re exploring astrology, psychology, or career growth, our groups help you connect with like-minded people who share your journey.
            </p>
          </div>
        </div>

        <!-- New Item 2 -->
        <div
          style="
            background-color: #fe8b7d;
            padding: 32px;
            margin-top: 16px;
            display: flex;
          "
        >
          <div style="flex: 0 0 60%;">
            <h3 style="color: #333333; font-size: 24px; margin: 0 0 10px 0; padding-right: 12px; padding-left: 0px;">
              Meet our New Psychologist: Dr. Nisha K</h3>
            <p
              style="color: #333333; font-size: 18px; line-height: 1.8; margin: 0;padding-right: 12px; "
            >
              We're excited to welcome Dr. Nisha K to our team. With over 10
              years of experience in child psychology, she brings valuable
              expertise to our workshops.
            </p>
          </div>
          <div style="flex: 0 0 40%">
            <img
              src="https://plus.unsplash.com/premium_photo-1682089872205-dbbae3e4ba32?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Psychologist"
              style="width: 100%; height: 100%; border-radius: 5px"
            />
          </div>
        </div>

        <!-- New Item 3 -->
        <div
          style="
            background-color: #fee898;
            padding: 32px;
            margin-top: 16px;
            display: flex;
          "
        >
          <div style="flex: 0 0 40%">
            <img
              src="https://images.unsplash.com/photo-1581041122145-9f17c04cd153?q=80&w=3542&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="New Arrival"
              style="width: 100%; height: 100%; border-radius: 5px"
            />
          </div>
          <div style="flex: 0 0 60%; padding-left: 15px">
            <h3 style="color: #333333; font-size: 24px; margin: 0 0 10px 0; padding: 12px;" >
              New Exciting Stuffs coming up for our Mentoons Fam!
            </h3>
            <p
              style="color: #666666; font-size: 18px; line-height: 2; margin: 0; padding:12px"
            >
              We've got new set of product to launch soon. Stay tuned for more
              details on these engaging produc for children of all ages.
            </p>
          </div>
        </div>
      </div>

      <!-- Upcoming Events Section -->
      <div style="margin-bottom: 20px; padding: 32px; padding-bottom: 0px">
        <div style="display: flex; align-items: center">
          <div
            style="
              width: 60px;
              height: 60px;
              background-color: #ffffff;
              border-radius: 50%;
              display: flex;
              justify-content: center;
              align-items: center;
              margin-right: 10px;
            "
          >
            <span style="color: #ffc107; font-weight: bold">📅</span>
          </div>
          <h2 style="color: #000000; font-size: 32px; margin: 0">
            Upcoming Events & Workshops
          </h2>
        </div>

        <!-- Event List -->
        <div style="border-radius: 8px; padding: 15px">
          <p
            style="
              color: #666666;
              font-size: 18px;
              line-height: 1.4;
              margin: 0 0 10px 0;
            "
          >
            Join our expert-led sessions to gain personalized insights and
            career clarity based on astrology and psychology!
          </p>

          <!-- Event 1 -->
          <div style="display: flex; align-items: center; margin-bottom: 10px; padding-top: 24px; margin-left: 6%; ">
            <div
              style="
                margin-right: 10px;
                flex-shrink: 0;
                margin-top: 2px;
                font-size: xx-large;
              "
            >🔮</div>
            <p
              style="
                color: #333333;
                font-size: 18px;
                line-height: 1.4;
                margin: 0;
                margin-left: 24px;
              "
            >
              <strong>Decode Your Birth Chart - LIVE Workshop</strong>
            </p>
          </div>

          <!-- Event 2 -->
          <div style="display: flex; align-items: center;  margin-bottom: 10px; margin-left: 6%;">
            <div
              style="
                margin-right: 10px;
                flex-shrink: 0;
                margin-top: 2px;
                font-size: xx-large;
              "
            >✨</div>
            <p
              style="
                color: #333333;
                font-size: 18px;
                line-height: 1.4;
                margin: 0;
                margin-left: 24px;
              "
            >
              <strong>Career Alignment with Astrology & Psychology</strong>
            </p>
          </div>
          <!-- Event 3 -->
          <div style="display: flex; align-items: center; margin-bottom: 10px; margin-left: 6%;">
            <div
              style="
                margin-right: 10px;
                flex-shrink: 0;
                margin-top: 2px;
                font-size: xx-large;
              "
            >🧠</div>
            <p
              style="
                color: #333333;
                font-size: 18px;
                line-height: 1.4;
                margin: 0;
                margin-left: 24px;
              "
            >
              <strong>Expert talk: Learn the right Parenting Tips!</strong>
            </p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px">
          <a
            href="https://mentoons.com/mentoons-workshops"
            style="
              display: inline-block;
              background-color: #e39712;
              color: #ffffff;
              padding: 12px 30px;

              text-decoration: none;
              font-size: 18px;
              font-weight: bold;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            "
          >
            REGISTER NOW
          </a>
        </div>
        <div style="border-top: 2px dotted #000000; margin: 32px 0"></div>
      </div>

      <!-- Workshop Highlights Section -->
      <div style="margin-bottom: 20px">
        <h2
          style="
            color: #000000;
            font-size: 32px;
            line-height: 1.5;
            text-align: center;
            padding-bottom: 32px;
            width: 80%;
            margin: auto;
          "
        >
          Fear of Missing Out? Here's the Highlight of our previous Workshop
        </h2>

        <!-- Workshop Image -->
        <div style="padding: 32px; padding-top: 10px; ">
          <img
            src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Workshop Highlights"
            style="width: 100%; border-radius: 5px; margin-bottom: 15px"
          />
          <p
            style="color: #666666; font-size: 18px; line-height: 1.4; margin: 0"
          >
            This month, we welcomed Dr. Nisha. K, a renowned psychologist and
            astrologer specializing in career guidance and life coaching. Read
            their exclusive interview on how planetary shifts influence career
            success!
          </p>
          <div style="border-top: 2px dotted #000000; margin: 32px 0"></div>
        </div>
      </div>

      <!-- Membership Benefits Section -->
      <div style="margin-bottom: 2px; padding: 42px; border: #000000; "  >
        <div
          style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px"
        >
          <!-- Column 1 -->
          <div
            style="
              border-radius: 8px;
              height: 100%;
              display: flex;
              flex-direction: column;
              align-items: start;
             
            "
          >
            <img
              src="https://images.unsplash.com/photo-1581579186913-45ac3e6efe93?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjd8fGZhbWlseXxlbnwwfHwwfHx8Mg%3D%3D"
              alt="Column 1"
              style="
                width: 100%;
                height: 200px;
                object-fit: cover;
                border-radius: 8px;
                margin:0px;
              "
            />
            <h3 style="color: #333333; font-size: 24px; margin: 0px;;  margin-bottom: 18px; padding-top:24px">
              What Parents say about us?
            </h3>
            <p
              style="
                color: #666666;
                font-size: 18px;
                line-height: 1.5;
                
              "
            >
              See how Mentoons Mythos has transformed lives! Read inspiring
              testimonials from our members who found career clarity and life
              purpose through our personalized reports and workshops.
            </p>
          </div>

          <!-- Column 2 -->
          <div
            style="
              
              height: 100%;
              display: flex;
              flex-direction: column;
              border-radius: 8px;
              align-items: center;
            
            "
          >
            <img
              src="https://images.unsplash.com/photo-1588873281272-14886ba1f737?q=80&w=3425&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Column 1"
              style="
                width: 100%;
                height: 200px;
                object-fit: cover;
                border-radius: 8px;
              "
            />
            <h3 style="color: #333333; font-size: 24px; margin-bottom: 18px">
              Join us as Psychologist!
            </h3>
            <p style="color: #666666; font-size: 18px; line-height: 1.5">
              This month, we welcome renowned psychologist and astrologer
              specializing in career guidance and life coaching.
            </p>
            <a
              href="https://mentoons.com/hiring"
              style="
              width: 80%;
                display: inline-block;
                background-color: #e39712;
                color: #ffffff;
                padding: 14px 30px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                text-transform: uppercase;
                text-align: center;
                margin-top: 12px;
              "
            >
              Apply Now
            </a>
          </div>

          <!-- Column 3 -->
          <div
            style="
             
              border-radius: 8px;
              height: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
             
            "
          >
            <img
              src="https://images.unsplash.com/photo-1530099486328-e021101a494a?q=80&w=3347&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Column 1"
              style="
                width: 100%;
                height: 200px;
                object-fit: cover;
                border-radius: 8px;
              "
            />
            <h3 style="color: #333333; font-size: 24px; margin-bottom: 20px">
              Create your own Group in Mentoons
            </h3>
            <p
              style="
                color: #666666;
                font-size: 16px;
                line-height: 1.5;
                margin-bottom: 15px;
                
              "
            >
              Join the Discussion: Become a part of our exclusive online
              community and connect with like-minded individuals!
            </p>
            <a
              href="https://mentoons.com"
              style="
              width: 80%;
                display: inline-block;
                background-color: #e39712;
                color: #ffffff;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                text-transform: uppercase;
                text-align: center;
                margin-top: 20px;
              "
            >
              View Now
            </a>
          </div>
        </div>
      </div>

      <!-- Live Contests Section -->
      <div style="margin-bottom: 20px; padding-top: 32px;">
        <div style="text-align: center; margin-bottom: 30px">
          <h2
            style="
              color: #e39712;
              font-size: 32px;
              margin: 0;
              letter-spacing: 8px;
            "
          >
            🎉 LIVE CONTESTS -
          </h2>
          <h3
            style="
              color: #e39712;
              font-size: 34px;
              letter-spacing: 10px;
              margin: 5px 0 0 0;
            "
          >
            PARTICIPATE & WIN!
          </h3>
        </div>

        <!-- Contest Types -->
        <div
          style="
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            padding: 32px;
          "
        >
          <!-- Contest 1 -->
          <div
            style="
              flex: 1;

              border-radius: 8px;
              border: #000 1px solid;
              padding: 10px;
              text-align: center;
              margin-right: 10px;
            "
          >
            <h4
              style="
                color: #333333;
                font-size: 20px;
                margin: 0 0 5px 0;
                padding: 10px;
              "
            >
              THE ULTIMATE QUIZ TIME
            </h4>
            <div
              style="
                display: inline-flex;
                align-items: center;
                padding: 12px;
                padding-bottom: 20px;
                font-size: xx-large;
              "
            >
              🌟
            </div>
            <p
              style="
                color: #666666;
                font-size: 18px;
                line-height: 1.3;
                margin: 0;
                text-align: center;
              "
            >
                Test your knowledge and win exciting prizes! Join our weekly quizzes 
                on child psychology, astrology, and parenting tips.
            </p>
          </div>

          <!-- Contest 2 -->
          <div
            style="
              flex: 1;
              border-radius: 8px;
              border: #000 1px solid;
              padding: 10px;
              text-align: center;
              margin-right: 10px;
            "
          >
            <h4
              style="
                color: #333333;
                font-size: 20px;
                margin: 0 0 5px 0;
                padding: 10px;
              "
            >
              GUESS THE PERSONALITY?
            </h4>
            <div
              style="
                display: inline-flex;
                align-items: center;
                padding: 12px;
                padding-bottom: 20px;
                font-size: xx-large;
              "
            >📰
             
            </div>
            <p
              style="
                color: #666666;
                font-size: 18px;
                line-height: 1.3;
                margin: 0;
                text-align: center;
              "
            >
                Put your deduction skills to test! Analyze personality traits and 
                zodiac signs to guess famous personalities. Win exclusive merchandise!
            </p>
          </div>

          <!-- Contest 3 -->
          <div
            style="
              flex: 1;
              border: #000 1px solid;
              border-radius: 8px;
              padding: 10px;
              text-align: center;
            "
          >
            <h4
              style="
                color: #333333;
                font-size: 20px;
                margin: 0 0 5px 0;
                padding: 8px;
              "
            >
              STORY-TELLING CONTEST
            </h4>
            <div
              style="
                display: inline-flex;
                align-items: center;
                padding: 12px;
                padding-bottom: 20px;
                font-size:xx-large;
              "
            >📢
              
            </div>
            <p
              style="
                color: #666666;
                font-size: 18px;
                line-height: 1.3;
                margin: 0;
                text-align: center;
              
              "
            >
                Share your creative stories about personal growth, life lessons, or cosmic 
                connections! Best stories win mentoring sessions with our experts.
            </p>
          </div>
        </div>

        <!-- Influencer Spotlight -->
        <div
          style="
            
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
          "
        >
         
          <div style="display: flex; justify-content: space-around">
            <!-- Influencer 1 -->
            <div style="text-align: center; border:#000 1px solid; border-radius: 50%; width: 200px; height: 200px; margin-right: -50px; position: relative; z-index: 3;">
              <img
              src="https://images.unsplash.com/photo-1603217039863-aa0c865404f7?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW5mbHVlbmNlcnxlbnwwfHwwfHx8Mg%3D%3D"
              alt="Influencer 1"
              style="
                width: 200px;
                height: 200px;
                border-radius: 50%;
                margin-bottom: 10px;
              "
              />
            </div>

            <!-- Influencer 2 -->
            <div style="text-align: center; border:#000 1px solid; border-radius: 50%; width: 200px; height: 200px; margin-right: -50px; position: relative; z-index: 2;">
              <img
              src="https://images.unsplash.com/photo-1613053341085-db794820ce43?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8aW5mbHVlbmNlcnxlbnwwfHwwfHx8Mg%3D%3D"
              alt="Influencer 2"
              style="
                width: 200px;
                height: 200px;
                border-radius: 50%;
                margin-bottom: 10px;
              "
              />
            </div>
             <div style="text-align: center; border:#000 1px solid; border-radius: 50%; width: 200px; height: 200px; position: relative; z-index: 1;">
              <img
              src="https://images.unsplash.com/photo-1556766920-b10a2bbb81c8?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGluZmx1ZW5jZXJ8ZW58MHx8MHx8fDI%3D"
              alt="Influencer 3"
              style="
                width: 200px;
                height: 200px;
                border-radius: 50%;
                margin-bottom: 10px;
              "
              />
            </div>
          </div>
         
        </div>
         <h3
            style="
              color: #333333;
              font-size: 16px;
              margin: 0 0 15px 0;
              text-align: center;
            "
          >
            Influencer Spotlight
          </h3>
           <p
            style="
              color: #666666;
              font-size: 14px;
              line-height: 1.4;
              margin: 15px 0 0 0;
              text-align: center;
            "
          >
            Meet our expert speakers who will guide you in our upcoming
            workshops. Don't miss out!
          </p>

      </div>

      <!-- Footer -->
      <div style="text-align: center; background-color: #e39712; padding: 32px; color: white;">
        <div style="display: flex;  justify-content: space-between; align-items: center; max-width: 1000px; margin: 0 auto;">
          <!-- Contact Info Section -->
          <div style="text-align: left;">
            <div style="margin-bottom: 20px; font-size: xx-large;  display: flex; align-items: center; gap:12px" >
              📩
              <span style="font-size: 16px;">Stay Connected</span>
            </div>
            <div style="margin-bottom: 20px; font-size: xx-large;  display: flex; align-items: center; gap:12px">
              📧
              <span style="font-size: 16px;">Need Guidance? Contact us at: support@mentoons.com</span>
            </div>
          </div>

          <!-- Social Media Section -->
          <div style="text-align: left;">
            <h4 style="margin-bottom: 15px; font-size: 16px; ">SOCIAL MEDIA</h4>
            <div style="display: flex; gap: 4px">
              <a href="https://www.facebook.com/people/Mentoons/100078693769495/" style="text-decoration: none;">
                <img src="https://img.icons8.com/?size=100&id=98972&format=png&color=000000" alt="Facebook" style="border-radius: 50%; background-color: white; padding: 2px; width: 20px; height: 20px;">
              </a>
              <a href="#" style="text-decoration: none;">
                <img src="https://img.icons8.com/?size=100&id=60014&format=png&color=000000" alt="Twitter" style="border-radius: 50%; background-color: white; padding: 2px; width: 20px; height: 20px;">
              </a>
              <a href="https://www.instagram.com/toonmentoons?igsh=aTZvejJqYWM4YmFq" style="text-decoration: none;"></a>
                <img src="https://img.icons8.com/?size=100&id=59813&format=png&color=000000" alt="Instagram" style="border-radius: 50%; background-color: white; padding: 2px; width: 20px; height: 20px;">
              </a>
              <a href="https://www.linkedin.com/company/mentoons" style="text-decoration: none;">
                <img src="https://img.icons8.com/?size=100&id=102748&format=png&color=000000" alt="LinkedIn" style="border-radius: 50%; background-color: white; padding: 2px; width: 20px; height: 20px;">
              </a>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  `;
};
