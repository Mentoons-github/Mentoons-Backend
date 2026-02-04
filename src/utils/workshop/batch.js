const getNextWorkshopStartDate = () => {
  const today = new Date();
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + 7);
  nextDate.setHours(10, 0, 0, 0);
  return nextDate;
};

module.exports = getNextWorkshopStartDate;
