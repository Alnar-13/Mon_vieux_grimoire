// Importation du module multer pour le traitement des fichiers
const multer = require("multer");
// Importation du module sharp pour optimiser les images
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

// Définition des types MIME et des extensions de fichier correspondantes
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

// Configuration du stockage pour multer
const storage = multer.diskStorage({
  // Définition du dossier de destination pour les fichiers téléchargés
  destination: (req, file, callback) => {
    callback(null, "images");
  },

  // Configuration du nom de fichier pour éviter les conflits de noms
  filename: (req, file, callback) => {
    // Remplacement des espaces par des underscores et suppression des caractères non autorisés
    const name = file.originalname.split(" ").join("_").replace(/[^a-zA-Z0-9_\-\.]/g, '');
    
    // Récupération de l'extension du fichier en fonction de son type MIME
    const extension = MIME_TYPES[file.mimetype];
    
    // Génération du nom de fichier final avec un timestamp pour garantir l'unicité
    callback(null, name + Date.now() + "." + extension);
  },
});

// Middleware multer pour le téléchargement de fichiers
const upload = multer({ storage }).single("image");

// Middleware pour optimiser l'image après le téléchargement
// const optimizeImage = (req, res, next) => {
//   if (!req.file) {
//     return next();
//   }

//   const outputPath = path.join("images", req.file.filename);

//   sharp(req.file.path)
//     .resize(800) // Redimensionner l'image à une largeur maximale de 800px
//     .toFormat('jpeg') // Convertir l'image au format JPEG
//     .jpeg({ quality: 80 }) // Compresser l'image avec une qualité de 80%
//     .toFile(outputPath, (err, info) => {
//       if (err) {
//         return next(err);
//       }
//       // Supprimer le fichier original non optimisé
//       fs.unlink(req.file.path, (unlinkErr) => {
//         if (unlinkErr) {
//           return next(unlinkErr);
//         }
//         // Mettre à jour le chemin de l'image dans la requête
//         req.file.path = outputPath;
//         req.file.filename = path.basename(outputPath);
//         next();
//       });
//     });
// };

// Exportation de la configuration multer et du middleware d'optimisation pour être utilisés comme middlewares dans les routes
module.exports = { upload};
