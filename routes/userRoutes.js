// const importG = require('import-global');
const router = require("express").Router();
const userController = require("../controllers/userController");
const { requireAuth } = require("../middlewares/authMiddleware");

// post
router.post("/getTT", userController.getTT);
router.post("/getMyInfo", userController.getMyInfo);
router.post("/getAccType", userController.getAccType);

// get
router.get("/getSysDefaults", requireAuth, userController.getSysDefaults);

module.exports = router;
