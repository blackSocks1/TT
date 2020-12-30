//models
const schemas = require('../models/schemas');
const Lecturer = schemas.Lecturer;
const Course = schemas.Course;
const Venue = schemas.Venue;
const Coordinator = schemas.Coordinator;
const Level = schemas.Level;


let coordinatorController = {
  // updates
  updateTT: async (req, res) => {
    let data = req.body;
    let levelId = data[0];
    let TT = data[1];

    let level = await Level.findOne({
      _id: levelId
    });

    if (level) {
      if (level.TT.length === 5) {
        level.TT.shift();
      }
      level.TT.push(TT);
      await level.save();
    }

    res.end(JSON.stringify({
      status: "Ok!"
    }));
  },

  updateCourses: (req, res) => {
    let data = req.body;
    //let levelId = data[0];
    let courseDb = data[1];

    courseDb.forEach(course => {
      Course.findOneAndUpdate({
        name: course.name
      }, {
        $set: {
          timeLeft: course.timeLeft
        }
      }).then((result) => {
        //console.log(`${course.name} updated successfully`)
      });
    })

    res.end();
  },

  updateLecturers: (req, res) => {
    let lecturerBD = req.body;

    lecturerBD.forEach(lecturer => {
      Lecturer.findOne({
        _id: lecturer._id
      }).then(result => {
        if (result) {
          if (result.TT.length === 5) {
            result.TT.shift();
          }
          result.avail_TT.currentAvail = [...lecturer.currentAvail];
          result.TT.push({
            week: lecturer.week,
            cells: lecturer.temp_TT,
            time: lecturer.time
          });
          result.save();
          // console.log(`${result.name}'s TT updated successfully`);
        }
      });
    });
    res.end();
  },

  updateVenues: (req, res) => {
    let venueDb = req.body;
    venueDb.forEach(venue => {
      Venue.findOneAndUpdate({
        _id: venue._id
      }, {
        $set: {
          state: venue.state
        }
      }).then(result => {
        //console.log(result);
      });
    });
  },

  // gets
  getCourses: (req, res) => {
    Course.find({}).then((result) => {
      res.end(JSON.stringify(result));
    });
    //console.log("Courses data sent.")
  },

  getLecturers: (req, res) => {
    Lecturer.find({}).then((result) => {
      res.end(JSON.stringify(result));
    });
    //console.log("Lecturers' data sent.")
  },

  getVenues: (req, res) => {
    Venue.find({}).then((result) => {
      res.end(JSON.stringify(result));
    });
  },

  getLevels: (req, res) => {
    Level.find({}).then((result) => {
      // .populate("students").exec((err, result) => {
      let levelsToSend = [];
      result.forEach(level => {
        levelsToSend.push({
          _id: level._id,
          students: level.students.length,
          TT: level.TT
        });
        // console.log(level._id);
      });
      res.end(JSON.stringify(levelsToSend));
    });
  },

  getMyDefaults: async (req, res) => {
    let coord = await Coordinator.findOne({
      _id: req.body._id
    });
    let root = await schemas.Admin.findOne({
      _id: "ROOT"
    });
    res.end(JSON.stringify({
      week: coord.TT_Defaults.week,
      periods: coord.TT_Defaults.periods,
      weekDays: root.sysDefaults.sysWeekDays
    }));
  },

  setMyDefaults: async (req, res) => {
    let coord = await Coordinator.findOne({
      _id: req.body._id
    });
    coord.TT_Defaults = req.body.TT_Defaults;
    coord.save();
    res.end(JSON.stringify(coord.TT_Defaults));
  }
}

module.exports = coordinatorController;