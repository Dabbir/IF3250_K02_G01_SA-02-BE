const Beneficiary = require('../models/beneficiary.model');
const BeneficiaryService = require('../services/beneficiary.service');
const path = require('path');
const fs = require('fs');

// Create a new Beneficiary
exports.create = async (req, res) => {
  try {
    // Validate request
    if (!req.body.nama_instansi) {
      return res.status(400).send({
        message: "Nama instansi tidak boleh kosong"
      });
    }

    // Handle file upload if present
    let foto = null;
    if (req.file) {
      foto = req.file.filename;
      // If using the existing middleware which sets req.fileUrl
      if (req.fileUrl) {
        foto = req.fileUrl;
      }
    }

    // Create a Beneficiary object
    const beneficiary = new Beneficiary({
      nama_instansi: req.body.nama_instansi,
      nama_kontak: req.body.nama_kontak,
      alamat: req.body.alamat,
      telepon: req.body.telepon,
      email: req.body.email,
      foto: foto,
      created_by: req.user ? req.user.id : null
    });

    // Save Beneficiary in the database
    const data = await BeneficiaryService.createBeneficiary(beneficiary);
    res.status(201).send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Terjadi kesalahan saat membuat beneficiary."
    });
  }
};

// Retrieve all Beneficiaries
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

    const data = await BeneficiaryService.getAllBeneficiaries(params);
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Terjadi kesalahan saat mengambil beneficiaries."
    });
  }
};

// Find a single Beneficiary with an id
exports.findOne = async (req, res) => {
  try {
    const data = await BeneficiaryService.getBeneficiaryById(req.params.id);
    if (!data) {
      return res.status(404).send({
        message: `Beneficiary dengan id ${req.params.id} tidak ditemukan.`
      });
    }
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: `Terjadi kesalahan saat mengambil beneficiary dengan id ${req.params.id}`
    });
  }
};

// Update a Beneficiary identified by the id
exports.update = async (req, res) => {
  try {
    // Validate Request
    if (!req.body.nama_instansi) {
      return res.status(400).send({
        message: "Nama instansi tidak boleh kosong"
      });
    }

    const id = req.params.id;
    
    // Check if beneficiary exists
    const existingBeneficiary = await Beneficiary.findById(id);
    if (!existingBeneficiary) {
      return res.status(404).send({
        message: `Beneficiary dengan id ${id} tidak ditemukan.`
      });
    }

    // Handle file upload if present
    let foto = existingBeneficiary.foto;
    if (req.file) {
      // Use the fileUrl set by your middleware
      if (req.fileUrl) {
        foto = req.fileUrl;
      } else {
        foto = req.file.filename;
      }
    }

    // Create updated beneficiary object
    const beneficiary = {
      nama_instansi: req.body.nama_instansi,
      nama_kontak: req.body.nama_kontak,
      alamat: req.body.alamat,
      telepon: req.body.telepon,
      email: req.body.email,
      foto: foto
    };

    const data = await BeneficiaryService.updateBeneficiary(id, beneficiary);
    if (data.kind === "not_found") {
      return res.status(404).send({
        message: `Beneficiary dengan id ${id} tidak ditemukan.`
      });
    }
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: `Terjadi kesalahan saat memperbarui beneficiary dengan id ${req.params.id}`
    });
  }
};

// Delete a Beneficiary with the specified id
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Check if beneficiary exists and get photo filename
    const existingBeneficiary = await Beneficiary.findById(id);
    if (!existingBeneficiary) {
      return res.status(404).send({
        message: `Beneficiary dengan id ${id} tidak ditemukan.`
      });
    }

    const result = await BeneficiaryService.deleteBeneficiary(id);
    
    if (result.kind === "not_found") {
      return res.status(404).send({
        message: `Beneficiary dengan id ${id} tidak ditemukan.`
      });
    }

    // Note: We're skipping the file deletion here because the file paths in your 
    // middleware are URLs rather than local file paths

    res.send({ message: "Beneficiary berhasil dihapus!" });
  } catch (err) {
    res.status(500).send({
      message: `Terjadi kesalahan saat menghapus beneficiary dengan id ${req.params.id}`
    });
  }
};

// Get beneficiaries by aktivitas id
exports.findByAktivitas = async (req, res) => {
  try {
    const aktivitasId = req.params.aktivitasId;
    const data = await BeneficiaryService.getBeneficiariesByAktivitas(aktivitasId);
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Terjadi kesalahan saat mengambil beneficiaries."
    });
  }
};