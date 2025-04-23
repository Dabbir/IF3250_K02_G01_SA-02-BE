const activityModel = require('../models/activity.model');
const userModel = require('../models/user.model');
const fs = require("fs");
const path = require("path");

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

exports.getIdProgram = async (masjidID) => {
    try {
        const idProgram = await activityModel.getIdProgram(masjidID);

        if (!idProgram) {
            const error = new Error("Program not found")
            error.statusCode = 404;
            throw error;
        }
        return idProgram;
    } catch (error) {
        throw error;
    }
}

exports.getIdAktivitas = async (masjidID) => {
    try {
        const idAktivitas = await activityModel.getIdAktivitas(masjidID);

        if (!idAktivitas) {
            const error = new Error("Aktivitas not found")
            error.statusCode = 404;
            throw error;
        }
        return idAktivitas;
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

exports.addActivity = async (activityData) => {
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

const formatDate = (isoDateString) => {
    if (!isoDateString) return null;
    const date = new Date(isoDateString);
    return date.toISOString().slice(0, 19).replace("T", " ");
};

exports.updateActivity = async (userId, activityId, activityData) => {
    try {
        const activity = await activityModel.findByIdActivity(activityId);

        if (!activity) {
            const error = new Error("Activity not found");
            error.statusCode = 404;
            throw error;
        }

        const activityMasjid = await userModel.findMasjidUser(activity.created_by);
        const userMasjid = await userModel.findMasjidUser(userId);

        if (userMasjid.masjid_id !== activityMasjid.masjid_id) {
            const error = new Error("You are not allowed to update this resource");
            error.statusCode = 403;
            throw error;
        }

        activityData.tanggal_mulai = formatDate(activityData.tanggal_mulai);
        activityData.tanggal_selesai = formatDate(activityData.tanggal_selesai);

        if (Array.isArray(activityData.deleted_images)) {
            await Promise.all(
                activityData.deleted_images.map(async (imagePath) => {
                    const fileName = imagePath.split("/").pop();
                    const oldPhotoPath = path.join(__dirname, "../uploads/", fileName);
                    if (fs.existsSync(oldPhotoPath)) {
                        console.log(fileName);
                        console.log(oldPhotoPath);
                        await fs.unlinkSync(oldPhotoPath);
                        console.log(`Delete successed: ${oldPhotoPath}`);
                    } else {
                        console.warn(`Delete failed ${imagePath}`);
                    }
                })
            );
        }

        const updatedActivity = await activityModel.update(activityId, activityData);

        return updatedActivity;
    } catch (error) {
        throw error;
    }
}

const excelSerialToDate = (serial) => {
    if (!serial || isNaN(serial)) return null;
    const excelEpoch = new Date(1899, 11, 30);
    return new Date(excelEpoch.getTime() + serial * 86400000).toISOString().split("T")[0];
};

exports.addActivitySheet = async (userId, masjid_id, activityData) => {
    try {
        const activities = activityData.map(activity => ({
            created_by: userId,
            masjid_id: masjid_id,
            nama_aktivitas: activity.nama_aktivitas,
            deskripsi: activity.deskripsi,
            tanggal_mulai: excelSerialToDate(activity.tanggal_mulai),
            tanggal_selesai: excelSerialToDate(activity.tanggal_selesai),
            biaya_implementasi: parseFloat(activity.biaya_implementasi),
            status: activity.status.charAt(0).toUpperCase() + activity.status.slice(1).toLowerCase(),
        }));

        console.log(activities);
        return await activityModel.createSheet(activities);
    } catch (error) {
        console.error("Error inserting data:", error);
        throw error; // Biarkan controller yang menangani response
    }
};

