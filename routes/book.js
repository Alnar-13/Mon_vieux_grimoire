const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const bookCtrl = require("../controllers/book");

router.get("/", bookCtrl.getAllBooks);  // Removed auth for public access
router.post("/", auth, multer, bookCtrl.createBook);
router.get("/:id", bookCtrl.getOneBook);  // Removed auth for public access
router.put("/:id", auth, multer, bookCtrl.modifyBook);
router.delete("/:id", auth, bookCtrl.deleteBook);

module.exports = router;
