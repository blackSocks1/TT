// const importG = require('import-global');
const router = require("express").Router();
const authController = require("../controllers/authController");
const { requireAuth } = require("../middlewares/authMiddleware");

// registration
// router.get("/registration", authController.registration_Get); // for redirect on valid token auth

// router.post("/registration", authController.registration_Post); // for registration proper

// signup
router.get("/register", requireAuth, authController.signup_Get); // to get token page

router.post("/register", authController.signup_Post); // to submit token for validation

// login
router.get("/login", authController.login_Get);

router.post("/login", authController.login_Post);

router.get("/auth/specialties", authController.get_specialties);

router.post("/userDashboard", authController.login_Post);

// logout
// router.get('/logout', authController.logout);

module.exports = router;
