const addSession = async () => {
  try {
    const sesionData = req.body;
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
