// const importG = require('import-global');
const router = require('express').Router();
const userController = require('../controllers/userController')

// post
router.post('/getTT', userController.getTT);
router.post('/resetAvail', userController.resetAvail);

// get
router.get('/getTT', userController.getTTGetMethod);

module.exports = router;