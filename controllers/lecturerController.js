const users = require("../models/users");
const { get_db_User } = require("../middlewares/authMiddleware");

let lecturerController = {
  save: async (req, res) => {
    let lecturer = await get_db_User(req.body);
    let reponse = { error: "", data: "" };

    try {
      let result;

      if (lecturer) {
        if (lecturer.accountType == "Lecturer") {
          result = await users.Lecturer.findOne({ _id: lecturer.lecturer_Ref });
        } else {
          result = await users.Coordinator.findOne({ _id: lecturer.coordinator_Ref });
        }

        result.avail.defaultAvail = req.body.avail;
        await result.save();
      }

      reponse.data = result.avail.defaultAvail;
    } catch (err) {
      console.log(err);
      reponse.error = err;
    }

    res.end(JSON.stringify(reponse));
  },
};

module.exports = lecturerController;
