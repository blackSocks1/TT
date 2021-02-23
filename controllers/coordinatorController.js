//models
const schemas = require("../models/schemas");
const { findElement } = require("../myFunctions/npm_fx");

let coordinatorController = {
  // updates
  updateTT: async (req, res) => {
    let data = req.body;
    let group_id = data.group_id;
    let newTT = data.TT;

    let group = await schemas.Group.findOne({ _id: group_id });
    let answer = findElement("week", newTT.week, group.TT);

    if (answer) {
      let oldTT = answer.element;
      group.TT[answer.index] = {
        week: newTT.week,
        periods: [...newTT.periods],
        oldPeriods: [...oldTT.periods],
        oDate: oldTT.uDate,
        uDate: newTT.uDate,
      };

      group.markModified("TT");
    } else {
      if (group.TT.length === 5) {
        group.TT.shift();
      }
      group.TT.push({
        week: newTT.week,
        periods: newTT.periods,
        uDate: newTT.uDate,
        oldPeriods: [],
        oDate: "",
      });
    }

    group.TT = Array.from(group.TT).sort((a, b) => {
      // return (a.name === b.name) ? 0 : a.name < b.name ? -1 : 1;
      if (a.week.firstDay === b.week.firstDay) {
        return 0;
      } else {
        return a.week.firstDay < b.week.firstDay ? -1 : 1;
      }
    });

    await group.save();
    res.json(newTT);
  },

  updateCourse: async (req, res) => {
    let { course } = req.body;

    let result = await schemas.Course.findOne({ _id: course._id });
    result.time.left = course.time.left;
    result.time.week = course.time.week;

    result.markModified("time");

    await result.save();

    res.json(result);
  },

  updateLecturers: async (req, res) => {
    let lecturerBD = req.body.lecturers;
    let coord_id = req.body.coord_id;

    // let coord = findElement("_id", coord_id, lecturerBD);
    // if (coord) {
    //   let index = coord.index;
    //   coord = coord.element;
    //   lecturerBD.splice(index, 1);
    //   let db_coord = await schemas.Coordinator.findOne({ _id: coord._id });
    // }

    for (let lecturer of lecturerBD) {
      // we're fetching the lecturer form schemas[lecturer.accountType] because a lecturer could also be a coordinator

      let result = await schemas[lecturer.accountType].findOne({ _id: lecturer._id });
      let answer = findElement("week", lecturer.week, result.TT);

      if (answer) {
        let oldTT = answer.element;
        result.TT[answer.index] = {
          week: lecturer.week,
          periods: [...lecturer.periods],
          oldPeriods: [...oldTT.periods],
          oDate: oldTT.uDate,
          uDate: lecturer.uDate,
        };

        result.markModified("TT");
      } else {
        if (result.TT.length === 5) {
          result.TT.shift();
        }

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

    res.json(lecturerBD);
  },

  updateVenue: async (req, res) => {
    let { week, venue } = req.body;

    // for (let venue of venueDb) {
    let dbVenue = await schemas.Venue.findOne({ _id: venue._id });
    console.log(dbVenue._id);

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
    // }
    res.json(venue);
  },

  // gets
  getSpecialties: (req, res) => {
    schemas.Specialty.find({})
      .populate("courses")
      .exec((err, result) => res.json(result));
  },

  getLecturers: async (req, res) => {
    let coord = await schemas.Coordinator.findOne({ _id: req.body._id });
    let lecturers = await schemas.Lecturer.find({});
    lecturers.push(coord);
    res.json(lecturers);
  },

  getVenues: async (req, res) => {
    let venues = await schemas.Venue.find({});
    res.json(venues);
  },

  getGroups: async (req, res) => {
    let coord = req.body;
    let specialties = await schemas.Specialty.find({ coordinator: coord._id });
    let groupsToSend = [];

    for (let specialty of specialties) {
      for (let level of specialty.levels) {
        let groups = await schemas.Group.find({ level }).populate("courses", "_id name group time");
        for (let group of groups) {
          groupsToSend.push({
            _id: group._id,
            students: group.students.length,
            TT: group.TT,
            courses: group.courses,
            campus: group.campus,
          });
        }
      }
    }
    res.json(groupsToSend);
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
