const moment = require("moment");
const cron = require("node-cron");
const SessionModal = require("../models/session");
const { sendEmail } = require("../services/emailService");
const { findAvailablePsychologist } = require("../controllers/session");
const Product = require("../models/product");

cron.schedule("0 3 * * *", async () => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const result = await Product.updateMany(
      {
        isNew: true,
        createdAt: { $lt: sevenDaysAgo },
      },
      { $set: { isNew: false } }
    );

    console.log(
      `[CRON] Updated ${result.modifiedCount} products to isNew: false`
    );
  } catch (err) {
    console.error("[CRON] Error updating isNew status:", err.message);
  }
});

cron.schedule("*/10 * * * *", async () => {
  try {
    const now = moment();

    const sessions = await SessionModal.find({ status: "booked" });

    for (const session of sessions) {
      const sessionTime = moment(
        `${session.date} ${session.time}`,
        "YYYY-MM-DD HH:mm"
      );

      const diffMinutes = sessionTime.diff(now, "minutes");
      if (diffMinutes === 1440) {
        await sendEmail(
          session.email,
          "Reminder: Your session is tomorrow",
          `Hi ${
            session.user?.name || "there"
          }, this is a friendly reminder that you have a session scheduled for tomorrow at ${
            session.time
          }.`
        );
      } else if (diffMinutes === 300) {
        await sendEmail(
          session.email,
          "Reminder: 5 hours left for your session"
        );
      } else if (diffMinutes === 120) {
        await sendEmail(
          session.email,
          "Reminder: 2 hours left for your session"
        );
      } else if (diffMinutes === 30) {
        await sendEmail(
          session.email,
          "Reminder: 30 minutes left for your session"
        );
      } else if (diffMinutes === 10) {
        await sendEmail(
          session.email,
          "Reminder: 10 minutes left for your session"
        );
      } else if (diffMinutes === 0) {
        await sendEmail(
          session.email,
          "Your session is starting now",
          "Your session is scheduled to begin now. Would you like to postpone if unavailable?"
        );
      } else if (diffMinutes === -60 && session.status === "booked") {
        const state = session.state;
        const originalTime = session.time;

        let rescheduled = false;
        let dayOffset = 1;

        while (!rescheduled) {
          const newDate = moment().add(dayOffset, "days").format("YYYY-MM-DD");

          let timeSlotsToTry = [originalTime];
          const fallbackTimes = [
            "09:00",
            "10:00",
            "11:00",
            "12:00",
            "14:00",
            "15:00",
            "16:00",
          ];

          fallbackTimes.forEach((t) => {
            if (!timeSlotsToTry.includes(t)) {
              timeSlotsToTry.push(t);
            }
          });

          for (const newTime of timeSlotsToTry) {
            const availablePsychologist = await findAvailablePsychologist(
              newDate,
              newTime,
              state,
              session._id
            );

            if (availablePsychologist) {
              session.date = newDate;
              session.time = newTime;
              session.psychologistId = availablePsychologist._id;
              await session.save();

              await sendEmail(
                session.email,
                "Session Rescheduled",
                `Your session has been automatically rescheduled to ${newDate} at ${newTime} due to unavailability in the previous slot.
              
              You have been assigned a new psychologist for this session:
              
              Psychologist Details:
              Name: ${availablePsychologist.name}`
              );

              rescheduled = true;
              break;
            }
          }

          dayOffset++;
        }
      }
    }

    console.log("Session check executed at", now.format("YYYY-MM-DD HH:mm"));
  } catch (err) {
    console.log("error found in cron jobs : ", err);
  }
});
