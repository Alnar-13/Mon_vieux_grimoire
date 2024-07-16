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
  // Création de l'objet bookObject en fonction de la présence ou non d'un fichier dans la requête
  const bookObject = req.file ? JSON.parse(req.body.book) : req.body;

  // Suppression des champs _id et userId pour éviter des modifications non autorisées
  delete bookObject._id;
  delete bookObject.userId;

  // Création d'une nouvelle instance de Book avec les données fournies
  const book = new Book({
    // Copie des propriétés de bookObject dans la nouvelle instance de Book
    ...bookObject,
    // Ajout de l'userId de l'utilisateur authentifié à l'objet book
    userId: req.auth.userId,
    // Ajout de l'URL de l'image en fonction de la présence ou non d'un fichier dans la requête
    imageUrl: req.file ? `${req.protocol}://${req.get("host")}/images/${req.file.filename}` : req.body.imageUrl,
    // Initialisation de la note moyenne et du tableau des évaluations
    averageRating: 0, // Modifier sa pour mettre a jours 
    ratings: [], 
  });

  // Sauvegarde du nouveau livre dans la base de données
  book.save()
    .then(() => res.status(201).json({ message: "Livre enregistré !" }))  // Envoi d'une réponse de succès avec le statut 201
    .catch((error) => res.status(400).json({ error }));  // Envoi d'une réponse d'erreur en cas d'échec de la sauvegarde
};


// Fonction pour modifier un livre existant
exports.modifyBook = (req, res) => {
  // Création de l'objet bookObject en fonction de la présence ou non d'un fichier dans la requête
  const bookObject = req.file ? {
    // Si un fichier est présent, on parse les données JSON du livre et on ajoute l'URL de l'image
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
  } : { 
    // Sinon, on copie simplement les données du corps de la requête
    ...req.body 
  };

  // Suppression de l'ID de l'utilisateur du bookObject pour éviter des modifications non autorisées
  delete bookObject.userId;

  // Recherche du livre par son ID
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Vérification si l'utilisateur qui fait la demande est bien celui qui a créé le livre
      if (book.userId != req.auth.userId) {
        // Si l'utilisateur n'est pas autorisé, renvoyer un statut 403 (forbidden)
        res.status(403).json({ message: "Demande non autorisée" });
      } else {
        // Si l'utilisateur est autorisé, mise à jour du livre avec les nouvelles données
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
        res.status(403).json({ message: "Demande non autorisée" });
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
        return res.status(403).json({ message: "L'utilisateur a déjà évalué ce livre" });
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


