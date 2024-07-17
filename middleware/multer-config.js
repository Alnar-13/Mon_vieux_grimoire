const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

// Définition des types MIME et des extensions de fichier correspondantes
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

// Configuration du stockage en mémoire pour multer
const storage = multer.memoryStorage();

// Middleware multer pour le téléchargement de fichiers
const upload = multer({ storage }).single('image');

// Middleware pour optimiser l'image après le téléchargement
const optimizeImage = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const extension = MIME_TYPES[req.file.mimetype];
  const filename = req.file.originalname.split(' ').join('_').replace(/[^a-zA-Z0-9_\-\.]/g, '') + Date.now() + '.' + extension;
  const outputPath = path.join('images', filename);

  sharp(req.file.buffer)
    .resize(800) // Redimensionner l'image à une largeur maximale de 800px
    .toFormat('jpeg') // Convertir l'image au format JPEG
    .jpeg({ quality: 80 }) // Compresser l'image avec une qualité de 80%
    .toFile(outputPath, (err, info) => {
      if (err) {
        return next(err);
      }
      // Mettre à jour le chemin de l'image dans la requête
      req.file.path = outputPath;
      req.file.filename = filename;
      next();
    });
};

// Middleware combiné pour le téléchargement et l'optimisation
const uploadAndOptimize = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    optimizeImage(req, res, next);
  });
};

// Exportation du middleware combiné
module.exports = uploadAndOptimize;

