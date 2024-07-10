// Importation de Mongoose pour la gestion de la base de données MongoDB
const mongoose = require("mongoose");

// Définition du schéma de données pour un livre
const bookSchema = mongoose.Schema({
  // Identifiant de l'utilisateur qui a ajouté le livre
  userId: { type: String, required: true },

  // Titre du livre
  title: { type: String, required: true },

  // Auteur du livre
  author: { type: String, required: true },

  // URL de l'image de couverture du livre
  imageUrl: { type: String, required: true },

  // Année de publication du livre
  year: { type: Number, required: true },

  // Genre du livre
  genre: { type: String, required: true },

  // Liste des évaluations du livre
  ratings: [
    {
      // Identifiant de l'utilisateur qui a évalué le livre
      userId: { type: String, required: true },
      
      // Note attribuée au livre
      grade: { type: Number, required: true },
    },
  ],

  // Note moyenne du livre
  averageRating: { type: Number, default: 0 },
});

// Exportation du modèle de livre pour pouvoir l'utiliser dans d'autres fichiers
module.exports = mongoose.model("Book", bookSchema);
