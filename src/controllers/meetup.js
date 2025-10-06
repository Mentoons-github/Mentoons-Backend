const Meetup = require("../models/adda/meetup");
const asyncHandler = require("../utils/asyncHandler");

const addMeetup = asyncHandler(async (req, res) => {
  let {
    title,
    dateTime,
    duration,
    maxCapacity,
    platform,
    meetingLink,
    place,
    description,
    detailedDescription,
    speakerName,
    speakerImage,
    speakerImageUrl,
    topics,
    tags,
    isOnline,
  } = req.body;

  if (dateTime) {
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date or time provided",
      });
    }
  }

  if (typeof topics === "string") {
    topics = topics
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  if (typeof tags === "string") {
    tags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  const existingMeetup = await Meetup.findOne({
    speakerName,
    dateTime,
  });

  if (existingMeetup) {
    return res.status(409).json({
      success: false,
      message:
        "A meetup with the same speaker is already scheduled at this time.",
    });
  }

  const meetup = new Meetup({
    title,
    dateTime,
    duration,
    maxCapacity,
    platform,
    meetingLink,
    place,
    description,
    detailedDescription,
    speakerName,
    speakerImage: speakerImageUrl || speakerImage || null,
    topics,
    tags,
    isOnline,
  });

  await meetup.save();

  return res.status(201).json({
    success: true,
    message: "Meetup created successfully",
    data: meetup,
  });
});

const allMeetups = asyncHandler(async (req, res) => {
  let {
    page = 1,
    limit = 10,
    sort = "-createdAt",
    search = "",
    platform,
    isOnline,
  } = req.query;

  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  const query = {};

  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  if (platform) {
    query.platform = platform;
  }

  if (isOnline !== undefined) {
    query.isOnline = isOnline === "true";
  }

  const total = await Meetup.countDocuments(query);

  const meetups = await Meetup.find(query)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  return res.status(200).json({
    message: "Meetups fetched successfully",
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
    data: meetups,
  });
});

const fetchMeetupById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(id);

  if (id.trim() === "" || id === "") {
    return res.status(400).json({
      success: false,
      message: "Meetup ID is required",
    });
  }

  const meetup = await Meetup.findById(id);

  return res.status(200).json({
    success: true,
    data: meetup,
    message: "Meetup fetched successfully",
  });
});

const editMeetup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let {
    title,
    dateTime,
    duration,
    maxCapacity,
    platform,
    meetingLink,
    place,
    description,
    detailedDescription,
    speakerName,
    speakerImage,
    speakerImageUrl,
    topics,
    tags,
    isOnline,
  } = req.body;

  console.log("req body ===================>", req.body);

  if (!id || id.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Meetup ID is required",
    });
  }

  console.log(maxCapacity);

  const meetup = await Meetup.findById(id);
  if (!meetup) {
    return res.status(404).json({
      success: false,
      message: "Meetup not found",
    });
  }

  if (dateTime) {
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date or time provided",
      });
    }
    meetup.dateTime = date;
  }

  if (typeof topics === "string") {
    topics = topics
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  if (typeof tags === "string") {
    tags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  meetup.title = title ?? meetup.title;
  meetup.duration = duration ?? meetup.duration;
  meetup.maxCapacity = maxCapacity ?? meetup.maxCapacity;
  meetup.platform = platform ?? meetup.platform;
  meetup.meetingLink = meetingLink ?? meetup.meetingLink;
  meetup.place = place ?? meetup.place;
  meetup.description = description ?? meetup.description;
  meetup.detailedDescription =
    detailedDescription ?? meetup.detailedDescription;
  meetup.speakerName = speakerName ?? meetup.speakerName;
  meetup.speakerImage = speakerImageUrl || speakerImage || meetup.speakerImage;
  meetup.topics = topics ?? meetup.topics;
  meetup.tags = tags ?? meetup.tags;
  meetup.isOnline = isOnline !== undefined ? isOnline : meetup.isOnline;

  await meetup.save();

  return res.status(200).json({
    success: true,
    message: "Meetup updated successfully",
    data: meetup,
  });
});

const deleteMeetupImage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || id.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Meetup ID is required",
    });
  }

  const meetup = await Meetup.findById(id);
  if (!meetup) {
    return res.status(404).json({
      success: false,
      message: "Meetup not found",
    });
  }

  meetup.speakerImage = null;

  await meetup.save();

  return res.status(200).json({
    success: true,
    message: "Meetup image deleted successfully",
    data: meetup,
  });
});

module.exports = {
  addMeetup,
  allMeetups,
  fetchMeetupById,
  editMeetup,
  deleteMeetupImage,
};
