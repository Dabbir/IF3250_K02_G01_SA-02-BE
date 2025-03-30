const ProgramService = require('../services/program.service');

exports.getAllProgram = async (req, res, next) => {
  try {
    const program = await ProgramService.getAllProgram();
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

    const [programs, total] = await Promise.all([
      ProgramService.getProgramsPaginated(limit, offset),
      ProgramService.countAllPrograms()
    ]);

    res.json({ data: programs, total });
  } catch (error) {
    next(error);
  }
};

exports.getProgramById = async (req, res, next) => {
  try {
    const program = await ProgramService.getProgramById(req.params.id);
    if (!program) return res.status(404).json({ message: 'Program not found' });
    res.json(program);
  } catch (error) {
    next(error);
  }
};

exports.createProgram = async (req, res, next) => {
  try {
    const id = await ProgramService.createProgram(req.body);
    res.status(201).json({ id });
  } catch (error) {
    next(error);
  }
};

exports.updateProgram = async (req, res, next) => {
  try {
    await ProgramService.updateProgram(req.params.id, req.body);
    const updatedProgram = await ProgramService.getProgramById(req.params.id);
    res.json(updatedProgram);
  } catch (error) {
    next(error);
  }
};

exports.deleteProgram = async (req, res, next) => {
  try {
    await ProgramService.deleteProgram(req.params.id);
    res.json({ message: 'Program deleted' });
  } catch (error) {
    next(error);
  }
};