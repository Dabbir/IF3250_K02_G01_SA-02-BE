const PublikasiService = require('../services/publikasi.service');

exports.getAllPublikasi = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'tanggal_publikasi';
    const sortOrder = req.query.sortOrder || 'desc';
    const toneFilters = req.query.toneFilters ? req.query.toneFilters.split(',') : [];
    
    const result = await PublikasiService.getPaginatedPublikasi(
      page, 
      limit, 
      search, 
      sortBy, 
      sortOrder, 
      toneFilters
    );
    
    res.json(result);
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