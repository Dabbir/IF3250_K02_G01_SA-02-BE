const ProgramService = require('../services/program.service');
const cloudinary = require('cloudinary').v2;

const ALLOWED_SORT_FIELDS = [
  "nama_program",
  "waktu_mulai",
  "waktu_selesai",
  "created_at",
];

exports.getAllPrograms = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 15);
    const offset = (page - 1) * limit;
    const search = req.query.search || ""; 
    const sortBy    = ALLOWED_SORT_FIELDS.includes(req.query.sortBy)? req.query.sortBy : "created_at";
    const sortOrder = req.query.sortOrder === "ASC" ? "ASC" : "DESC";
    const statuses = req.query.status ? req.query.status.split(",") : [];

    const [programs, total] = await Promise.all([
      ProgramService.getAllPrograms(limit, offset, req.user.masjid_id, search, sortBy, sortOrder, statuses),
      ProgramService.countAllPrograms(req.user.masjid_id, search, statuses)
    ]);

    res.json({ data: programs, total });
  } catch (error) {
    next(error);
  }
};

exports.getProgramById = async (req, res, next) => {
  try {
    const program = await ProgramService.getProgramById(req.params.id, req.user.masjid_id);
    if (!program) return res.status(404).json({ message: 'Program not found' });
    res.json(program);
  } catch (error) {
    next(error);
  }
};

exports.createProgram = async (req, res, next) => {
  try {
    const { created_by: _ignore1, masjid_id: _ignore2, ...restBody } = req.body;
    const created_by = req.user.id;
    const masjid_id = req.user.masjid_id;

    const payload = {
      ...restBody,
      created_by,
      masjid_id,
    };

    if (req.fileUrl) {
      payload.cover_image = req.fileUrl;
    }

    const id = await ProgramService.createProgram(payload);
    res.status(201).json({ id });
  } catch (error) {
    next(error);
  }
};

exports.updateProgram = async (req, res, next) => {
  try {
    const allowedFields = [
      'nama_program',
      'deskripsi_program',
      'pilar_program',
      'kriteria_program',
      'waktu_mulai',
      'waktu_selesai',
      'rancangan_anggaran',
      'aktualisasi_anggaran',
      'status_program',
      'cover_image',
    ];

    const updatePayload = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
    );

    if (req.fileUrl) {
      updatePayload.cover_image = req.fileUrl;

      const current = await ProgramService.getProgramById(req.params.id, req.user.masjid_id);
      if (current && current.cover_image) {
        deleteCoverImage(current.cover_image);
      } else if (updatePayload.cover_image === "") {
        updatePayload.cover_image = null;
  
        if (current.cover_image) {
          deleteCoverImage(current.cover_image);
        }
      } else {
        delete updatePayload.cover_image;
      }
    }

    await ProgramService.updateProgram(req.params.id, updatePayload, req.user.masjid_id);
    const updatedProgram = await ProgramService.getProgramById(req.params.id, req.user.masjid_id);
    res.json(updatedProgram);
  } catch (error) {
    next(error);
  }
};

exports.deleteProgram = async (req, res, next) => {
  try {
    const current = await ProgramService.getProgramById(req.params.id, req.user.masjid_id);
    const response = await ProgramService.deleteProgram(req.params.id, req.user.masjid_id);

    if (!response) {
      return res.status(400).json({ message: 'Program deletion failed' });
    }

    if (current && current.cover_image) {
      deleteCoverImage(current.cover_image);
    }

    res.json({ message: 'Program deleted' });
  } catch (error) {
    next(error);
  }
};

function getPublicIdFromUrl(url) {
  if (!url) return null;
  const m = url.match(/\/(?:image|raw|video)\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
  return m ? m[1] : null;
}

function deleteCoverImage(cover_image) {
  if (cover_image) {
    const publicId = getPublicIdFromUrl(cover_image);
    if (publicId) cloudinary.uploader.destroy(publicId);
  }
}