const express = require("express");
const mongoose = require("mongoose");

const Thing = require("./models/Thing");

const app = express();

mongoose
  .connect(
    "mongodb+srv://maxime01:testpassword123@cluster0.hgetnuz.mongodb.net/test?retryWrites=true&w=majority"
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch((error) => {
    console.error("Connexion à MongoDB échouée !", error);
    process.exit(1); // Arrêter le serveur en cas d'échec de la connexion
  });

app.use(express.json());

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
  next();
});

app.post("/api/stuff", (req, res) => {
  console.log("Données reçues :", req.body); // Log pour vérifier les données reçues

  delete req.body._id;
  const thing = new Thing({
    ...req.body,
  });
  thing
    .save()
    .then(() => res.status(201).json({ message: "Objet enregistré !" }))
    .catch((error) => res.status(400).json({ error }));
});

app.get("/api/stuff/:id", (req, res, next) => {
  Thing.findOne({ _id: req.params.id })
    .then((thing) => res.status(200).json(thing))
    .catch((error) => res.status(404).json({ error }));
});

app.get("/api/stuff", (req, res) => {
  Thing.find()
    .then((things) => res.status(200).json(things))
    .catch((error) => res.status(400).json({ error }));
});

module.exports = app;
