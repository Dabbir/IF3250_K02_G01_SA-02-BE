const activityModel = require('../models/activity.model');
const userModel = require('../models/user.model');
const fs = require("fs");
const path = require("path");
const cloudinary = require('cloudinary').v2;

const getPublicIdFromUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    
    try {
        const regex = /\/(?:image|raw|video)\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/;
        const match = url.match(regex);
        
        return match ? match[1] : null;
    } catch (error) {
        console.error('Error extracting public_id from URL:', error);
        return null;
    }
};

const deleteCloudinaryImage = async (imageUrl) => {
    try {
        const publicId = getPublicIdFromUrl(imageUrl);
        if (!publicId) {
        console.warn(`Could not extract public_id from URL: ${imageUrl}`);
        return false;
        }
        
        const result = await cloudinary.uploader.destroy(publicId);
        console.log(`Deleted image from Cloudinary: ${publicId}`, result);
        return result.result === 'ok';
    } catch (error) {
        console.error(`Error deleting image from Cloudinary: ${imageUrl}`, error);
        return false;
    }
};

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
            const error = new Error("Activity not found")
            error.statusCode = 404;
            throw error;
        }

        if (activity.masjid_id !== masjiID) {
            const error = new Error("You are not allowed to access this resource")
            error.statusCode = 403;
            throw error;
        }

        // Hapus semua gambar dokumentasi dari Cloudinary
        if (activity.dokumentasi && Array.isArray(activity.dokumentasi)) {
            await Promise.all(
                activity.dokumentasi.map(async (imageUrl) => {
                    try {
                        await deleteCloudinaryImage(imageUrl);
                    } catch (error) {
                        console.warn(`Failed to delete image: ${imageUrl}`, error);
                    }
                })
            );
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

        // Ganti bagian penghapusan file lokal dengan penghapusan Cloudinary
        if (Array.isArray(activityData.deleted_images)) {
            await Promise.all(
                activityData.deleted_images.map(async (imageUrl) => {
                    try {
                        const deleted = await deleteCloudinaryImage(imageUrl);
                        if (deleted) {
                            console.log(`Successfully deleted: ${imageUrl}`);
                        } else {
                            console.warn(`Failed to delete: ${imageUrl}`);
                        }
                    } catch (error) {
                        console.error(`Error deleting: ${imageUrl}`, error);
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

exports.getActivityByEmployeeId = async (employeeId, masjidID) => {
    try {
        const activity = await activityModel.findActivityByEmployeeId(employeeId, masjidID);

        if (!activity) {
            const error = new Error("Activity not found");
            error.statusCode = 404;
            throw error;
        }
        return activity;
    } catch (error) {
        throw error;
    }
}