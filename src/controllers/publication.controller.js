const PublicationService = require('../services/publication.service');

exports.getAllPublications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'tanggal_publikasi';
    const sortOrder = req.query.sortOrder || 'desc';
    
    const filters = {};
    
    if (req.query.toneFilters) {
      filters.tone = req.query.toneFilters.split(',');
    }
    
    if (req.query.mediaFilters) {
      filters.media = req.query.mediaFilters.split(',');
    }
    
    if (req.query.programFilters) {
      filters.program = req.query.programFilters.split(',');
    }
    
    if (req.query.activityFilters) {
      filters.activity = req.query.activityFilters.split(',');
    }
    
    if (req.query.dateFrom) {
      filters.dateFrom = req.query.dateFrom;
    }
    
    if (req.query.dateTo) {
      filters.dateTo = req.query.dateTo;
    }
    
    if (req.query.prValueMin !== undefined) {
      filters.prValueMin = parseFloat(req.query.prValueMin);
    }
    
    if (req.query.prValueMax !== undefined) {
      filters.prValueMax = parseFloat(req.query.prValueMax);
    }
    
    const result = await PublicationService.getPaginatedPublications(
      page, 
      limit, 
      search, 
      sortBy, 
      sortOrder, 
      filters
    );
    
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getPublicationById = async (req, res, next) => {
  try {
    const publication = await PublicationService.getPublicationById(req.params.id);
    if (!publication) return res.status(404).json({ message: 'Publication not found' });
    res.json(publication);
  } catch (error) {
    next(error);
  }
};

exports.createPublication = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = req.body;

    const dataWithUserId = {
      ...data,
      created_by: userId,
    };

    const id = await PublicationService.createPublication(dataWithUserId);
    res.status(201).json({ id });
  } catch (error) {
    next(error);
  }
};

exports.updatePublication = async (req, res, next) => {
  try {
    await PublicationService.updatePublication(req.params.id, req.body);
    res.json({ message: 'Publication updated' });
  } catch (error) {
    next(error);
  }
};

exports.deletePublication = async (req, res, next) => {
  try {
    await PublicationService.deletePublication(req.params.id);
    res.json({ message: 'Publication deleted' });
  } catch (error) {
    next(error);
  }
};

exports.getFilterOptions = async (req, res, next) => {
  try {
    const filterOptions = await PublicationService.getFilterOptions();
    res.json(filterOptions);
  } catch (error) {
    next(error);
  }
};