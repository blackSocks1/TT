const schemas = require("../models/schemas");
const Attendance = require("../models/AttSchema");
const users = require("../models/users");

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

  getGroupDetails: async (req, res) => {
    // id_list = ["SWE-L1-LOG", "SWE-L1-AKWA"];
    // _id: { $in: id_list }

    let toSend = [];
    let user = req.body;
    let custQuery = user.accountType == "Student" ? { _id: user.group_id } : {};

    let groups = await schemas.Group.find(custQuery).populate("students").populate("Att");

    for (let group of groups) {
      let studs = [];
      for (let student of group.students) {
        let userStud = await users.User.findOne({ _id: student.user_Ref });
        studs.push({
          _id: userStud._id,
          name: userStud.name,
          group: student.group,
          level: student.level,
          specialty: student.specialty,
        });
      }

      toSend.push({ _id: group._id, students: studs, Att: group.Att });
    }

    res.json(toSend);
  },

  getGroup_ids: async (req, res) => {
    let user = req.body;
    if (user.accountType == "Student") {
    }

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
    let { group_id, requester_id } = req.body;

    let db_att = await Attendance.find({ group_id });

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
