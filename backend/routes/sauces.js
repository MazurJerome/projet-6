const express = require("express");
const route = express.Router();
const auth = require("../middleware/auth");
const multer = require("../middleware/multer_config");
const sauceCtrl = require("../controllers/sauces");

route.get("/:id", auth, sauceCtrl.getOneSauce);
route.get("/", auth, sauceCtrl.getAllSauce);
route.post("/", auth, multer, sauceCtrl.createSauce);
route.put("/:id", auth, multer, sauceCtrl.modifySauce);
route.delete("/:id", auth, sauceCtrl.deleteSauce);
route.post("/:id/like", auth, sauceCtrl.modifyLikes);

module.exports = route;
