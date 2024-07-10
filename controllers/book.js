// Importation des modèles et modules nécessaires
const Book = require("../models/Book");
const fs = require("fs");

// Fonction pour récupérer tous les livres
exports.getAllBooks = (req, res) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

// Fonction pour récupérer un livre par son ID
exports.getOneBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

// Fonction pour récupérer les livres avec les meilleures notes
exports.getBestRatingBooks = (req, res) => {
   // Recherche des livres, tri par note moyenne décroissante, et limitation à 3 résultats
  Book.find().sort({ averageRating: -1 }).limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

// Fonction pour créer un nouveau livre
exports.createBook = (req, res) => {
  const bookObject = req.file ? JSON.parse(req.body.book) : req.body;
  delete bookObject._id;
  delete bookObject.userId;

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: req.file ? `${req.protocol}://${req.get("host")}/images/${req.file.filename}` : req.body.imageUrl,
    averageRating: 0,
    ratings: [],
  });

  book.save()
    .then(() => res.status(201).json({ message: "Livre enregistré !" }))
    .catch((error) => res.status(400).json({ error }));
};

// Fonction pour modifier un livre existant
exports.modifyBook = (req, res) => {
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
  } : { ...req.body };

  delete bookObject.userId;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: "Unauthorized request" });
      } else {
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: "Livre modifié !" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => res.status(400).json({ error }));
};

// Fonction pour supprimer un livre
exports.deleteBook = (req, res) => {
  // Recherche du livre par son ID
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Vérification de l'authenticité de l'utilisateur
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: "Unauthorized request" });
      } else {
        // Extraction du nom de fichier de l'image à partir de l'URL de l'image
        const filename = book.imageUrl.split("/images/")[1];

        // Suppression du fichier image du dossier images
        fs.unlink(`images/${filename}`, () => {
          // Suppression du livre de la base de données
          Book.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "Livre supprimé !" }))
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

// Fonction pour noter un livre
exports.rateBook = (req, res) => {
  const rating = { userId: req.auth.userId, grade: req.body.rating };

  // Recherche du livre par son ID
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Vérification si l'utilisateur a déjà noté ce livre
      if (book.ratings.find(r => r.userId === req.auth.userId)) {
        return res.status(403).json({ message: "User has already rated this book" });
      }

      // Ajout de la note à la liste des évaluations
      book.ratings.push(rating);

      // Recalcul de la note moyenne
      book.averageRating = book.ratings.reduce((sum, rating) => sum + rating.grade, 0) / book.ratings.length;

      // Sauvegarde du livre avec les nouvelles évaluations
      book.save()
        .then(() => res.status(200).json(book))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(404).json({ error }));
};


