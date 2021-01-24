// admin routes

const router = require("express").Router();
const adminController = require("../controllers/adminController");

router.get("/getSysDefaults", adminController.getSysDefaults);

module.exports = router;