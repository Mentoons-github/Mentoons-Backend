const cron = require("node-cron");
const { assignDailyTasksToAllEmployees } = require("../controllers/employee/task");

const startDailyTaskCron = () => {
  cron.schedule(
    "0 8 * * 1-5",
    async () => {
      await assignDailyTasksToAllEmployees();
    },
    {
      timezone: "Asia/Kolkata",
    },
  );

  console.log("📆 Daily task cron job scheduled — runs Mon–Fri at 8:00 AM IST");
};

module.exports = {
  startDailyTaskCron,
};
