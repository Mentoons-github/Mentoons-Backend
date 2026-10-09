const moment = require("moment");
const SessionModel = require("../../models/session");
const Employee = require("../../models/employee");

const SLOT_START_HOUR = 10;
const SLOT_END_HOUR = 18;
const DURATION_MINUTES = {
  "30 Minutes": 30,
  "1 Hour": 60,
};

const generateDaySlots = (duration) => {
  const minutes = DURATION_MINUTES[duration] || 60;
  const slots = [];
  const startTotal = SLOT_START_HOUR * 60;
  const endTotal = SLOT_END_HOUR * 60;

  for (let t = startTotal; t + minutes <= endTotal; t += minutes) {
    const hh = String(Math.floor(t / 60)).padStart(2, "0");
    const mm = String(t % 60).padStart(2, "0");
    slots.push(`${hh}:${mm}`);
  }

  return slots;
};

const isPsychologistAvailable = async ({
  psychologistId,
  date,
  time,
  duration,
  excludeSessionId,
}) => {
  const minutes = DURATION_MINUTES[duration] || 60;
  const sessionDate = new Date(date);
  const slotStart = moment(`${date} ${time}`, "YYYY-MM-DD HH:mm");
  const slotEnd = slotStart.clone().add(minutes, "minutes");

  const existingSessions = await SessionModel.find({
    psychologistId,
    date: sessionDate,
    status: { $in: ["booked", "pending"] },
    ...(excludeSessionId ? { _id: { $ne: excludeSessionId } } : {}),
  });

  const overlaps = existingSessions.some((session) => {
    const existingStart = moment(`${date} ${session.time}`, "YYYY-MM-DD HH:mm");
    const existingDuration = DURATION_MINUTES[session.duration] || 60;
    const existingEnd = existingStart.clone().add(existingDuration, "minutes");
    return slotStart.isBefore(existingEnd) && existingStart.isBefore(slotEnd);
  });

  return !overlaps;
};

const findAvailablePsychologistForSlot = async ({
  date,
  time,
  duration,
  state,
  excludeSessionId,
}) => {
  const query = { role: "psychologist", isActive: true };
  if (state) query["place.state"] = state;

  const psychologists = await Employee.find(query);

  for (const psychologist of psychologists) {
    const available = await isPsychologistAvailable({
      psychologistId: psychologist._id,
      date,
      time,
      duration,
      excludeSessionId,
    });
    if (available) return psychologist;
  }

  return null;
};

const getPsychologists = async (req, res) => {
  try {
    const psychologists = await Employee.find({
      role: "psychologist",
      isActive: true,
    }).select("name email phone department place profilePicture");

    return res.status(200).json({
      success: true,
      psychologists,
    });
  } catch (error) {
    console.error("Error fetching psychologists:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch psychologists",
    });
  }
};

const getAvailableSlots = async (req, res) => {
  try {
    const { date, duration, psychologistId, state } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    const sessionDuration = duration === "30 Minutes" ? "30 Minutes" : "1 Hour";
    const daySlots = generateDaySlots(sessionDuration);

    const slots = await Promise.all(
      daySlots.map(async (time) => {
        let available;

        if (psychologistId) {
          available = await isPsychologistAvailable({
            psychologistId,
            date,
            time,
            duration: sessionDuration,
          });
        } else {
          const anyAvailable = await findAvailablePsychologistForSlot({
            date,
            time,
            duration: sessionDuration,
            state,
          });
          available = Boolean(anyAvailable);
        }

        return { time, available };
      }),
    );

    return res.status(200).json({
      success: true,
      slots,
    });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch available slots",
    });
  }
};


module.exports = {
  SLOT_START_HOUR,
  SLOT_END_HOUR,
  DURATION_MINUTES,
  generateDaySlots,
  isPsychologistAvailable,
  findAvailablePsychologistForSlot,
  getPsychologists,
  getAvailableSlots,
};
