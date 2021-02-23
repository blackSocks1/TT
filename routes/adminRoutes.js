// admin routes

const router = require("express").Router();
const adminController = require("../controllers/adminController");

router.get("/getSysDefaults", adminController.getSysDefaults);

router.get("/sys/TT/Defaults", adminController.getSysDefaults);

module.exports = router;
