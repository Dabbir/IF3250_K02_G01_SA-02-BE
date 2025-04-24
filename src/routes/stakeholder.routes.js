const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const stakeholderController = require("../controllers/stakeholder.controller");

router.get("/getall", verifyToken, stakeholderController.getAllStakeholders);

router.get("/:id", verifyToken, stakeholderController.getByIdStakeholder);

router.post("/add", verifyToken, stakeholderController.createStakeholder);

router.put("/update/:id", verifyToken, stakeholderController.updateStakeholder);

router.delete("/delete/:id", verifyToken, stakeholderController.deleteStakeholder);

module.exports = router;