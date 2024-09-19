const Email = require("../models/email")
const { sendEmail } = require("../services/emailService")
const messageHelper = require("../utils/messageHelper")
const { errorResponse, successResponse } = require("../utils/responseHelper")
const asyncHandler = require('../utils/asyncHandler')
const emailHelper = require('../helpers/emailHelper')
const ExcelJS = require('exceljs');
const { saveOTPToDB, validateOtp } = require("../helpers/otpHelpers")
const whatsappMessage = require("../services/twillioWhatsappService")
const { createOtp, hashData } = require("../utils/functions")


module.exports = {
    subscribeNewsletter: asyncHandler(async (req, res, next) => {
        const { name, email,countryCode, phone, message } = req.body

        if (!name && !email && !phone) {
            errorResponse(res, 404, messageHelper.BAD_REQUEST)
        }
        const adminOptions = {
            from: process.env.EMAIL_USER,
            to: 'metalmahesh@gmail.com',
            subject: 'New Newsletter Subscription',
            text: `You have a new newsletter subscription.\n\nDetails:\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`,
        };

        const userOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Thank you for subscribing!',
            html: `
            <div style="font-family: 'Futura', sans-serif; background-color: #f8f9fa; padding: 20px; border-radius: 8px; border: 2px solid #007bff;">
                <h1 style="color: #007bff;">Thank you for subscribing!</h1>
                <p style="color: #333; font-size: 16px;">We're excited to have you on board! You will now receive our latest updates and newsletters.</p>
            </div>
        `,

        };

        await emailHelper.saveEmailToDB({ name, email,countryCode, phone, message });
        await sendEmail(userOptions);
        await sendEmail(adminOptions);
        return successResponse(res, 200, messageHelper.NEWSLETTER_SUBSCRIBED);
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
        console.log(phoneNo)
        const otp = await createOtp();
        const hashedOtp = await hashData(otp);
        const otpData = await saveOTPToDB({ phone, countryCode, otp: hashedOtp });
        whatsappMessage(`Your 6 digit OTP is: ${otp}`, phoneNo)
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
            subject: 'New free download claimed',
            text: `You have a new free download claimed.\n\nDetails:\nName: ${name}\nEmail: ${email}\nPhone: ${phone}`,
        };
        const userOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Thank you for subscribing!',
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

        await emailHelper.saveEmailToDB({ name, email,countryCode, phone});
        await sendEmail(userOptions);
        await sendEmail(adminOptions);
        return successResponse(res, 200, messageHelper.FREE_DOWNLOAD_CLAIMED);
    }),



    getLeadData: asyncHandler(async (req, res, next) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Leads');

        worksheet.columns = [
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Phone', key: 'phone', width: 20 },
            { header: 'Message', key: 'message', width: 50 }
        ];
        const leadData = await emailHelper.getLeadsFromDB()
        leadData.forEach(user => {
            worksheet.addRow({
                name: user.name,
                email: user.email,
                phone: user.phone,
                message: user.message
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    })
} 