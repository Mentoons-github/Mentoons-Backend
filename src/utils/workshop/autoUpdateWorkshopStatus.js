const workshopBatch = require("../../models/workshop/workshopBatch");

const autoUpdateWorkshopStatus = async (workshop) => {
  const now = new Date();
  let isUpdated = false;

  if (
    workshop.status === "upcoming" &&
    workshop.startDate &&
    new Date(workshop.startDate) <= now
  ) {
    workshop.status = "ongoing";
    workshop.currentSession = 1;
    isUpdated = true;
  }

  if (isUpdated) {
    await workshop.save();
  }
  return workshop;
};

const isPreviousSessionCompleted = (students, currentSession) => {
  if (currentSession <= 0) return true;

  return students.every((student) => {
    const prevSession = student.scoring.sessions.find(
      (s) => s.sessionNumber === currentSession,
    );

    return !!prevSession?.scors?.totalScore;
  });
};

const updateWorkshopCurrentSession = async (workshopBatchId) => {
  const workshop = await workshopBatch
    .findById(workshopBatchId)
    .populate("students");

  if (!workshop) return;

  const currentSession = workshop.currentSession || 1;

  const canMove = isPreviousSessionCompleted(workshop.students, currentSession);

  if (!canMove) return;

  workshop.currentSession += 1;

  if (workshop.currentSession > workshop.workshopId.totalSession) {
    workshop.isCompleted = true;
    workshop.status = "completed";
  }

  await workshop.save();
};

module.exports = {
  autoUpdateWorkshopStatus,
  updateWorkshopCurrentSession,
};
