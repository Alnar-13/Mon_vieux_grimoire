const Thing = require("../models/Thing.js");
const fs = require("fs");

exports.createThing = (req, res) => {
  try {
    console.log("req.body:", req.body); // Log pour inspecter req.body
    console.log("req.file:", req.file); // Log pour inspecter req.file

    if (!req.body && !req.file) {
      throw new Error("No thing or file provided in the request body");
    }

    let thingObject;
    if (req.file) {
      thingObject = JSON.parse(req.body.thing);
    } else {
      thingObject = req.body;
    }

    delete thingObject._id;
    delete thingObject._userId;

    const thing = new Thing({
      ...thingObject,
      userId: req.auth.userId,
      imageUrl: req.file
        ? `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
        : req.body.imageUrl,
    });

    thing
      .save()
      .then(() => res.status(201).json({ message: "Objet enregistré !" }))
      .catch((error) => {
        console.error("Error saving thing:", error);
        res.status(400).json({ error });
      });
  } catch (error) {
    console.error("Error in createThing:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.modifyThing = (req, res, next) => {
  const thingObject = req.file
    ? {
        ...JSON.parse(req.body.thing),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete thingObject._userId;
  Thing.findOne({ _id: req.params.id })
    .then((thing) => {
      if (thing.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        Thing.updateOne(
          { _id: req.params.id },
          { ...thingObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Objet modifié!" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteThing = (req, res, next) => {
  Thing.findOne({ _id: req.params.id })
    .then((thing) => {
      if (thing.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        const filename = thing.imageUrl.split("/images/")[1];
        console.log(filename);
        fs.unlink(`images/${filename}`, () => {
          console.log("ok");
          Thing.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Objet supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getOneThing = (req, res, next) => {
  try {
    Thing.findOne({ _id: req.params.id })
      .then((thing) => {
        if (!thing) {
          return res.status(404).json({ error: "Objet non trouvé !" });
        }
        res.status(200).json(thing);
      })
      .catch((error) => {
        console.error("Error finding thing:", error);
        res.status(404).json({ error });
      });
  } catch (error) {
    console.error("Error in getOneThing:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAllThings = (req, res) => {
  try {
    Thing.find()
      .then((things) => res.status(200).json(things))
      .catch((error) => {
        console.error("Error getting all things:", error);
        res.status(400).json({ error });
      });
  } catch (error) {
    console.error("Error in getAllThings:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
