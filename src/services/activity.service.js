const activityModel = require('../models/activity.model');
const activityStakeholderModel = require('../models/activitystakeholder.model');
const activityEmployeeModel = require('../models/activityemployee.model');
const activityBeneficiaryModel = require('../models/activitybeneficiary.model');
const userModel = require('../models/user.model');
const { deleteCloudinaryImage } = require('../utils/upload.utils');
const activitystakeholderModel = require('../models/activitystakeholder.model');

exports.getByIdActivity = async (activityId, masjidId) => {
    try {
        const activity = await activityModel.findByIdActivity(activityId);

        if (!activity) {
            const error = new Error("Actvity not found")
            error.statusCode = 404;
            throw error;
        }

        if (activity.masjid_id !== masjidId) {
            const error = new Error("You are not allowed to access this resource")
            error.statusCode = 403;
            throw error;
        }

        const stakeholder = await activityStakeholderModel.findStakeholder(activityId);
        const employee = await activityEmployeeModel.findEmployee(activityId);
        const beneficiary = await activityBeneficiaryModel.findBeneficiary(activityId);

        return { activity, stakeholder, employee, beneficiary };
    } catch (error) {
        throw error;
    }
}

exports.getAllActivity = async (masjidId, params) => {
    try {
        const activity = await activityModel.findAll(masjidId, params);

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
        const id =  await activityModel.create(activityData);
        if (id) {
            activitystakeholderModel.create(id, activityData.stakeholders)
            activityBeneficiaryModel.create(id, activityData.beneficiaries)
            activityEmployeeModel.create(id, activityData.employees)
        }

        return id;
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

exports.updateActivity = async (masjidId, activityId, activityData) => {
    try {
        const activity = await activityModel.findByIdActivity(activityId);

        if (!activity) {
            const error = new Error("Activity not found");
            error.statusCode = 404;
            throw error;
        }

        if (activity.masjid_id !== masjidId) {
            const error = new Error("You are not allowed to update this resource");
            error.statusCode = 403;
            throw error;
        }

        activityData.tanggal_mulai = formatDate(activityData.tanggal_mulai);
        activityData.tanggal_selesai = formatDate(activityData.tanggal_selesai);

        const updatedActivity = await activityModel.update(activityId, activityData);
        await activityStakeholderModel.createUpdate(activityId, activityData.stakeholders);
        await activityBeneficiaryModel.createUpdate(activityId, activityData.beneficiaries);
        await activityEmployeeModel.createUpdate(activityId, activityData.employees);

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
        throw error; 
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