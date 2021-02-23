// const importG = require('import-global');
const router = require("express").Router();
const authController = require("../controllers/authController");

// pre-registration
router.get("/preregistration", authController.preRegistration_Get); // to get to preregistration page

router.post("/preregistration", authController.preRegistration_Post); // to submit preregistration data

// registration
// router.get("/registration", authController.registration_Get); // for redirect on valid token auth

router.post("/registration", authController.registration_Post); // for registration proper

// signup
router.get("/signup", authController.signup_Get); // to get token page

router.post("/signup", authController.signup_Post); // to submit token for validation

// login
router.get("/login", authController.login_Get);

router.post("/login", authController.login_Post);

// logout
// router.get('/logout', authController.logout);

module.exports = router;
