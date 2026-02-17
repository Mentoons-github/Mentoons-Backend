const Batch = require("../../models/workshop/workshopBatch");
const Employee = require("../../models/employee/employee");
const getNextWorkshopStartDate = require("../../utils/workshop/batch");

const assignBatchToUser = async (plan, userId) => {
  let batch = await Batch.findOne({
    workshopId: plan._id,
    $expr: { $lt: [{ $size: "$students" }, 10] },
    status: "draft",
  }).sort({ startDate: 1 });

  if (!batch || !batch.psychologist) {
    const psychologists = await Employee.aggregate([
      { $match: { department: "psychologist" } },
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "assignedTo",
          as: "tasks",
        },
      },
      { $addFields: { taskCount: { $size: "$tasks" } } },
      { $match: { taskCount: { $lt: 10 } } },
    ]);

    // if (!psychologists.length) throw new Error("NO_PSYCHOLOGIST_AVAILABLE");

    if (!batch) {
      return Batch.create({
        workshopId: plan._id,
        title: `Workshop Batch - ${plan.name}`,
        // psychologist: psychologists[0]._id,
        students: [userId],
        maxStudents: 10,
        status: "draft",
        startDate: getNextWorkshopStartDate(),
      });
    }

    // batch.psychologist = psychologists[0]._id;
  }

  await Batch.updateOne(
    { _id: batch._id, $expr: { $lt: [{ $size: "$students" }, 10] } },
    { $addToSet: { students: userId } },
  );

  return batch;
};

module.exports = assignBatchToUser;
