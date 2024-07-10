// Importation des modules nécessaires
const bcrypt = require("bcrypt"); // Pour le hachage des mots de passe
const jwt = require("jsonwebtoken"); // Pour la gestion des tokens JWT
const User = require("../models/user"); // Modèle utilisateur

// Fonction pour l'inscription des utilisateurs
exports.signup = (req, res, next) => {
  console.log("Received signup request");

  // Vérification de la présence de l'email et du mot de passe dans la requête
  if (!req.body.email || !req.body.password) {
    console.log("Missing email or password");
    return res.status(400).json({ error: "Email et mot de passe requis" });
  }

  console.log("Email and password provided:", req.body.email);

  // Hachage du mot de passe
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      console.log("Password hashed successfully");

      // Création d'un nouvel utilisateur avec l'email et le mot de passe haché
      const user = new User({
        email: req.body.email,
        password: hash,
      });

      // Sauvegarde de l'utilisateur dans la base de données
      user
        .save()
        .then(() => {
          console.log("User saved successfully");
          res.status(201).json({ message: "Utilisateur créé !" });
        })
        .catch((error) => {
          console.log("Error saving user:", error);
          res.status(400).json({ error });
        });
    })
    .catch((error) => {
      console.log("Error hashing password:", error);
      res.status(500).json({ error });
    });
};

// Fonction pour la connexion des utilisateurs
exports.login = (req, res, next) => {
  // Vérification de la présence de l'email et du mot de passe dans la requête
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ error: "Email et mot de passe requis" });
  }

  // Recherche de l'utilisateur dans la base de données par email
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ message: "Paire identifiant/mot de passe incorrect" });
      }

      // Comparaison du mot de passe de la requête avec le mot de passe haché de l'utilisateur
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ message: "Paire identifiant/mot de passe incorrect" });
          }

          // Génération d'un token JWT pour l'utilisateur
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              process.env.JWT_SECRET || "RANDOM_TOKEN_SECRET",
              { expiresIn: "24h" }
            ),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
