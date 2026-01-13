const cron = require("node-cron");
const UserPlan = require("../models/workshop/userPlan");
const {
  generateEmiReminderEmail,
} = require("../utils/templates/emi/emiReminder");
const { sendEmail } = require("../services/emailService");
const { generateEmiPaymentEmail } = require("../utils/templates/emi/emiPay");

cron.schedule(
  "0 9 * * *",
  async () => {
    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const startOfTomorrow = new Date(tomorrow);
      startOfTomorrow.setHours(0, 0, 0, 0);

      const endOfTomorrow = new Date(tomorrow);
      endOfTomorrow.setHours(23, 59, 59, 999);

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const reachingDueDate = await UserPlan.find({
        "emiDetails.status": "active",
        "emiDetails.nextDueDate": {
          $gte: startOfTomorrow,
          $lte: endOfTomorrow,
        },
      })
        .populate("userId")
        .populate("planId");

      const reachedDueDate = await UserPlan.find({
        "emiDetails.nextDueDate": {
          $gte: startOfToday,
          $lte: endOfToday,
        },
      })
        .populate("userId")
        .populate("planId");

      for (const i of reachingDueDate) {
        try {
          await sendEmail({
            from: "info@mentoons.com",
            to: i.userId.email,
            subject: "Upcoming EMI Payment Reminder",
            ...generateEmiReminderEmail(i.userId, i.planId, i.emiDetails),
          });
        } catch (err) {
          console.error(`Failed reminder email for user ${i.userId._id}`, err);
        }
      }

      for (const i of reachedDueDate) {
        try {
          await sendEmail({
            from: "info@mentoons.com",
            to: i.userId.email,
            subject: "EMI Payment Due Today – Please Complete Your Payment",
            ...generateEmiPaymentEmail(i.userId, i.planId, i.emiDetails),
          });
        } catch (err) {
          console.error(`Failed due email for user ${i.userId._id}`, err);
        }
      }
    } catch (error) {
      console.error("EMI CRON FAILED COMPLETELY:", error);
    }
  },
  {
    timezone: "Asia/Kolkata",
  }
);
