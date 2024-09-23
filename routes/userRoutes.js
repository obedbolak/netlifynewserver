const express = require("express");
const userController = require("../controllers/userController.js");
const { isAuth } = require("../middlewares/authMiddleware.js");
const { singleUpload } = require("../middlewares/multer.js");
const rateLimit = require("express-rate-limit");

// RATE LIMITER
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // store:..., // Use an external store for consistency across multiple server instances.
});

//router object
const router = express.Router();

// routes
// ============== USER ROUTES ==================

// LOGIN
router.post("/login", limiter, userController.loginController);

// REGISTER
router.post("/register", limiter, userController.registerController);

// LOGOUT
router.get("/logout", isAuth, userController.logoutController);

// GET USER PROFILE
router.get("/profile", isAuth, userController.getUserProfileController);

// UPDATE PROFILE
router.put(
  "/profile",
  isAuth,
  singleUpload,
  userController.updateProfileController
);

// UPDATE PROFILE PICTURE
router.put(
  "/profile/picture",
  isAuth,
  singleUpload,
  userController.updateProfilePicController
);

// UPDATE PASSWORD
router.put("/password", isAuth, userController.udpatePasswordController);

// PASSWORD RESET
router.post("/password/reset", userController.passwordResetController);

// ====================================================================

module.exports = router;
