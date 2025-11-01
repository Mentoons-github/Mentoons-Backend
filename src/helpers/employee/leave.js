const markLeaveInAttendance = async (employeeId, fromDate, toDate) => {
  try {
    const start = new Date(fromDate);
    const end = new Date(toDate);

    for (
      let day = new Date(start);
      day <= end;
      day.setDate(day.getDate() + 1)
    ) {
      const existing = await Attendance.findOne({
        employeeId,
        date: {
          $gte: new Date(day.setHours(0, 0, 0, 0)),
          $lt: new Date(day.setHours(23, 59, 59, 999)),
        },
      });

      if (existing) {
        existing.status = "onLeave";
        await existing.save();
      } else {
        await Attendance.create({
          employeeId,
          date: new Date(day),
          status: "onLeave",
        });
      }
    }

    console.log(
      `✅ Attendance updated for leave days (${fromDate} → ${toDate})`
    );
  } catch (err) {
    console.error("❌ Error updating attendance for leave:", err.message);
  }
};

module.exports = markLeaveInAttendance;
