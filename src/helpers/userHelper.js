const User = require("../models/user");

module.exports = {
  createUser: async (data) => {
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
      email: email_addresses[0]?.email_address | "",
      phoneNumber: phone_numbers[0]?.phone_number,
      picture: image_url,
    });
    await newUser.save();
    return newUser;
  },
  updateUser: async (data) => {
    const {
      id,
      email_addresses,
      image_url,
      first_name,
      last_name,
      phone_number,
    } = data;
    console.log(id);
    const updatedUser = await User.findOneAndUpdate(
      { clerkId: id },
      {
        name: `${first_name}${last_name ? ` ${last_name}` : ""}`,
        phoneNumber: phone_number,
        email: email_addresses[0].email_address,
        picture: image_url,
      },
      {
        new: true,
      }
    );
    return updatedUser;
  },
  deleteUser: async (data) => {
    const { id } = data;

    console.log(id);

    const deletedUser = await User.findByIdAndDelete({ clerkId: id });

    if (!deletedUser) {
      throw new Error("User not found");
    }

    return deletedUser;
  },
};
