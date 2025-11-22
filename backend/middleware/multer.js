import multer from 'multer';
import fs from 'fs';

const folder = "./public";
if (!fs.existsSync(folder)) fs.mkdirSync(folder);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, folder),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
});