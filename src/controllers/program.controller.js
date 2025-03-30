const ProgramService = require('../services/program.service');

exports.getAllProgram = async (req, res, next) => {
  try {
    const program = await ProgramService.getAllProgram(req.user.masjid_id);
    res.json(program);
  } catch (error) {
    next(error);
  }
};

exports.getProgramsPaginated = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 10);
    const offset = (page - 1) * limit;

    console.log('masjid_id', req.user);

    const [programs, total] = await Promise.all([
      ProgramService.getProgramsPaginated(limit, offset, req.user.masjid_id),
      ProgramService.countAllPrograms(req.user.masjid_id)
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
      'status_program'
    ];

    const updatePayload = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
    );

    await ProgramService.updateProgram(req.params.id, updatePayload, req.user.masjid_id);
    const updatedProgram = await ProgramService.getProgramById(req.params.id);
    res.json(updatedProgram);
  } catch (error) {
    next(error);
  }
};

exports.deleteProgram = async (req, res, next) => {
  try {
    await ProgramService.deleteProgram(req.params.id, req.user.masjid_id);
    res.json({ message: 'Program deleted' });
  } catch (error) {
    next(error);
  }
};