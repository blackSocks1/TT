const schemas = require("../models/schemas");
// const users = require("../models/users");
const { get_db_User, get_RefData } = require("../middlewares/authMiddleware");

const systemDefaults = require("../models/systemDefaults");

let userController = {
  getTT: async (req, res) => {
    let person = req.body;
    let TT;

    if (person.accountType === "Student") {
      let data = await schemas.Group.findOne({
        _id: person.group_id,
      });
      TT = data.TT;
    } else {
      let user = await get_db_User(person._id, true);

      TT = get_RefData(user, "TT");
    }

    if (TT) {
      if (person.platform === "web") {
        res.end(JSON.stringify(TT));
      } else {
        let root = await schemas.Admin.findOne({
          name: "ROOT",
        });

        let noOfPeriods = root.sysDefaults.periods.length;
        let TT = [];

        for (let bigIndex = 0; bigIndex < TT.TT.length; bigIndex++) {
          let daysOfWeek = [[], [], [], [], [], [], []];

          for (let i = 0; i <= 6; i++) {
            let counter = 0;
            let initIndex = i;

            while (counter < noOfPeriods) {
              daysOfWeek[i].push(TT.TT[bigIndex].periods[initIndex]);
              counter++;
              initIndex += 7;
            }
          }

          TT.push({
            periods: daysOfWeek,
            week: TT.TT[bigIndex].week,
          });
        }

        res.json(TT);
      }
    }
  },

  getMyInfo: async (req, res) => {
    let person = req.body;
    let user = await get_db_User(person, true);
    res.json(user);
  },

  getAccType: async (req, res) => {
    let user = await get_db_User(req.body);
    res.json(user ? user.accountType : null);
  },

  getSysDefaults: async (req, res) => {
    let defaults = await systemDefaults.find({});
    res.json(defaults[0]);
  },
};

module.exports = userController;
