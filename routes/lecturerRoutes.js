let router = require("express").Router();
let lecturerController = require("../controllers/lecturerController");

router.post("/saveAvail", lecturerController.save);

module.exports = router;
