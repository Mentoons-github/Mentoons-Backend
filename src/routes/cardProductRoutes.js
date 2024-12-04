const { requireAuth } = require("@clerk/express");
const express = require("express");
const {
  createCardProductController,
  updateCardProductController,
  deleteCardProductController,
  getAllCardProductController,
  getCardProductController,
} = require("../controllers/cardProductController");

const router = express.Router();

router.post(
  "/",
  requireAuth({ signInUrl: "/sign-in" }),
  createCardProductController
);

router.get("/", getAllCardProductController);

router
  .route("/:skuId")
  .post(requireAuth({ signInUrl: "/sign-in" }), updateCardProductController)
  .delete(requireAuth({ signInUrl: "/sign-in" }), deleteCardProductController)
  .get(getCardProductController);

module.exports = router;
