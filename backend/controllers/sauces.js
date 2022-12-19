const Sauce = require("../models/Sauces");
const fs = require("fs");

// creation d une sauce
exports.createSauce = (req, res, next) => {
  const sauceObjet = JSON.parse(req.body.sauce);
  delete sauceObjet._id;
  delete sauceObjet._userId;
  const sauce = new Sauce({
    ...sauceObjet,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  sauce.likes = 0;
  sauce.dislikes = 0;

  sauce
    .save()
    .then(() => res.status(201).json({ message: "objet sauvegardé" }))
    .catch((error) => res.status(400).json({ error }));
};

//recuperation d une seule sauce
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

//recuperation de toutes les sauces
exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

//modification d une sauce
exports.modifySauce = (req, res, next) => {
  const sauceObjet = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete sauceObjet._userId;
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      //si celui qui veut la modifier est bien le createur
      if (sauce.userId != req.auth.userId) {
        res.status(403).json({ message: "non-authorisé" });
      } else {
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObjet, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Objet modifié !" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => res.status(400).json({ error }));
};

//suppression d une sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      //si celui qui veut la modifier est bien le createur
      if (sauce.userId != req.auth.userId) {
        res.status(403).json({ message: "non-authorisé" });
      } else {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "Objet supprimé !" }))
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => res.status(400).json({ error }));
};

//gestion des likes et dislikes
exports.modifyLikes = (req, res, next) => {
  const userLike = req.body;

  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (userLike.like === 1) {
        sauce.usersLiked.push(userLike.userId);
        sauce.likes = sauce.usersLiked.length;
        sauce.save();
      } else if (userLike.like === -1) {
        console.log("dislike");
        sauce.usersDisliked.push(userLike.userId);
        sauce.dislikes = sauce.usersDisliked.length;
        sauce.save();
      } else if (userLike.like === 0) {
        // on verifie si le userId est present dans le tableau des userlikes
        //et les tableau des userdislikes, puis on le supprime si besoin
        const uLike = sauce.usersLiked.indexOf(userLike.userId);
        const uDisLike = sauce.usersDisliked.indexOf(userLike.userId);

        if (uLike != -1) {
          sauce.usersLiked.splice(uLike, 1);
          sauce.likes = sauce.usersLiked.length;
          sauce.dislikes = sauce.usersDisliked.length;
          sauce.save();
        }
        if (uDisLike != -1) {
          sauce.usersDisliked.splice(uDisLike, 1);
          sauce.likes = sauce.usersLiked.length;
          sauce.dislikes = sauce.usersDisliked.length;
          sauce.save();
        }
      }
      res.status(200).json({ message: "Objet modifié !" });
    })
    .catch((error) => res.status(401).json({ error }));
};
