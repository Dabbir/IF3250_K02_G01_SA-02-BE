const activityService = require('../services/activity.service');

exports.getAllGallery = async (req, res) => {
    try {
        const masjidID = req.user.masjid_id;
        let activities = await activityService.getAllActivity(masjidID);

        activities.sort((a, b) => new Date(b.tanggal_mulai) - new Date(a.tanggal_mulai));

        const photos = activities.reduce((acc, a) => {
            let docs = [];
            try {
                docs = JSON.parse(a.dokumentasi || '[]');
            } catch {}
            
            docs.forEach(url => acc.push({ aktivitas_id: a.id, url, tanggal_mulai: a.tanggal_mulai }));
            return acc;
        }, []);

        res.status(200).json({
            success: true,
            message: 'Gallery fetched successfully',
            data: photos,
        });
        } catch (error) {
        console.error(error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Internal server error',
        });
    }
};

exports.getGalleryPaginated = async (req, res) => {
    try {
        const masjidID = req.user.masjid_id;
        const page   = parseInt(req.query.page || 1, 10);
        const limit  = parseInt(req.query.limit || 10, 10);
        const offset = (page - 1) * limit;

        let activities = await activityService.getAllActivity(masjidID);

        activities.sort((a, b) => new Date(b.tanggal_mulai) - new Date(a.tanggal_mulai));

        const allPhotos = activities.reduce((acc, a) => {
            let docs = [];
            try {
                docs = JSON.parse(a.dokumentasi || '[]');
            } catch {}

            docs.forEach(url => acc.push({ aktivitas_id: a.id, url, tanggal_mulai: a.tanggal_mulai }));
            return acc;
        }, []);

        const total = allPhotos.length;
        const paginated = allPhotos.slice(offset, offset + limit);

        res.status(200).json({
            success: true,
            message: 'Gallery (paginated) fetched successfully',
            data: paginated,
            total,
            page,
            limit,
        });
        } catch (error) {
        console.error(error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Internal server error',
        });
    }
};

exports.getGalleryByAktivitasId = async (req, res) => {
    try {
        const userId      = req.user.id;
        const aktivitasId = req.params.id;

        const activity = await activityService.getByIdActivity(userId, aktivitasId);

        let photos = [];
        try {
            photos = JSON.parse(activity.dokumentasi || '[]');
        } catch {}

        res.status(200).json({
            success: true,
            message: 'Activity gallery fetched successfully',
            data: photos,
        });
        } catch (error) {
        console.error(error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Internal server error',
        });
    }
};