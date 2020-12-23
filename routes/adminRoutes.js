// admin routes

const router = require("express").Router();
const adminController = require("../controllers/adminController");

router.post("/getSysDefaults", adminController.sysDefaults);

module.exports = router;