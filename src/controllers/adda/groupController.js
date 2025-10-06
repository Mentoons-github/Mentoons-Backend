const Group = require("../../models/adda/groups");
const asyncHandler = require("../../utils/asyncHandler");

const fetchGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find().populate(
    "members",
    "_id name profileImage"
  );

  if (!groups || groups.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No groups found",
    });
  }

  return res.status(200).json({
    success: true,
    data: groups,
    message: "Groups fetched successfully",
  });
});

const fetchGroupById = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  console.log(groupId);

  if (!groupId) {
    return res.status(404).json({
      success: false,
      message: "GroupId is empty",
    });
  }

  const group = await Group.findById(groupId);

  return res.status(200).json({
    success: true,
    data: group,
    message: "Group fetched successfully",
  });
});

const fetchMembers = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  const group = await Group.findById(groupId, { members: 1 }).populate(
    "members",
    "name profileImage"
  );

  if (!group || group.members.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No members found",
    });
  }

  return res.status(200).json({
    success: true,
    data: group.members,
    message: "Members fetched successfully",
  });
});

const fetchGroupMessages = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  const group = await Group.findById(groupId, { messages: 1 }).populate(
    "messages.sender",
    "name profileImage"
  );

  if (!group) {
    return res.status(404).json({
      success: false,
      message: "Group not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: group.message,
    message: "Messages fetched successfully",
  });
});

const createPoll = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    options,
    createdBy,
    expiresAt,
    category,
    isAnonymous,
    allowMultipleVotes,
    viewResults,
  } = req.body;

  if (!title || title.trim().length < 3) {
    return res.status(400).json({
      message: "Title is required and must be at least 3 characters long",
    });
  }

  if (!description || description.trim().length < 10) {
    return res.status(400).json({
      message:
        "Description is required and must be at least 10 characters long",
    });
  }

  if (!options || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ message: "At least 2 options are required" });
  }

  for (const option of options) {
    if (!option.text || option.text.trim().length === 0) {
      return res
        .status(400)
        .json({ message: "Each option must have a text value" });
    }
  }

  if (!createdBy) {
    return res.status(400).json({ message: "CreatedBy is required" });
  }

  if (!expiresAt || isNaN(Date.parse(expiresAt))) {
    return res
      .status(400)
      .json({ message: "A valid expiresAt date is required" });
  }

  if (new Date(expiresAt) <= new Date()) {
    return res
      .status(400)
      .json({ message: "Expiration date must be in the future" });
  }

  if (viewResults && !["immediately", "afterEnd"].includes(viewResults)) {
    return res
      .status(400)
      .json({ message: "viewResults must be 'immediately' or 'afterEnd'" });
  }

  const { groupId } = req.params;

  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json({ message: "Group not found" });
  }

  group.polls.push({
    title,
    description,
    options,
    createdBy,
    expiresAt,
    category,
    isAnonymous,
    allowMultipleVotes,
    viewResults,
  });

  await group.save();

  res.status(201).json({
    message: "Poll created successfully",
    poll: group.polls[group.polls.length - 1],
  });
});

const votePoll = asyncHandler(async (req, res) => {
  const { groupId, pollId, optionIndex } = req.params;
  const { voterId } = req.body;

  if (!voterId) {
    return res.status(400).json({ message: "Voter ID is required" });
  }

  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json({ message: "Group not found" });
  }

  const poll = group.polls.id(pollId);
  if (!poll) {
    return res.status(404).json({ message: "Poll not found" });
  }

  if (!poll.allowMultipleVotes) {
    const alreadyVoted = poll.options.some((opt) =>
      opt.voters.includes(voterId)
    );
    if (alreadyVoted) {
      return res.status(400).json({ message: "You have already voted" });
    }
  }

  if (!poll.options[optionIndex]) {
    return res.status(400).json({ message: "Invalid option index" });
  }

  poll.options[optionIndex].votes += 1;
  poll.options[optionIndex].voters.push(voterId);

  await group.save();

  res.status(200).json({
    message: "Vote recorded successfully",
    poll,
  });
});

const fetchPolls = asyncHandler(async (req, res) => {
  const groupId = req.params;

  const groups = await Group.findById(groupId, { polls: -1 });

  if (!groups && groups.length === 0) {
    return res.status(400).json({
      message: "No Polls found",
    });
  }

  const activePolls = groups.polls.filter(
    (poll) => poll.expiresAt > new Date() && poll.isActive === true
  );

  return res.status(200).json({
    success: true,
    data: activePolls,
    message: " Polls fetched successfully",
  });
});

const closePoll = asyncHandler(async (req, res) => {
  const { groupId, pollId } = req.params;

  const group = await Group.findById(groupId);
  if (!group) return res.status(404).json({ message: "Group not found" });

  const poll = group.polls.id(pollId);
  if (!poll) return res.status(404).json({ message: "Poll not found" });

  poll.isActive = false;

  await group.save();
  res.status(200).json({ message: "Poll closed successfully", poll });
});

module.exports = {
  fetchGroups,
  fetchMembers,
  fetchGroupMessages,
  fetchGroupById,
  fetchPolls,
  createPoll,
  votePoll,
  closePoll,
};
