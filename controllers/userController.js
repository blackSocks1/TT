const schemas = require("../models/schemas");
const Lecturer = schemas.Lecturer;
const Level = schemas.Level;
const { Oath } = require("../myFunctions/npmFunctions");

let userController = {
  resetAvail: async (req, res) => {
    let lecturer = req.body;
    let lectFromDb = await Lecturer.findOne({
      _id: lecturer._id,
    });
    lectFromDb.avail_TT.currentAvail = lectFromDb.avail_TT.default;

    await lectFromDb.save();
    res.end(JSON.stringify(lectFromDb.avail_TT.currentAvail)); // sending back currentAvail to load it to his interface
  },

  getTT: async (req, res) => {
    let person = req.body;
    let source;
    // console.log(person);

    if (person.accountType === "student") {
      source = await Level.findOne({
        _id: person.level,
      });
    } else if (person.accountType === "lecturer") {
      source = await Lecturer.findOne({
        _id: person._id,
      });
    }

    if (source) {
      if (person.platform === "web") {
        res.end(JSON.stringify(source.TT));
      } else {
        let root = await schemas.Admin.findOne({
          name: "ROOT",
        });
        let noOfPeriods = root.sysDefaults.periods.length;
        let TT = [];

        for (let bigIndex = 0; bigIndex < source.TT.length; bigIndex++) {
          let daysOfWeek = [[], [], [], [], [], [], []];

          for (let i = 0; i <= 6; i++) {
            let counter = 0;
            let initIndex = i;

            while (counter < noOfPeriods) {
              daysOfWeek[i].push(source.TT[bigIndex].periods[initIndex]);
              counter++;
              initIndex += 7;
            }
          }
          TT.push({
            periods: daysOfWeek,
            week: source.TT[bigIndex].week,
          });
        }
        console.log(person._id, TT[TT.length - 1].periods);
        res.end(JSON.stringify(TT));
      }
    }
  },

  getMyInfo: async (req, res) => {
    let person = req.body;
    let user = await Oath(person);
    res.end(JSON.stringify(user));
  },

  getTTGetMethod: (req, res) => {
    Level.findOne({
      _id: "SWE-L2",
    }).then(async (source) => {
      let latestTT = source.TT[source.TT.length - 1];

      if (latestTT) {
        let root = await schemas.Admin.findOne({
          name: "ROOT",
        });
        let noOfPeriods = root.sysDefaults.periods.length;
        let TT = [];

        for (let bigIndex = 0; bigIndex < source.TT.length; bigIndex++) {
          let daysOfWeek = [[], [], [], [], [], [], []];

          for (let i = 0; i <= 6; i++) {
            let counter = 0;
            let initIndex = i;

            while (counter < noOfPeriods) {
              daysOfWeek[i].push(source.TT[bigIndex].periods[initIndex]);
              counter++;
              initIndex += 7;
            }
          }
          TT.push({
            periods: daysOfWeek,
            week: source.TT[bigIndex].week,
          });
        }

        console.log(person._id, TT[TT.length - 1].week);
        res.end(JSON.stringify(TT));
      }
    });
  },
};

module.exports = userController;
