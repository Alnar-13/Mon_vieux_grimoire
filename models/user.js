// Importation de Mongoose pour la gestion de la base de données MongoDB
const mongoose = require("mongoose");

// Importation du plugin mongoose-unique-validator pour garantir l'unicité des champs
const uniqueValidator = require("mongoose-unique-validator");

// Définition du schéma de données pour un utilisateur
const userSchema = mongoose.Schema({
  // Adresse email de l'utilisateur, doit être unique
  email: { type: String, required: true, unique: true },

  // Mot de passe de l'utilisateur
  password: { type: String, required: true },
});

// Application du plugin uniqueValidator au schéma userSchema pour valider l'unicité de l'email
userSchema.plugin(uniqueValidator);

// Exportation du modèle d'utilisateur pour pouvoir l'utiliser dans d'autres fichiers
module.exports = mongoose.model("User", userSchema);

