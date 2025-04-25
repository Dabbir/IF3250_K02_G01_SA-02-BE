const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const stakeholderController = require("../controllers/stakeholder.controller");
const { stakeholderValidation, validate } = require("../middlewares/validate.middleware");

router.get("/getall", verifyToken, stakeholderController.getAllStakeholders);

router.get("/getstakeholder/:id", verifyToken, stakeholderController.getByIdStakeholder);

router.post("/add", [verifyToken, stakeholderValidation, validate], stakeholderController.createStakeholder);

router.put("/update/:id", [verifyToken, stakeholderValidation, validate], stakeholderController.updateStakeholder);

router.delete("/delete/:id", verifyToken, stakeholderController.deleteStakeholder);

module.exports = router;