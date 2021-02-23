// const importG = require('import-global');
const router = require("express").Router();
const userController = require("../controllers/userController");

// post
router.post("/getTT", userController.getTT);
router.post("/getMyInfo", userController.getMyInfo);
router.post("/getAccType", userController.getAccType);

module.exports = router;
