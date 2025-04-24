const stakeholderModel = require('../models/stakeholder.model');

exports.getAllStakeholders = async (masjidId) => {
    try {
        const stakeholders = await stakeholderModel.findAll(masjidId);
        return stakeholders;
    } catch (error) {
        console.error('Error in getAllStakeholders:', error);
        throw error;
    }
}

exports.getById = async (id, masjidId) => {
    try {
        const stakeholder = await stakeholderModel.findById(id);

        if (!stakeholder) {
            const error = new Error("Stakeholder not found");
            error.statusCode = 404;
            throw error;
        } else if (stakeholder.masjid_id !== masjidId) {
            console.log("masjidId", masjidId);
            console.log("stakeholder.masjidId", stakeholder.masjidId);
            const error = new Error("You are not allowed to access this resource");
            error.statusCode = 403;
            throw error;
        }

        return stakeholder;
    } catch (error) {
        console.error('Error in getById:', error);
        throw error;
    }
}

exports.create = async (data) => {
    try {
        const stakeholderId = await stakeholderModel.create(data);
        return stakeholderId;
    } catch (error) {
        console.error('Error in create:', error);
        throw error;
    }
}

exports.update = async (id, data) => {
    try {
        const stakeholder = this.getById(id, data.masjidId);

        if (stakeholder) {
            const result = await stakeholderModel.update(id, data);
            return result;
        } else {
            const error = new Error("Stakeholder not found");
            error.statusCode = 404;
            throw error;
        }
    } catch (error) {
        console.error('Error in update:', error);
        throw error;
    }
}

exports.delete = async (id) => {
    try {
        const result = await stakeholderModel.delete(id);
        return result;
    } catch (error) {
        console.error('Error in delete:', error);
        throw error;
    }
}
