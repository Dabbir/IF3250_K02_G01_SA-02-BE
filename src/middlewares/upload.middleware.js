const multer = require("multer");
const fs = require("fs");
const path = require("path");

const BASEURL = "http://localhost:8080/";

const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📂 Folder 'uploads' telah dibuat.");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `../uploads/${uniqueSuffix}${ext}`;
    cb(null, filename);

    const fullPath = `${BASEURL}api/users/photo/${uniqueSuffix}${ext}`;

    if (req.files) {
      if (!req.fileUrls) {
        req.fileUrls = [];
      }
      req.fileUrls.push(fullPath);
    } else {
      req.fileUrl = fullPath;
    }
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (JPG, PNG, GIF, WEBP, SVG) are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

module.exports = upload;
