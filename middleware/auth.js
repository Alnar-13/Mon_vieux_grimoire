// Importation de jsonwebtoken pour gérer les tokens JWT
const jwt = require("jsonwebtoken");

// Middleware d'authentification pour vérifier les tokens JWT
module.exports = (req, res, next) => {
  try {
    // Extraction du token depuis les en-têtes de la requête
    const token = req.headers.authorization.split(" ")[1];

    // Vérification et décodage du token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || "RANDOM_TOKEN_SECRET");

    // Extraction de l'userId du token décodé
    const userId = decodedToken.userId;

    // Ajout de l'userId à l'objet req.auth pour l'utiliser dans les prochains middlewares ou routes
    req.auth = { userId: userId };

    // Passage au middleware suivant
    next();
  } catch (error) {
    // En cas d'erreur (token invalide ou absent), envoi d'une réponse 401 Unauthorized
    res.status(401).json({ error: 'Unauthorized request!' });
  }
};
