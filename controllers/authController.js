const { getUserCollection, handleErrors } = require("../myFunctions/npm_fx");
const schemas = require("../models/schemas");
const uniqid = require("uniqid");

/**
 * Authentication Controller
 */
let authController = {
  // sign up
  signup_Get: (req, res) => res.render("registration", { title: " Registration" }),

  signup_Post: async (req, res) => {
    let person = req.body;

    let group = await schemas.Group.findOne({ _id: person.group_id });
    let level = await schemas.Level.findOne({ _id: group.level });
    let specialty = await schemas.Specialty.findOne({ _id: level.specialty });

    let student = new schemas.Student({
      _id: uniqid.time("s", `-${group._id}`),
      name: person.name,
      specialty,
      level,
      group,
      accountType: "Student",
    });

    await student.save();
    group.students.push(student);
    await group.save();
    console.log(`${student.name} was registered in ${student.level._id} with id ${student._id}.`);

    res.locals.user = student;

    res.render(student.accountType);
  },

  // log in
  login_Get: (req, res) => res.render("login", { title: "Login" }),

  login_Post: async (req, res) => {
    let person = req.body;
    let user = await getUserCollection(person);

    if (user) {
      // first check if user is already online at login
      let online = await schemas.OnlineUser.findOne({ online_id: user._id });

      if (!online) {
        if (person.plaform == "mobile") {
          res.json(user);
        } else {
          // **** to be reviewed since we should never send sensitive data like passwords
          res.locals.user = user;
          res.render(user.accountType);
          // req.session.user = user
        }
      } else {
        res.json({ _id: online.online_id, message: "This user is already online" });
      }
    } else {
      res.end(
        JSON.stringify({
          _id: person._id,
          password: person.password,
          found: false,
        })
      );
    }
  },

  logOut: (req, res) => {},

  get_specialties: async (req, res) => {
    let specialties = await schemas.Specialty.find({})
      .populate("levels", "_id groups")
      .populate("groups", "_id");

    let toSend = [];
    specialties.forEach((spec) => {
      toSend.push({ _id: spec._id, levels: spec.levels });
    });
    res.json(toSend);
  },
};

module.exports = authController;
