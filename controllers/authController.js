const schemas = require("../models/schemas");
const users = require("../models/users");
const {
  checkAuth,
  createToken,
  get_db_User,
  gen_ID,
  hashPassword,
  unHashAndCompare,
} = require("../middlewares/authMiddleware");

const maxAge = 3 * 24 * 60 * 60; // 3 days in secs

/**
 *
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

    person.password = await hashPassword(person.password);

    person = {
      _id: gen_ID(group._id),
      name: person.name,
      specialty,
      level,
      group,
      accountType: "Student",
      password: person.password,
    };

    let newUser = await users.User.create({ ...person });
    person.user_Ref = newUser;
    delete person._id;
    let newStudent = await users.Student.create({ ...person });

    await newStudent.save();
    newUser.student_Ref = newStudent;
    await newUser.save();

    group.students.push(newStudent);
    await group.save();

    console.log(
      `${newUser.name} was registered in ${newStudent.group._id} with id ${newStudent._id}.`
    );

    // res.json({newUser, newStudent});
    res.end("OK!");
  },

  // log in
  login_Get: (req, res) => res.render("landing page", { title: "Login Page", login: true }),

  login_Post: async (req, res) => {
    let person = req.body;
    let user = await get_db_User(person._id, true);
    let authResponse = {};

    if (user) {
      // first check if user is already online at login
      // let online = await users.OnlineUser.findOne({ online_id: user._id });

      let match = await unHashAndCompare(person.password, user.password);

      if (match) {
        authResponse.accountType = user.accountType;
      } else {
        authResponse.error = "Invalid user id or password";
      }
    } else {
      authResponse.error = "Invalid user id or password";
    }
    res.json(authResponse);
  },

  renderDashboard: async (req, res) => {
    let user = await get_db_User(req.body._id, true);

    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 3000 });
    res.locals.user = user;
    res.render(user.accountType);
  },

  logOut: (req, res) => {
    req.logOut();
    req.redirect("/login");
  },

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
