let router = require("express").Router();
let lecturerController = require("../controllers/lecturerController");
// const { requireAuth } = require("../middlewares/authMiddleware");

router.post("/saveAvail", lecturerController.save);
router.post("/getAvail", lecturerController.getAvail);

module.exports = router;
