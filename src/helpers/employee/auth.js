const { default: clerkClient } = require("@clerk/clerk-sdk-node");

module.exports = {
  loginEmployee: async (data) => {
    const { id } = data;
    const userId = id;
    const sessions = await clerkClient.users.getUserSessions(userId);

    for (const session of sessions) {
      await clerkClient.sessions.revokeSession(session.id);
    }

    throw new Error("Access denied. You are not authorized as an employee.");
  },
};
