const validateBeneficiary = (req, res, next) => {
    const errors = [];
    
    if (!req.body.nama_instansi || req.body.nama_instansi.trim() === '') {
      errors.push({
        field: 'nama_instansi',
        message: 'Nama instansi wajib diisi'
      });
    }
    
    if (!req.body.nama_kontak || req.body.nama_kontak.trim() === '') {
      errors.push({
        field: 'nama_kontak',
        message: 'Nama kontak personil wajib diisi'
      });
    }
    
    if (!req.body.alamat || req.body.alamat.trim() === '') {
      errors.push({
        field: 'alamat',
        message: 'Alamat wajib diisi'
      });
    }
    
    if (!req.body.telepon || req.body.telepon.trim() === '') {
      errors.push({
        field: 'telepon',
        message: 'Nomor telepon wajib diisi'
      });
    } else if (!/^[\d\s\+\-()]+$/.test(req.body.telepon)) {
      errors.push({
        field: 'telepon',
        message: 'Format nomor telepon tidak valid'
      });
    }
    
    if (!req.body.email || req.body.email.trim() === '') {
      errors.push({
        field: 'email',
        message: 'Email wajib diisi'
      });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
      errors.push({
        field: 'email',
        message: 'Format email tidak valid'
      });
    }
    
    if (req.file) {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        errors.push({
          field: 'foto',
          message: 'Format file tidak valid. Gunakan JPG, PNG, GIF, atau WEBP'
        });
      }
      
      if (req.file.size > 2 * 1024 * 1024) {
        errors.push({
          field: 'foto',
          message: 'Ukuran file terlalu besar. Maksimal 2MB'
        });
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validasi gagal',
        errors: errors
      });
    }
    
    next();
  };
  
  module.exports = {
    validateBeneficiary
  };