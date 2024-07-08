const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Correction de la séparation du token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || "RANDOM_TOKEN_SECRET"); // Utilisation de la variable d'environnement pour le secret
    const userId = decodedToken.userId;
    req.auth = {
      userId: userId
    };
    next(); // Appel à next() pour passer au middleware suivant
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized request!' }); // Message d'erreur plus explicite
  }
};
