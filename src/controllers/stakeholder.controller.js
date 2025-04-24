const stakeholderService = require('../services/stakeholder.service');

exports.getAllStakeholders = async (req, res) => {
    try {
        const masjidId = req.user.masjid_id;
        const stakeholders = await stakeholderService.getAllStakeholders(masjidId);

        res.status(200).json({
            success: true,
            message: "Stakeholders found",
            stakeholders,
        });
    } catch (error) {
        console.error("Get all stakeholders error:", error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
}

exports.getByIdStakeholder = async (req, res) => {
    try {
        const masjidId = req.user.masjid_id;
        const stakeholderId = req.params.id;
        const stakeholder = await stakeholderService.getById(stakeholderId, masjidId);

        res.status(200).json({
            success: true,
            message: "Stakeholder found",
            stakeholder,
        });
    } catch (error) {
        console.error("Get stakeholder by ID error:", error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
}

exports.createStakeholder = async (req, res) => {
    try {
        const data = req.body;
        const stakeholderId = await stakeholderService.create(data);

        res.status(201).json({
            success: true,
            message: "Stakeholder created",
            stakeholderId,
        });
    } catch (error) {
        console.error("Create stakeholder error:", error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
}

exports.updateStakeholder = async (req, res) => {
    try {
        const stakeholderId = req.params.id;
        const data = req.body;
        const result = await stakeholderService.update(stakeholderId, data);

        res.status(200).json({
            success: true,
            message: "Stakeholder updated",
            result,
        });
    } catch (error) {
        console.error("Update stakeholder error:", error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
}

exports.deleteStakeholder = async (req, res) => {
    try {
        const stakeholderId = req.params.id;
        const result = await stakeholderService.delete(stakeholderId);

        res.status(200).json({
            success: true,
            message: "Stakeholder deleted",
            result,
        });
    } catch (error) {
        console.error("Delete stakeholder error:", error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
}