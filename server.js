// Importation du module http pour créer un serveur HTTP
const http = require("http");

// Importation de l'application express depuis le fichier app.js
const app = require("./app");

// Configuration du port sur lequel le serveur va écouter les requêtes
// Le port est soit celui défini dans les variables d'environnement (process.env.PORT) ou par défaut 4000
app.set("port", process.env.PORT || 4000);

// Création du serveur HTTP en utilisant l'application express
const server = http.createServer(app);

// Le serveur écoute sur le port défini précédemment
server.listen(process.env.PORT || 4000);

