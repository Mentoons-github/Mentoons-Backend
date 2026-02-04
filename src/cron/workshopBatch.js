const cron = require("node-cron");
const {
  completeExpiredBatches,
} = require("../services/workshop/workshop.service");

const startBatchCron = () => {
  cron.schedule("5 0 * * *", async () => {
    try {
      console.log("🕛 Running batch completion cron...");
      await completeExpiredBatches();
    } catch (error) {
      console.error("❌ Batch cron failed:", error.message);
    }
  });
};

module.exports = startBatchCron;
