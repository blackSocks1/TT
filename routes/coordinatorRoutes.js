// coordinatorController
const router = require("express").Router();
const coordinatorController = require("../controllers/coordinatorController");

router.get("/", (req, res) => {
  res.render("coord");
});

// gets
router.get("/get-specialties", coordinatorController.getSpecialties);
router.post("/get-venues", coordinatorController.getVenues);

// posts
router.post("/get-groups", coordinatorController.getGroups);
router.post("/get-lecturers", coordinatorController.getLecturers);

router.post("/upGroupTT", coordinatorController.updateTT);

router.post("/TT-upCourse", coordinatorController.updateCourse);

router.post("/TT-upLecturers", coordinatorController.updateLecturers);

router.post("/TT-upVenues", coordinatorController.updateVenue);

router.post("/getMyDefaults", coordinatorController.getMyDefaults);

router.post("/setMyDefaults", coordinatorController.setMyDefaults);

router.post("/getLastSeen", coordinatorController.getLastSeen);

router.post("/setLastSeen", coordinatorController.setLastSeen);

router.post("/getDrafts", coordinatorController.getDrafts);

router.post("/saveTTDrafts", coordinatorController.saveTTDrafts);

module.exports = router;
