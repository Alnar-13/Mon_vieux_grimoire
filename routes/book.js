
// Importation des modules nécessaires
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { upload} = require("../middleware/multer-config"); 
const bookCtrl = require("../controllers/book");

// Route pour obtenir tous les livres
router.get("/", bookCtrl.getAllBooks);

// Route pour obtenir les livres avec la meilleure notation
router.get("/bestrating", bookCtrl.getBestRatingBooks);

// Route pour obtenir un livre spécifique par son ID
router.get("/:id", bookCtrl.getOneBook);

// Route pour créer un nouveau livre (nécessite l'authentification et l'utilisation de multer pour le traitement des fichiers)
router.post("/", auth, upload, bookCtrl.createBook);

// Route pour modifier un livre existant par son ID (nécessite l'authentification et l'utilisation de multer pour le traitement des fichiers)
router.put("/:id", auth, upload, bookCtrl.modifyBook);

// Route pour supprimer un livre par son ID (nécessite l'authentification)
router.delete("/:id", auth, bookCtrl.deleteBook);

// Route pour noter un livre (nécessite l'authentification)
router.post("/:id/rating", auth, bookCtrl.rateBook);

// Exportation du routeur pour être utilisé dans d'autres fichiers
module.exports = router;

