const activityModel = require('../models/activity.model');
const userModel = require('../models/user.model');

exports.getByIdActivity = async (userId, activityId) => {
    try {
        const activity = await activityModel.findByIdActivity(activityId);

        if (!activity) {
            const error = new Error("Actvity not found")
            error.statusCode = 404;
            throw error;
        }

        const activityMasjid = await userModel.findMasjidUser(activity.created_by);
        const userMasjid = await userModel.findMasjidUser(userId);

        if (userMasjid.masjid_id !== activityMasjid.masjid_id) {
            const error = new Error("You are not allowed to access this resource")
            error.statusCode = 403;
            throw error;
        }

        return activity;
    } catch (error) {
        throw error;
    }
}
exports.getAllActivity = async (masjidID) => {
    try {
        const activity = await activityModel.findAllActivity(masjidID);

        if (!activity) {
            const error = new Error("Actvity not found")
            error.statusCode = 404;
            throw error;
        }
        return activity;
    } catch (error) {
        throw error;
    }
}
exports.getmasjidID = async (id) => {
    try {
        const masjidID = await activityModel.findmasjidID(id);

        if (!masjidID) {
            const error = new Error("masjidID not found")
            error.statusCode = 404;
            throw error;
        }
        return masjidID;
    } catch (error) {
        throw error;
    }
}

exports.getByIdProgram = async (userId, programId) => {
    try {
        const activity = await activityModel.findByIdProgram(programId);

        if (!activity) {
            const error = new Error("Actvity not found")
            error.statusCode = 404;
            throw error;
        }

        // nanti tambahin cek user tsb forbidden apa ga buat access resource ini

        return activity;
    } catch (error) {
        throw error;
    }
}

exports.addActivity = async(activityData) => {
    try {
        return await activityModel.create(activityData);       
    } catch (error) {
        throw error;
    }
}

exports.deleteActivity = async (masjiID, activityId) => {
    try {
        const activity = await activityModel.findByIdActivity(activityId);

        if (!activity) {
            const error = new Error("Actvity not found")
            error.statusCode = 404;
            throw error;
        }

        if (activity.masjid_id !== masjiID) {
            const error = new Error("You are not allowed to access this resource")
            error.statusCode = 403;
            throw error;
        }

        return await activityModel.delete(activityId);
    } catch (error) {
        throw error;
    }
}