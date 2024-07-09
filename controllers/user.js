const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.signup = (req, res, next) => {
  console.log("Received signup request");
  if (!req.body.email || !req.body.password) {
    console.log("Missing email or password");
    return res.status(400).json({ error: "Email et mot de passe requis" });
  }

  console.log("Email and password provided:", req.body.email);

  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      console.log("Password hashed successfully");
      const user = new User({
        email: req.body.email,
        password: hash,
      });
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

exports.login = (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ error: "Email et mot de passe requis" });
  }

  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ message: "Paire identifiant/mot de passe incorrect" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ message: "Paire identifiant/mot de passe incorrect" });
          }
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
