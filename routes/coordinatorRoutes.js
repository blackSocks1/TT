// coordinatorController

const router = require('express').Router();
const coordinatorController = require('../controllers/coordinatorController');

router.get('/coord', (req, res) => {
  res.render('coord');
});

//gets
router.get('/get-courses', coordinatorController.getCourses);

router.get('/get-lecturers', coordinatorController.getLecturers);

router.get('/get-venues', coordinatorController.getVenues);

router.get('/get-levels', coordinatorController.getLevels);

//posts
router.post('/TT-upLevelTT', coordinatorController.updateTT);

router.post('/TT-upCourses', coordinatorController.updateCourses);

router.post('/TT-upLecturers', coordinatorController.updateLecturers);

router.post('/TT-upVenues', coordinatorController.updateVenues);

router.post('/getMyDefaults', coordinatorController.getMyDefaults);

router.post('/setMyDefaults', coordinatorController.setMyDefaults);

module.exports = router;