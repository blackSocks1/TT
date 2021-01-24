//models
const schemas = require("../models/schemas");
const { findElement } = require("../myFunctions/npmFunctions");

let coordinatorController = {
  // updates
  updateTT: async (req, res) => {
    let data = req.body;
    let levelId = data.level;
    let newTT = data.TT;

    let level = await schemas.Level.findOne({ _id: levelId });
    let answer = findElement("week", newTT.week, level.TT);

    if (answer) {
      let oldTT = answer.element;
      let allTTs = [];

      // assigning newPeriods to periods and incoming uDate to current uDate
      // setting old TT last mod date to previous  and vice versa

      for (let TT of level.TT) {
        if (TT.week.firstDay === newTT.week.firstDay) {
          allTTs.push({
            week: newTT.week,
            periods: [...newTT.periods],
            oldPeriods: [...oldTT.periods],
            oDate: oldTT.uDate,
            uDate: newTT.uDate,
          });
        } else {
          allTTs.push(TT);
        }
      }

      level.TT = [...allTTs];
    } else if (level.TT.length === 5) {
      level.TT.shift();
      level.TT.push({
        week: newTT.week,
        periods: newTT.periods,
        uDate: newTT.uDate,
        oldPeriods: [],
        oDate: "",
      });
    } else {
      level.TT.push({
        week: newTT.week,
        periods: newTT.periods,
        uDate: newTT.uDate,
        oldPeriods: [],
        oDate: "",
      });
    }

    level.TT = Array.from(level.TT).sort((a, b) => {
      // return (a.name === b.name) ? 0 : a.name < b.name ? -1 : 1;
      if (a.week.firstDay === b.week.firstDay) {
        return 0;
      } else {
        return a.week.firstDay < b.week.firstDay ? -1 : 1;
      }
    });

    await level.save();
    res.end(
      JSON.stringify({
        status: "Ok!",
      })
    );
  },

  updateCourses: async (req, res) => {
    let data = req.body;
    let courseDb = data.courseDb;

    for (course of courseDb) {
      let result = await schemas.Course.findOne({ _id: course._id });
      result.timeLeft = course.timeInWeek;
      await result.save();
    }
    res.end();
  },

  updateLecturers: async (req, res) => {
    let lecturerBD = req.body;

    for (let lecturer of lecturerBD) {
      let result = await schemas.Lecturer.findOne({ _id: lecturer._id });
      let answer = findElement("week", lecturer.week, result.TT);

      if (answer) {
        let oldTT = answer.element;
        let allTTs = [];

        // assigning newPeriods to periods and incoming uDate to current uDate
        // setting old TT last mod date to previous and vice versa

        for (let TT of result.TT) {
          if (TT.week.firstDay === lecturer.week.firstDay) {
            console.log("updating");
            allTTs.push({
              week: lecturer.week,
              periods: [...lecturer.periods],
              oldPeriods: [...oldTT.periods],
              oDate: oldTT.uDate,
              uDate: lecturer.uDate,
            });
          } else {
            allTTs.push(TT);
          }
        }

        result.TT = [...allTTs];
      } else if (result.TT.length === 5) {
        result.TT.shift();
        result.TT.push({
          week: lecturer.week,
          periods: lecturer.periods,
          uDate: lecturer.uDate,
          oldPeriods: [],
          oDate: "",
        });
      } else {
        result.TT.push({
          week: lecturer.week,
          periods: lecturer.periods,
          uDate: lecturer.uDate,
          oldPeriods: [],
          oDate: "",
        });
      }

      result.TT = Array.from(result.TT).sort((a, b) => {
        // return (a.name === b.name) ? 0 : a.name < b.name ? -1 : 1;
        if (a.week.firstDay === b.week.firstDay) {
          return 0;
        } else {
          return a.week.firstDay < b.week.firstDay ? -1 : 1;
        }
      });

      result.avail.weekAvail = lecturer.avail;
      result.avail.weekAvail = Array.from(result.avail.weekAvail).sort((a, b) => {
        // return (a.name === b.name) ? 0 : a.name < b.name ? -1 : 1;
        if (a.week.firstDay === b.week.firstDay) {
          return 0;
        } else {
          return a.week.firstDay < b.week.firstDay ? -1 : 1;
        }
      });

      await result.save();
    }
    res.end();
  },

  updateVenues: async (req, res) => {
    let venueDb = req.body.venues;
    let week = req.body.week;
    for (let venue of venueDb) {
      let dbVenue = await schemas.Venue.findOne({ _id: venue._id });

      let newProgram = findElement("week", week, dbVenue.programs);
      if (newProgram) {
        dbVenue.programs[newProgram.index] = venue.programs[newProgram.index];
      } else {
        if (dbVenue.programs.length === 2) {
          dbVenue.programs.shift();
        }
        dbVenue.programs.push(findElement("week", week, venue.programs).element);
      }
      dbVenue.save();
    }
  },

  // gets
  getSpecialties: (req, res) => {
    schemas.Specialty.find({})
      .populate("courses")
      .exec((err, result) => res.end(JSON.stringify(result)));
  },

  getLecturers: async (req, res) => {
    let coord = await schemas.Coordinator.findOne({ _id: req.body._id });
    let lecturers = await schemas.Lecturer.find({});
    lecturers.push(coord);
    res.end(JSON.stringify(lecturers));
  },

  getVenues: async (req, res) => {
    let venues = await schemas.Venue.find({});
    res.end(JSON.stringify(venues));
  },

  getLevels: async (req, res) => {
    let coord = req.body;
    let specialties = await schemas.Specialty.find({ coordinator: coord._id });
    let levelsToSend = [];

    for (let specialty of specialties) {
      for (let level of specialty.levels) {
        level = await schemas.Level.findOne({ _id: level }).populate("courses");
        levelsToSend.push({
          _id: level._id,
          students: level.students.length,
          TT: level.TT,
          courses: level.courses,
        });
      }
    }
    res.end(JSON.stringify(levelsToSend));
  },

  getMyDefaults: async (req, res) => {
    let coord = await schemas.Coordinator.findOne({
      _id: req.body._id,
    });
    let root = await schemas.Admin.findOne({
      _id: "ROOT",
    });
    res.end(
      JSON.stringify({
        week: coord.TT_Defaults.week,
        periods: coord.TT_Defaults.periods,
        weekDays: root.sysDefaults.weekDays,
      })
    );
  },

  setMyDefaults: async (req, res) => {
    let coord = await schemas.Coordinator.findOne({
      _id: req.body._id,
    });
    coord.TT_Defaults = req.body.TT_Defaults;
    coord.save();
    res.end(JSON.stringify(coord.TT_Defaults));
  },

  setLastSeen: async (req, res) => {
    let Me = req.body;
    let result = await schemas.Coordinator.findOne({
      _id: Me._id,
    });
    result.lastSeen = Me.lastSeen;
    await result.save();
    res.end(JSON.stringify(result.lastSeen));
  },

  getLastSeen: async (req, res) => {
    let Me = req.body;
    let result = await schemas.Coordinator.findOne({
      _id: Me._id,
    });
    res.end(JSON.stringify(result.lastSeen));
  },

  getDrafts: async (req, res) => {
    let Me = req.body;
    let result = await schemas.Coordinator.findOne({
      _id: Me._id,
    });
    res.end(JSON.stringify(result.TTdrafts));
  },

  saveTTDrafts: async (req, res) => {
    let Me = req.body;
    let result = await schemas.Coordinator.findOne({
      _id: Me._id,
    });
    result.TTdrafts = Me.TTdrafts;
    await result.save();
    res.end(JSON.stringify(result.TTdrafts));
  },
};

module.exports = coordinatorController;
