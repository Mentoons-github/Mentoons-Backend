const { createNotification } = require("../../helpers/adda/createNotification");
const FriendRequest = require("../../models/adda/friendRequest");
const GroupMessage = require("../../models/adda/GroupMessageSchema");
const Group = require("../../models/adda/groups");
const User = require("../../models/user");
const asyncHandler = require("../../utils/asyncHandler");

const fetchGroups = asyncHandler(async (req, res) => {
  const { dbUser, role } = req.user;
  const userId = dbUser._id;
  const { search } = req.query;

  const searchFilter = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { "details.subTitle": { $regex: search, $options: "i" } },
          { "details.description": { $regex: search, $options: "i" } },
        ],
      }
    : {};

  let joinedGroups = [];
  let suggestedGroups = [];
  let allGroups = [];

  if (role?.toLowerCase() === "admin") {
    allGroups = await Group.find(searchFilter)
      .sort({ createdAt: -1 })
      .populate("members", "_id name picture");

    joinedGroups = await Group.find({
      members: userId,
      ...searchFilter,
    })
      .sort({ createdAt: -1 })
      .populate("members", "_id name picture");

    suggestedGroups = await Group.find({
      members: { $ne: userId },
      groupCreationStatus: "approved",
      ...searchFilter,
    })
      .sort({ createdAt: -1 })
      .populate("members", "_id name picture");
  } else {
    joinedGroups = await Group.find({
      members: userId,
      ...searchFilter,
    })
      .sort({ createdAt: -1 })
      .populate("members", "_id name picture");

    suggestedGroups = await Group.find({
      members: { $ne: userId },
      groupCreationStatus: "approved",
      ...searchFilter,
    })
      .sort({ createdAt: -1 })
      .populate("members", "_id name picture");
  }

  return res.status(200).json({
    success: true,
    data: {
      joinedGroups,
      suggestedGroups,
      allGroups,
    },
    message:
      role?.toLowerCase() === "admin"
        ? "All groups fetched successfully (Admin)"
        : "Groups fetched successfully",
  });
});

const fetchGroupById = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  if (!groupId) {
    return res.status(404).json({
      success: false,
      message: "GroupId is empty",
    });
  }

  const group = await Group.findById(groupId)
    .populate({
      path: "polls.createdBy",
      select: "name picture _id",
    })
    .populate({
      path: "members",
      select: "name picture _id",
    });

  return res.status(200).json({
    success: true,
    data: group,
    message: "Group fetched successfully",
  });
});

const fetchMembers = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const currentUserID = req.user;

  const group = await Group.findById(groupId, { members: 1 }).populate(
    "members",
    "name picture _id",
  );
  if (!group || group.members.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No members found",
    });
  }

  const members = group.members;

  const requests = await Promise.all(
    members.map(async (member) => {
      const sentRequest = await FriendRequest.findOne({
        senderId: currentUserID,
        receiverId: member._id,
      });

      const receivedRequest = await FriendRequest.findOne({
        senderId: member._id,
        receiverId: currentUserID,
      });

      return {
        id: member._id,
        sentRequest,
        receivedRequest,
      };
    }),
  );

  return res.status(200).json({
    success: true,
    data: members,
    friendRequests: requests,
    message: "Members fetched successfully",
  });
});

const fetchGroupMessages = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  const messages = await GroupMessage.find({ groupId })
    .populate("senderId", "name picture")
    .sort({ createdAt: 1 });

  return res.status(200).json({
    success: true,
    data: messages,
    message: "Messages fetched successfully",
  });
});

//join groups
const joinGroups = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user;

  if (!groupId) {
    return res.status(400).json({
      success: false,
      message: "GroupId is required",
    });
  }

  const group = await Group.findByIdAndUpdate(
    groupId,
    { $addToSet: { members: userId } },
    { new: true },
  ).populate("members", "name picture");

  if (!group) {
    return res.status(404).json({
      success: false,
      message: "Group not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: group,
    message: "Successfully joined to the group ",
  });
});

const validPrivacy = ["public", "private"];

const createCommunityGroups = asyncHandler(async (req, res) => {
  const { groupName, description, image, parentGroup, tags, privacy } =
    req.body.data;

  const { role, dbUser: user, firstName } = req.user;

  const normalize = (str) => str.toLowerCase().replace(/\s+/g, "").trim();
  const errors = {};

  const validParentGroup = [
    "technology",
    "sports",
    "arts&culture",
    "education",
    "business",
    "health&wellness",
  ];

  if (!groupName || groupName.trim() === "")
    errors.groupName = "Please enter a valid groupName";

  if (!description || description.trim() === "")
    errors.description = "Please enter description";

  if (!image) errors.image = "No image found";

  if (!parentGroup || !validParentGroup.includes(normalize(parentGroup)))
    errors.parentGroup = "Please select a valid parent group";

  // if (!tags || !Array.isArray(tags) || tags.length === 0) {
  //   errors.tags = "Please provide at least one tag";
  // } else {
  //   const invalidTags = tags.filter((tag) => !tag || tag.trim() === "");

  //   if (invalidTags.length > 0) {
  //     errors.tags = "Tags cannot be empty";
  //   }

  //   if (tags.length > 10) {
  //     errors.tags = "Maximum 10 tags allowed";
  //   }
  // }

  if (!privacy || !validPrivacy.includes(privacy.toLowerCase())) {
    errors.privacy = "Privacy must be either 'public' or 'private'";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  const formattedRole = role
    ? role.toLowerCase() === "admin"
      ? "Admin"
      : "User"
    : "User";

  const group = await Group.create({
    createdBy: user._id,
    createdByRole: formattedRole,
    profileImage: image,
    name: groupName,
    category: parentGroup,
    details: {
      subTitle: groupName,
      description,
    },
    members: formattedRole === "User" ? [user._id] : [],
    groupCreationStatus: formattedRole === "Admin" ? "approved" : "pending",
  });

  if (formattedRole !== " Admin") {
    const admins = await User.find({ role: "ADMIN" });
    const message = `${firstName} has asked permission to create their own community`;
    for (let admin of admins) {
      await createNotification(
        admin._id,
        "community_creation",
        message,
        user._id,
        group._id,
        "Group",
      );
    }
  }

  return res.status(200).json({
    message:
      formattedRole === "Admin"
        ? "Community group created successfully"
        : "Community group created, waiting for admin approval",
  });
});

const editCommunity = asyncHandler(async (req, res) => {
  const body = req.body;
  const { id } = req.params;

  const updateData = {
    name: body.groupName,
    category: body.parentGroup,
    visibility: body.privacy,
    profileImage: body.image,
    "details.subTitle": body.subTitle,
    "details.description": body.description,
  };

  const group = await Group.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!group) {
    return res.status(404).json({ message: "Group not found" });
  }

  return res.status(200).json({
    message: "Group updated successfully",
    group,
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

  console.log(createdBy);

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

  const user = await User.findOne({ clerkId: createdBy });

  if (!user) {
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
    createdBy: user._id,
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
  const { groupId, pollId } = req.params;
  const { voterId, optionId } = req.body;

  if (!voterId) {
    return res.status(400).json({ message: "Voter ID is required" });
  }

  const result = await Group.updateOne(
    {
      _id: groupId,
      "polls._id": pollId,
      "polls.options._id": optionId,
      "polls.options.voters": { $ne: voterId },
    },
    {
      $inc: {
        "polls.$[poll].options.$[opt].votes": 1,
      },
      $addToSet: {
        "polls.$[poll].options.$[opt].voters": voterId,
      },
    },
    {
      arrayFilters: [{ "poll._id": pollId }, { "opt._id": optionId }],
    },
  );

  if (result.modifiedCount === 0) {
    return res.status(400).json({
      message: "Already voted or invalid data",
    });
  }

  const updatedGroup = await Group.findById(groupId);
  const updatedPoll = updatedGroup.polls.id(pollId);

  res.status(200).json({
    message: "Vote recorded successfully",
    poll: Array.isArray(updatedPoll) ? updatedPoll : [updatedPoll],
  });
});

const fetchPolls = asyncHandler(async (req, res) => {
  const groupId = req.params;

  const groups = await Group.findById(groupId).populate(
    "polls.createdBy",
    "name email picture",
  );

  console.log("group data :", groups);

  if (!groups && groups.length === 0) {
    return res.status(400).json({
      message: "No Polls found",
    });
  }

  const activePolls = groups.polls.filter(
    (poll) => poll.expiresAt > new Date() && poll.isActive === true,
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

const approveGroup = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { groupId } = req.params;

  const group = await Group.findByIdAndUpdate(
    groupId,
    { groupCreationStatus: "approved" },
    { new: true },
  );

  const message = "Your group creation request has been approved by the admin.";
  await createNotification(
    group.createdBy,
    "community_creation_reject",
    message,
    _id,
    group._id,
    "Group",
  );

  if (!group) {
    return res.status(404).json({
      success: false,
      message: "Group not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Group approved successfully",
    data: group,
  });
});

const rejectGroup = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { groupId } = req.params;

  const group = await Group.findByIdAndDelete(groupId);

  const message = "Your group creation request has been rejected by the admin.";
  await createNotification(
    group.createdBy,
    "community_creation_reject",
    message,
    _id,
    group._id,
    "Group",
  );

  if (!group) {
    return res.status(404).json({
      success: false,
      message: "Group not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Group rejected successfully",
  });
});

const deleteGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  const group = await Group.findByIdAndDelete(groupId);

  if (!group) {
    return res.status(404).json({
      success: false,
      message: "Group not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Group deleted successfully",
  });
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
  joinGroups,
  createCommunityGroups,
  approveGroup,
  rejectGroup,
  deleteGroup,
  editCommunity,
};
