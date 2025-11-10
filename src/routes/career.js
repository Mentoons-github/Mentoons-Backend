const express = require("express");
const router = express.Router();
const {
  addJob,
  getJobs,
  getJobById,
  applyJob,
  editJob,
  deleteJob,
  getAppliedJobs,
  getAppliedJobById,
  deleteJobApplication,
} = require("../controllers/career");

router.route("/jobs").post(addJob).get(getJobs);
router.route("/jobs/:id").get(getJobById).put(editJob).delete(deleteJob);
router.route("/jobs/apply/:id").post(applyJob);
router.route("/applied").get(getAppliedJobs);
router
  .route("/applied/:id")
  .get(getAppliedJobById)
  .delete(deleteJobApplication);
module.exports = router;
