const { getUserCollection } = require("../myFunctions/npm_fx");
const schemas = require("../models/schemas");

let lecturerController = {
  save: async (req, res) => {
    let lecturer = await getUserCollection(req.body);
    let reponse = { error: "", data: "" };

    try {
      let result;

      if (lecturer) {
        result = await schemas[lecturer.accountType].findOne({ _id: lecturer._id });
        result.avail.defaultAvail = req.body.avail;
        await result.save();
      }

      reponse.data = result.avail.defaultAvail;
    } catch (err) {
      reponse.error = err;
    }

    res.end(JSON.stringify(reponse));
  },
};

module.exports = lecturerController;
