const { default: mongoose } = require("mongoose");
const Employee = require("../../models/employee/employee");
const workshopBatch = require("../../models/workshop/workshopBatch");
const WorkshopStudents = require("../../models/workshop/WorkshopStudents");
const {
  autoUpdateWorkshopStatus,
  isPreviousSessionCompleted,
  updateWorkshopCurrentSession,
} = require("../../utils/workshop/autoUpdateWorkshopStatus");
const plan = require("../../models/workshop/plan");

const durationToMonths = (duration) => {
  const map = {
    "1 month": 1,
    "3 months": 3,
    "6 months": 6,
    "12 months": 12,
  };

  return map[duration.toLowerCase()] ?? 0;
};

module.exports = {
  //get all batches
  getAllWorkshopBatchesHelper: async ({
    search,
    sort,
    filter,
    page,
    limit,
  }) => {
    const query = {};

    page = Number(page) || 1;
    limit = Number(limit) || 10;

    const skip = (page - 1) * limit;
    let planIds = [];

    if (search) {
      const plans = await plan
        .find({
          $or: [
            { name: { $regex: search, $options: "i" } },
            { duration: { $regex: search, $options: "i" } },
          ],
        })
        .select("_id");

      planIds = plans.map((p) => p._id);
    }
    if (filter) {
      query.status = filter;
    }

    let sortOption = { createdAt: -1 };
    if (sort === "newest") sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "name_asc") sortOption = { title: 1 };
    if (sort === "name_desc") sortOption = { title: -1 };

    if (search) {
      const searchConditions = [{ title: { $regex: search, $options: "i" } }];

      // Only search status if no filter
      if (!filter) {
        searchConditions.push({ status: { $regex: search, $options: "i" } });
      }

      if (planIds.length > 0) {
        searchConditions.push({
          workshopId: {
            $in: planIds,
          },
        });
      }

      query.$or = searchConditions;
    }

    const total = await workshopBatch.countDocuments(query);
    const batches = await workshopBatch
      .find(query)
      .populate([
        {
          path: "workshopId",
        },
        {
          path: "students",
        },
      ])
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    await Promise.all(batches.map((w) => autoUpdateWorkshopStatus(w)));
    return {
      data: batches,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    };
  },

  // get single workshop batch
  getSingleWorkshopBatchHelper: async (workshopBatchId) => {
    const batch = await workshopBatch.findById(workshopBatchId).populate([
      {
        path: "workshopId",
      },
      {
        path: "students",
        populate: {
          path: "scoring.sessions.psychologist",
          model: "Employees",
          select: "user",
          populate: {
            path: "user",
            model: "User",
            select: "name email",
          },
        },
      },
    ]);

    if (!batch) throw new Error("No Workshop Batch found");

    await autoUpdateWorkshopStatus(batch);

    return batch;
  },

  //assign workshop batches
  assignWorkshopBatch: async (workshopBatchId, psychologistId, startDate) => {
    const batch = await workshopBatch
      .findById(workshopBatchId)
      .populate("workshopId", "duration");

    if (!batch) throw new Error("Workshop batch not found");

    const duration = batch.workshopId.duration;

    const months = durationToMonths(duration);

    if (!months) throw new Error("Invalid workshop duration");

    const start = new Date(startDate);
    const endDate = new Date(start);
    endDate.setMonth(endDate.getMonth() + months);

    const updated = await workshopBatch
      .findByIdAndUpdate(
        workshopBatchId,
        {
          psychologist: psychologistId,
          startDate,
          endDate,
          status: "upcoming",
        },
        { new: true },
      )
      .populate([
        {
          path: "workshopId",
        },
        {
          path: "students",
        },
      ]);
    return updated;
  },

  //get batches by psychologist

  getWorkshopBatchesByPsychologist: async (
    userId,
    search,
    sort,
    filter,
    page,
    limit,
  ) => {
    page = Number(page) || 1;
    limit = Number(limit) || 10;

    const skip = (page - 1) * limit;

    const employee = await Employee.findOne({ user: userId });
    if (!employee) {
      throw new Error("Employee not found");
    }

    let planIds = [];

    if (search) {
      const plans = await plan
        .find({
          $or: [
            { name: { $regex: search, $options: "i" } },
            { duration: { $regex: search, $options: "i" } },
          ],
        })
        .select("_id");

      planIds = plans.map((p) => p._id);
    }

    const query = {
      psychologist: employee._id,
    };

    if (filter) {
      query.status = filter;
    }

    if (search) {
      const searchConditions = [{ title: { $regex: search, $options: "i" } }];

      // Only search status if no filter
      if (!filter) {
        searchConditions.push({ status: { $regex: search, $options: "i" } });
      }

      if (planIds.length > 0) {
        searchConditions.push({
          workshopId: {
            $in: planIds,
          },
        });
      }

      query.$or = searchConditions;
    }

    let sortOption = { createdAt: -1 };
    if (sort === "newest") sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "name_asc") sortOption = { title: 1 };
    if (sort === "name_desc") sortOption = { title: -1 };

    const total = await workshopBatch.countDocuments(query);

    const data = await workshopBatch
      .find(query)
      .populate("workshopId")
      .populate("students")
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    await Promise.all(data.map((w) => autoUpdateWorkshopStatus(w)));

    return {
      data,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    };
  },

  // add workshop scoring
  addWorkshopScoringHelper: async (studentId, userId, sessionScore) => {
    const employee = await Employee.findOne({ user: userId });
    if (!employee) {
      throw new Error("Employee not found");
    }
    const student = await WorkshopStudents.findById(studentId);
    if (!student) throw new Error("Student not found");

    const alreadyScored = student.scoring.sessions.some(
      (s) => s.sessionNumber === sessionScore.sessionNumber,
    );

    if (alreadyScored) {
      throw new Error("This session is already scored for this student");
    }

    sessionScore.psychologist = employee._id;

    student.scoring.completedSessions += 1;
    student.scoring.sessions.push(sessionScore);

    await student.save();

    const populatedStudent = await WorkshopStudents.findById(
      student._id,
    ).populate([
      {
        path: "scoring.sessions.psychologist",
        model: "Employees",
        select: "user",
        populate: {
          path: "user",
          model: "User",
          select: "name email",
        },
      },
    ]);

    await updateWorkshopCurrentSession(student.workshopBatch);

    return populatedStudent;
  },

  updateWorkshopScoringHelper: async (
    studentId,
    sessionId,
    userId,
    sessionScore,
  ) => {
    const employee = await Employee.findOne({ user: userId });
    if (!employee) {
      throw new Error("Employee not found");
    }

    const updatedStudent = await WorkshopStudents.findOneAndUpdate(
      { _id: studentId },
      {
        $set: {
          "scoring.sessions.$[session].sessionName": sessionScore.sessionName,
          "scoring.sessions.$[session].scors": sessionScore.scors,
          "scoring.sessions.$[session].sessionDate": new Date(),
        },
      },
      {
        arrayFilters: [
          {
            "session._id": sessionId,
            "session.psychologist": employee._id,
          },
        ],
        new: true,
      },
    ).populate([
      {
        path: "scoring.sessions.psychologist",
        model: "Employees",
        select: "user",
        populate: {
          path: "user",
          model: "User",
          select: "name email",
        },
      },
    ]);

    return updatedStudent;
  },
};
