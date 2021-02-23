const schemas = require("../models/schemas");
const { Oath } = require("../myFunctions/npm_fx");

let userController = {
  getTT: async (req, res) => {
    let person = req.body;
    let source;

    if (person.accountType === "Student") {
      source = await schemas.Group.findOne({
        _id: person.group_id,
      });
    } else {
      source = await schemas[person.accountType].findOne({
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
    if (user && user.accountType == "Student") {
      let group = await schemas.Group.findOne({ _id: user.group });
      user.TT = group.TT;
    }
    res.end(JSON.stringify(user));
  },

  getAccType: async (req, res) => {
    let user = await Oath(req.body);
    res.end(JSON.stringify(user ? user.accountType : null));
  },
};

module.exports = userController;
