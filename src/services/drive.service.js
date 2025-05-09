// services/fileService.js atau services/drive.service.js
const drive = require('../config/drive.config');
const { Readable } = require('stream');

const uploadToDrive = async (file) => {
  try {
    const fileStream = Readable.from(file.buffer);

    const fileMetadata = {
      name: file.originalname,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };

    const media = {
      mimeType: file.mimetype,
      body: fileStream,
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, mimeType, webViewLink, webContentLink',
    });

    // Make file publicly accessible
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return {
      id: response.data.id,
      name: response.data.name,
      mimeType: response.data.mimeType,
      webViewLink: response.data.webViewLink,
      webContentLink: response.data.webContentLink,
    };
  } catch (error) {
    throw new Error(`Failed to upload file to Google Drive: ${error.message}`);
  }
};

const getFileFromDrive = async (fileId) => {
  try {
    const response = await drive.files.get({
      fileId: fileId,
      fields: 'id, name, mimeType, webViewLink, webContentLink',
    });

    return response.data;
  } catch (error) {
    throw new Error(`Failed to get file from Google Drive: ${error.message}`);
  }
};

const deleteFileFromDrive = async (fileId) => {
  try {
    await drive.files.delete({
      fileId: fileId,
    });
  } catch (error) {
    throw new Error(`Failed to delete file from Google Drive: ${error.message}`);
  }
};

// Tambahan fungsi listFiles
const listFiles = async () => {
  try {
    const response = await drive.files.list({
      q: `'${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, webViewLink, webContentLink, createdTime, modifiedTime)',
      orderBy: 'createdTime desc',
      pageSize: 100
    });

    return response.data.files;
  } catch (error) {
    throw new Error(`Failed to list files from Google Drive: ${error.message}`);
  }
};

module.exports = {
  uploadToDrive,
  getFileFromDrive,
  deleteFileFromDrive,
  listFiles
};