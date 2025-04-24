const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const stakeholderController = require("../controllers/stakeholder.controller");

router.get("/getall", verifyToken, stakeholderController.getAllStakeholders);

router.get("/:id", verifyToken, stakeholderController.getByIdStakeholder);

router.post("/", verifyToken, stakeholderController.createStakeholder);

router.put("/:id", verifyToken, stakeholderController.updateStakeholder);

router.delete("/:id", verifyToken, stakeholderController.deleteStakeholder);

module.exports = router;