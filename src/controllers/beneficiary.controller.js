const beneficiaryService = require('../services/beneficiary.service');
const cloudinary = require('../config/cloudinary.config');

exports.create = async (req, res) => {
  try {
    let foto = null;
    if (req.file) {
      foto = req.file.path; 
    }

    const beneficiaryData = {
      nama_instansi: req.body.nama_instansi.trim(),
      nama_kontak: req.body.nama_kontak.trim(),
      alamat: req.body.alamat.trim(),
      telepon: req.body.telepon.trim(),
      email: req.body.email.trim(),
      foto: foto,
      created_by: req.user ? req.user.id : null  
    };

    const data = await beneficiaryService.createBeneficiary(beneficiaryData);
    
    res.status(201).json({
      success: true,
      message: "Penerima manfaat berhasil ditambahkan",
      data
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || "Terjadi kesalahan saat membuat penerima manfaat."
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    const { nama_instansi, page = 1, limit = 10, orderBy, orderDirection } = req.query;
    const params = {
      nama_instansi,
      page: parseInt(page),
      limit: parseInt(limit),
      orderBy,
      orderDirection
    };

    const result = await beneficiaryService.getAllBeneficiaries(params, req.user.masjid_id);
    
    res.status(200).json({
      success: true,
      message: "Penerima manfaat berhasil ditemukan",
      ...result
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || "Terjadi kesalahan saat mengambil penerima manfaat."
    });
  }
};

exports.findOne = async (req, res) => {
  try {
    const data = await beneficiaryService.getBeneficiaryById(req.params.id, req.user.masjid_id);
    
    res.status(200).json({
      success: true,
      message: "Penerima manfaat ditemukan",
      data
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || `Terjadi kesalahan saat mengambil penerima manfaat dengan id ${req.params.id}`
    });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    
    let beneficiaryData = {
      nama_instansi: req.body.nama_instansi.trim(),
      nama_kontak: req.body.nama_kontak.trim(),
      alamat: req.body.alamat.trim(),
      telepon: req.body.telepon.trim(),
      email: req.body.email.trim()
    };
    
    if (req.file) {
      beneficiaryData.foto = req.file.path;
    }

    const data = await beneficiaryService.updateBeneficiary(id, beneficiaryData, req.user.masjid_id);
    
    res.status(200).json({
      success: true,
      message: "Penerima manfaat berhasil diperbarui",
      data
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || `Terjadi kesalahan saat memperbarui penerima manfaat dengan id ${req.params.id}`
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    
    await beneficiaryService.deleteBeneficiary(id, req.user.masjid_id);
    
    res.status(200).json({ 
      success: true,
      message: "Penerima manfaat berhasil dihapus!" 
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || `Terjadi kesalahan saat menghapus penerima manfaat dengan id ${req.params.id}`
    });
  }
};

exports.findByAktivitas = async (req, res) => {
  try {
    const aktivitasId = req.params.aktivitasId;
    const data = await beneficiaryService.getBeneficiariesByAktivitas(aktivitasId, req.user.masjid_id);
    
    res.status(200).json({
      success: true,
      message: "Penerima manfaat ditemukan",
      data
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || "Terjadi kesalahan saat mengambil penerima manfaat."
    });
  }
};