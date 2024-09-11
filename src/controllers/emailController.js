const Email = require("../models/email")
const { sendEmail } = require("../services/emailService")
const messageHelper = require("../utils/messageHelper")
const { errorResponse, successResponse } = require("../utils/responseHelper")
const asyncHandler = require('../utils/asyncHandler')
const emailHelper = require('../helpers/emailHelper')



module.exports = {
    subscribeNewsletter: asyncHandler(async (req, res, next) => {
        const { name, email, phone, message } = req.body

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
            <div style="font-family: 'Comic Sans MS', cursive, sans-serif; background-color: #f8f9fa; padding: 20px; border-radius: 8px; border: 2px solid #007bff;">
                <h1 style="color: #007bff;">Thank you for subscribing!</h1>
                <p style="color: #333; font-size: 16px;">We're excited to have you on board! You will now receive our latest updates and newsletters.</p>
            </div>
        `,
    
        };

        await emailHelper.saveEmailToDB({ name, email, phone, message });
        await sendEmail(userOptions);
        await sendEmail(adminOptions);
        return successResponse(res, 200, messageHelper.NEWSLETTER_SUBSCRIBED);
    }),
    freeDownloads: asyncHandler(async (req, res, next) => {
        const { name, email, phone ,pdf,thumbnail } = req.body

        if (!name && !email && !phone && !pdf && !thumbnail) {
            errorResponse(res, 404, messageHelper.BAD_REQUEST)
        }
        const adminOptions = {
            from: process.env.EMAIL_USER,
            to: 'metalmahesh@gmail.com',
            subject: 'New free download claimed',
            text: `You have a new free download claimed.\n\nDetails:\nName: ${name}\nEmail: ${email}\nPhone: ${phone}`,
        };

        const userOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Thank you for subscribing!',
            html: `
                <div style="font-family: 'Comic Sans MS', cursive, sans-serif; background-color: #fff3cd; padding: 20px; border-radius: 8px; border: 2px solid #ffc107;">
                    <h1 style="color: #ffc107;">Thank you for subscribing!</h1>
                    <p style="color: #6c757d; font-size: 16px;">We're thrilled to have you! Click the thumbnail below to download your free PDF:</p>
                    <a href="${pdf}" download style="display: inline-block; text-decoration: none;">
                        <img src="${thumbnail}" alt="PDF Thumbnail" style="max-width: 100%; height: auto; border: 2px solid #ffc107; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" />
                    </a>
                    <p style="font-size: 14px; color: #6c757d; margin-top: 10px;">Happy reading!</p>
                </div>
            `,
        };
        
        await emailHelper.saveEmailToDB({ name, email, phone });
        await sendEmail(userOptions);
        await sendEmail(adminOptions);
        return successResponse(res, 200, messageHelper.FREE_DOWNLOAD_CLAIMED);
    })
}