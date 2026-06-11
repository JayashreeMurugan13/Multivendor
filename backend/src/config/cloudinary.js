const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Use local disk storage (no Cloudinary keys needed in dev)
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    file.path_url = null; // will be set after save
    cb(null, true);
  },
});

// Middleware to convert file.path to URL after upload
const setFileUrls = (req, res, next) => {
  if (req.file) {
    req.file.path = `http://localhost:${process.env.PORT || 5000}/uploads/${req.file.filename}`;
  }
  if (req.files) {
    if (Array.isArray(req.files)) {
      req.files.forEach(f => { f.path = `http://localhost:${process.env.PORT || 5000}/uploads/${f.filename}`; });
    } else {
      Object.values(req.files).forEach(arr =>
        arr.forEach(f => { f.path = `http://localhost:${process.env.PORT || 5000}/uploads/${f.filename}`; })
      );
    }
  }
  next();
};

// Wrap upload to always apply setFileUrls
const originalFields = upload.fields.bind(upload);
const originalSingle = upload.single.bind(upload);
const originalArray = upload.array.bind(upload);

const wrappedUpload = {
  ...upload,
  single: (field) => [originalSingle(field), setFileUrls],
  array: (field, max) => [originalArray(field, max), setFileUrls],
  fields: (fields) => [originalFields(fields), setFileUrls],
};

// Stub cloudinary object so code that calls cloudinary.uploader.destroy doesn't crash
const cloudinary = {
  uploader: {
    destroy: async () => ({ result: 'ok' }),
  },
};

module.exports = { cloudinary, upload: wrappedUpload };
