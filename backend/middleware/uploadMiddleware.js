const multer = require("multer");
const path = require("path");
const fs = require("fs");
const logger = require("../utils/logger");

// S'assurer que le répertoire d'upload existe
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// Filtrer les types de fichiers acceptés
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }

  logger.warn(`Upload rejeté: ${file.originalname} (${file.mimetype})`);
  cb(
    new Error("Seules les images sont autorisées (jpeg, jpg, png, gif, webp)")
  );
};

// Limiter la taille des fichiers (5 MB)
const limits = {
  fileSize: 5 * 1024 * 1024,
};

// Créer l'instance multer
const upload = multer({
  storage,
  fileFilter,
  limits,
});

module.exports = upload;
