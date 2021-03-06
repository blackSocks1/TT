const schemas = require("../models/schemas");
const { getUserCollection } = require("../myFunctions/npm_fx");

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

        res.json(TT);
      }
    }
  },

  getMyInfo: async (req, res) => {
    let person = req.body;
    let user = await getUserCollection(person);
    if (user && user.accountType == "Student") {
      let group = await schemas.Group.findOne({ _id: user.group });
      user.TT = group.TT;
    }
    res.json(user);
  },

  getAccType: async (req, res) => {
    let user = await getUserCollection(req.body);
    res.json(user ? user.accountType : null);
  },
};

module.exports = userController;
