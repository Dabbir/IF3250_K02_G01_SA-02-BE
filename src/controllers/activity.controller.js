const activityService = require("../services/activity.service");

exports.getByIdActivity = async (req, res) => {
    try {
        const userId = req.user.id;
        const activityId = req.params.id;

        const activity = await activityService.getByIdActivity(userId, activityId);

        res.status(200).json({
            success: true,
            message: "Activity found",
            activity,
        })
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
}

exports.getAllActivity = async (req, res) => {
    try {
        const masjidID = req.user.masjid_id;
        console.log(masjidID)

        const activity = await activityService.getAllActivity(masjidID);

        res.status(200).json({
            success: true,
            message: "Activity found",
            activity,
        })
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
}

exports.getIdProgram = async (req, res) => {
    try {
        const masjidID = req.user.masjid_id;

        const idProgram = await activityService.getIdProgram(masjidID);

        res.status(200).json({
            success: true,
            message: "Program found",
            idProgram,
        })
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
}

exports.getIdAktivitas = async (req, res) => {
    try {
        const masjidID = req.user.masjid_id;

        const idAktivitas = await activityService.getIdAktivitas(masjidID);

        res.status(200).json({
            success: true,
            message: "Activity found",
            idAktivitas,
        })
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
}

exports.getByIdProgram = async (req, res) => {
    try {
        const userId = req.user.id;
        const programId = req.params.id;

        const activity = await activityService.getByIdProgram(userId, programId);

        res.status(200).json({
            success: true,
            message: "Activity found",
            activity,
        })
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
}

exports.addActivity = async (req, res) => {
    try {
        const created_by = req.user.id;
        const masjid_id = req.user.masjid_id;
        
        const data = { ...req.body, created_by, masjid_id };

        if (req.fileUrls && req.fileUrls.length > 0) {
            data.dokumentasi = req.fileUrls;
        }

        const result = await activityService.addActivity(data)

        if (result) {
            res.status(200).json({
                success: true,
                message: "Activity added successfully",
            })
        } else {
            return res.status(400).json({
                success: false,
                message: "Add activity failed",
            });
        }
    } catch (error) {
        console.log(error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
}

exports.deleteActivity = async (req, res) => {
    try {
        const activityId = req.params.id;
        const masjidID = req.user.masjid_id;

        const activity = await activityService.getByIdActivity(req.user.id, activityId);
        
        if (activity && activity.dokumentasi && Array.isArray(activity.dokumentasi)) {
            await Promise.all(
                activity.dokumentasi.map(async (imageUrl) => {
                    try {
                        await deleteFileByUrl(imageUrl);
                        console.log(`Deleted file: ${imageUrl}`);
                    } catch (error) {
                        console.warn(`Failed to delete file: ${imageUrl}`, error);
                    }
                })
            );
        }

        const result = await activityService.deleteActivity(masjidID, activityId);

        if (result) {
            res.status(200).json({
                success: true,
                message: "Activity deleted successfully",
            })
        }
    } catch (error) {
        console.log(error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
}

exports.updateActivity = async (req, res) => {
    try {
        const userId = req.user.id;
        const activityId = req.params.id;
        const activityData = req.body;

        if (req.fileUrls && req.fileUrls.length > 0) {
            activityData.dokumentasi = req.fileUrls;
        }

        const result = await activityService.updateActivity(userId, activityId, activityData);

        res.status(200).json({
            success: true,
            message: "Activity updated successfully",
            data: result
        });
    } catch (error) {
        console.log(error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
}

exports.addActivitySheet = async (req, res) => {
    try {
        const userId = req.user.id;
        const masjid_id = req.user.masjid_id;
        const activityData = req.body.data;

        console.log(activityData);

        const result = await activityService.addActivitySheet(userId, masjid_id, activityData);

        res.status(200).json({
            success: true,
            message: "Activity updated successfully",
            data: result
        });
    } catch (error) {
        console.log(error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
}