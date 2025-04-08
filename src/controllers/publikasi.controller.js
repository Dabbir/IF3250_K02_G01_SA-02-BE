const PublikasiService = require('../services/publikasi.service');

exports.getAllPublikasi = async (req, res, next) => {
  try {
    const publikasi = await PublikasiService.getAllPublikasi();
    res.json(publikasi);
  } catch (error) {
    next(error);
  }
};

exports.getPublikasiById = async (req, res, next) => {
  try {
    const publikasi = await PublikasiService.getPublikasiById(req.params.id);
    if (!publikasi) return res.status(404).json({ message: 'Publikasi not found' });
    res.json(publikasi);
  } catch (error) {
    next(error);
  }
};

exports.createPublikasi = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = req.body;

    const dataWithUserId = {
      ...data,
      created_by: userId,
    };

    const id = await PublikasiService.createPublikasi(dataWithUserId);
    res.status(201).json({ id });
  } catch (error) {
    next(error);
  }
};

exports.updatePublikasi = async (req, res, next) => {
  try {
    await PublikasiService.updatePublikasi(req.params.id, req.body);
    res.json({ message: 'Publikasi updated' });
  } catch (error) {
    next(error);
  }
};

exports.deletePublikasi = async (req, res, next) => {
  try {
    await PublikasiService.deletePublikasi(req.params.id);
    res.json({ message: 'Publikasi deleted' });
  } catch (error) {
    next(error);
  }
};