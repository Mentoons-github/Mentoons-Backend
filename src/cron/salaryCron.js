const cron = require("node-cron");
const calculateSalary = require("../utils/employee/calculateSalary");
const Employee = require("../models/employee/employee");

cron.schedule("30 18 * * *", async () => {
  try {
    const today = new Date();
    const employees = await Employee.find({
      active: true,
      joinDate: { $exists: true },
    });

    for (const emp of employees) {
      if (emp.exitDate && emp.exitDate < today) continue;

      await calculateSalary(emp._id, today);
      console.log(
        `Daily salary updated for ${
          emp._id
        } on ${today.toDateString()} at 6:30 PM`
      );
    }
  } catch (error) {
    console.error("Salary cron error:", error);
  }
});
