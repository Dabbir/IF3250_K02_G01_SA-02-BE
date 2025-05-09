const fileService = require('../services/drive.service');

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await fileService.uploadToDrive(req.file);
    
    res.status(200).json({
      message: 'File uploaded successfully',
      file: result
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
};


exports.getFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await fileService.getFileFromDrive(fileId);
    
    res.status(200).json({
      message: 'File retrieved successfully',
      file
    });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ message: 'Error retrieving file', error: error.message });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    await fileService.deleteFileFromDrive(fileId);
    
    res.status(200).json({
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Error deleting file', error: error.message });
  }
};

exports.listFiles = async (req, res) => {
  try {
    const files = await fileService.listFiles();
    
    res.status(200).json({
      message: 'Files retrieved successfully',
      files
    });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ message: 'Error listing files', error: error.message });
  }
};