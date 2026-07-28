const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');

const uploadDir = path.join(__dirname, '../../uploads/package-spendings');
const MAX_EDGE = 1920;
const JPEG_QUALITY = 80;

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image uploads are allowed'));
    }
    cb(null, true);
  },
}).single('screenshot');

async function compressAndSave(req, _res, next) {
  if (!req.file?.buffer) {
    return next();
  }

  try {
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
    const destPath = path.join(uploadDir, filename);

    const buffer = await sharp(req.file.buffer)
      .rotate()
      .resize({
        width: MAX_EDGE,
        height: MAX_EDGE,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toBuffer();

    await fs.promises.writeFile(destPath, buffer);

    req.file.filename = filename;
    req.file.path = destPath;
    req.file.mimetype = 'image/jpeg';
    req.file.size = buffer.length;
    delete req.file.buffer;

    next();
  } catch (err) {
    next(new Error(err.message || 'Image compression failed'));
  }
}

function uploadScreenshot(req, res, next) {
  multerUpload(req, res, (err) => {
    if (err) return next(err);
    compressAndSave(req, res, next);
  });
}

module.exports = { uploadScreenshot, uploadDir };
