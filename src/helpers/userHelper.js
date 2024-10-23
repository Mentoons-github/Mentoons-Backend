const { default: mongoose } = require("mongoose");
const User = require("../models/user");

module.exports = {
  createUser: async (data) => {
    console.log("userCreated", data);
    const {
      id,
      email_addresses,
      image_url,
      phone_numbers,
      first_name,
      last_name,
    } = data;
    console.log(id);

    const newUser = await User.create({
      clerkId: id,
      name: `${first_name}${last_name ? ` ${last_name}` : ""}`,
      email: email_addresses[0]?.email_address,
      phoneNumber: phone_numbers[0]?.phone_number,
      picture: image_url,
    });
    await newUser.save();
    return newUser;
  },
  updateUser: async (data) => {
    console.log("updated user", data);
    const {
      id,
      email_addresses,
      image_url,
      first_name,
      last_name,
      phone_numbers,
    } = data;
    console.log(id);
    const updatedUser = await User.findOneAndUpdate(
      { clerkId: id.toString() },
      {
        name: `${first_name}${last_name ? ` ${last_name}` : ""}`,
        phoneNumber: phone_numbers[0]?.phone_number,
        email: email_addresses[0]?.email_address,
        picture: image_url,
      },
      {
        new: true,
      }
    );
    console.log("updatedUser", updatedUser);
    return updatedUser;
  },
  deleteUser: async (data) => {
    console.log("deleted User", data);
    const { id } = data;

    console.log(id);

    const deletedUser = await User.findOneAndDelete({
      clerkId: id.toString(),
    });

    if (!deletedUser) {
      throw new Error("User not found");
    }

    console.log("deletedUser", deletedUser);

    return deletedUser;
  },
  changeRole: async (superAdminUserId, userId, role) => {
    const superAdminUser = await User.findOne({
      _id: superAdminUserId,
      role: "super-admin",
    });
    if (!superAdminUser) {
      throw new Error("Unauthorize");
    }

    const user = await User.findOne({ _id: userId });

    if (!user) {
      throw new Error("User not found");
    }

    const modifiedUser = await User.findOneAndUpdate(
      { _id: userId },
      { ...user, role: role },
      { new: true }
    );
    console.log("Modified User", modifiedUser)
    return modifiedUser;
  },

  getAllUser: async ({ search, sortField, sortOrder, page = 1, limit = 10 }) => {
    try {
      const skip = (page - 1) * limit;
      const searchRegex = new RegExp(search, 'i');
      
      const allUsers = await User.aggregate([
        { $match: { $or: [{ name: { $regex: searchRegex } }, { email: { $regex: searchRegex } }] } },
        {
          $project: {
            _id: 1,
            clerkId: 1,
            role: 1,
            name: 1,
            email: 1,
            phoneNumber: 1,
            picture: 1
          }
        },
        { $sort: { [sortField]: sortOrder === 'asc' ? 1 : -1 } },
        { $skip: skip },
        { $limit: Number(limit) }
      ]);

      const totalCount = await User.countDocuments({
        $or: [
          { name: { $regex: searchRegex } },
          { email: { $regex: searchRegex } }
        ]
      });

      return {
        users: allUsers,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      };
    } catch (error) {
      console.error(error);
      throw new Error('Error fetching users from database');
    }
  },

  getUser: async (userId) => {
    const [user] = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      {
        $project: {
          _id: 1,
          clerkId: 1,
          role: 1,
          name: 1,
          email: 1,
          phoneNumber: 1,
          picture: 1
        }
      }
    ]);
    return user;
  },
};
