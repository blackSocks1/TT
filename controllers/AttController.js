const schemas = require("../models/schemas");
const Attendance = require("../models/AttSchema");

let AttController = {
  getStudents: async (req, res) => {
    let group = await schemas.Group.findOne({ _id: req.body.group_id }).populate(
      "students",
      "_id name"
    );

    res.json(group.students);
  },

  getCustomClassList: async (req, res) => {
    let group = await schemas.Group.findOne({ _id: req.body.group_id }).populate(
      "students",
      req.body.columns
    );

    res.json(group.students);
  },

  getGroups: async (req, res) => {
    id_list = ["SWE-L1-LOG", "SWE-L1-AKWA"];

    let groups = await schemas.Group.find({ _id: { $in: id_list } })
      .populate("students", "name")
      .populate("attendance");

    let toSend = [];

    groups.forEach((group) => {
      toSend.push({ _id: group._id, students: group.students, Att: group.Att });
    });

    res.json(toSend);
  },

  getAtt: async (req, res) => {
    let { date, group_id, requester_id } = req.body;

    let db_att = await Attendance.find({ group_id, owner: { $in: [group_id, requester_id] } });

    res.json(db_att);
  },

  saveAtt: async (req, res) => {
    let Att = req.body;

    let newAtt = new Attendance({ ...Att });
    await newAtt.save();

    let group = await schemas.Group.findOne({ _id: Att.group_id });
    group.Att.push(newAtt);

    group.markModified("Att");
    await group.save();

    res.json(newAtt);
  },
};

module.exports = AttController;
