
// Importation des modules nécessaires
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bookRoutes = require("./routes/book");
const userRoutes = require("./routes/user");
require("dotenv").config(); // Chargement des variables d'environnement depuis un fichier .env

// Création d'une instance de l'application Express
const app = express();

// Connexion à la base de données MongoDB en utilisant l'URL définie dans les variables d'environnement
mongoose
  .connect(process.env.MONGOURL)
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch((error) => {
    console.error("Connexion à MongoDB échouée !", error);
    process.exit(1); // Arrêt du processus en cas d'échec de la connexion
  });

// Middleware pour analyser le corps des requêtes en JSON
app.use(express.json());

// Middleware pour analyser les données URL-encodées
app.use(express.urlencoded({ extended: true }));

// Middleware pour configurer les en-têtes CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next(); // Passe au middleware suivant
});

// Définition de la route principale
app.get("/", (req, res) => {
  res.status(200).send("Route principale fonctionne !");
});

// Définition des routes pour les livres et les utilisateurs
app.use("/api/books", bookRoutes);
app.use("/api/auth", userRoutes);

// Gestion des fichiers statiques dans le dossier images
app.use("/images", express.static(path.join(__dirname, "images")));

// Exportation de l'application Express pour être utilisée dans d'autres fichiers
module.exports = app;
