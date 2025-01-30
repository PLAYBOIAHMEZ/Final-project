const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const auth = require("../middleware/auth");
const {
  registerUser,
  loginUser,
  updateProfile,
  getProfile,
  getProfiles,
  handleLike,
} = require("../controllers/userController");

// Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", auth, getProfile);
router.post("/profile", auth, upload.single("image"), updateProfile);
router.get("/profiles", auth, getProfiles);
router.post("/like/:profileId", auth, handleLike);

module.exports = router;
