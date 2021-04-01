// const importG = require('import-global');
const router = require("express").Router();
const authController = require("../controllers/authController");
const { checkAuthenticated, checkNotAuthenticated } = require("../Oath/passport-configs");
const passport = require("passport");

// registration
// router.get("/registration", authController.registration_Get); // for redirect on valid token auth

// router.post("/registration", authController.registration_Post); // for registration proper

// signup
router.get("/register", checkNotAuthenticated, authController.signup_Get); // to get token page

router.post("/register", authController.signup_Post); // to submit token for validation

// login
router.get("/login", checkNotAuthenticated, authController.login_Get);

router.post("/login", authController.login_Post);

router.get("/auth/specialties", authController.get_specialties);

router.get(`/Student`, authController.renderStudent);
router.get(`/Lecturer`, authController.renderLecturer);
router.get(`/Coordinator`, authController.renderCoordinator);
router.get(`/Admin`, authController.renderAdmin);

// logout
// router.get('/logout', authController.logout);

module.exports = router;
