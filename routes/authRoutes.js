// const importG = require('import-global');
const router = require('express').Router();
const authController = require('../controllers/authController');

// post routes
router.post('/login', authController.login);

// router.get('/signup', authController.signupGet);

// router.post('/signup', authController.signupPost);

// router.get('/login', authController.loginGet);

// router.post('/login', authController.loginPost);

// router.get('/logout', authController.logout);

module.exports = router;