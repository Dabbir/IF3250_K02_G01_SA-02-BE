const stakeholderService = require('../services/stakeholder.service');

exports.getAllStakeholders = async (req, res) => {
    try {
        const masjidId = req.user.masjid_id;
        const {
            page,
            limit,
            nama_stakeholder,
            jenis, 
            sortColumn,
            sortOrder,
        } = req.query;

        const params = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
            nama_stakeholder: nama_stakeholder || undefined,
            jenis: jenis ? (Array.isArray(jenis) ? jenis : [jenis]) : [],
            sortColumn: sortColumn || "nama_stakeholder",
            sortOrder: (sortOrder || "ASC").toUpperCase() === "DESC" ? "DESC" : "ASC",
        };

        const result = await stakeholderService.getAllStakeholders(masjidId, params);

        res.status(200).json({
            success: true,
            message: "Stakeholders found",
            stakeholders: result.data,
            total: result.total,
            page: result.page,
            limit: result.limit,
        });
    } catch (error) {
        console.error("Get all stakeholders error:", error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};


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
        data.masjid_id = req.user.masjid_id;
        data.created_by = req.user.id;

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
        const masjidId = req.user.masjid_id;

        const result = await stakeholderService.update(stakeholderId, data, masjidId);

        res.status(200).json({
            success: true,
            message: "Stakeholder updated successfully",
            data: result,
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