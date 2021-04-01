const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

const users = require("../models/users");
const uniqid = require("uniqid");
// const passport = require("passport");

function initializePassport(passport, get_db_User) {
  const authUser = async (_id, password, done) => {
    const user = await get_db_User(_id);

    if (user == null) {
      return done(null, false, { message: `No user with id ${_id} was found` });
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        done(null, false, { message: `Wrong password` });
      }
    } catch {
      done(e);
    }
  };

  passport.use(new localStrategy({ usernameField: "_id" }, authUser));

  passport.serializeUser((user, done) => done(null, user._id));

  passport.deserializeUser(async (user, done) => {
    return done(null, await get_db_User(user._id));
  });
}

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt();
  return await bcrypt.hash(password, salt);
};

const get_db_User = async (_id, populated = false) => {
  if (populated) {
    return await users.User.findOne({ _id }).populate([
      "student_Ref",
      "lecturer_Ref",
      "coordinator_Ref",
      "admin_Ref",
    ]);
  } else {
    return await users.User.findOne({ _id });
  }
};

/**
 * - Function to get nested user data
 * - To be used only when the user actually exists
 * @param {*} user dbUser to get nested data
 * @param {*} Attribute user attribute to get
 */
const get_RefData = (user, Attribute = "") => {
  let data;

  if (user.accountType === "Student") {
    data = user.student_Ref[Attribute];
  } else if (user.accountType === "Lecturer") {
    data = user.lecturer_Ref[Attribute];
  } else if (user.accountType === "Coordinator") {
    data = user.coordinator_Ref[Attribute];
  } else if (user.accountType === "Admin") {
    data = user.admin_Ref[Attribute];
  }

  return data;
};

const unHashAndCompare = async (userPassword, dbUserPassword) => {
  return await bcrypt.compare(userPassword, dbUserPassword);
};

const handleErrors = (err) => {
  // console.log(err.message, err.code);
};

const gen_ID = (endPattern = "") => {
  return endPattern ? uniqid.time("u", `-${endPattern}`) : uniqid.time("u");
};

const checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

const checkNotAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect(`${req.user.accountType}`);
  }
  next();
};

module.exports = {
  initializePassport,
  hashPassword,
  handleErrors,
  get_db_User,
  get_RefData,
  gen_ID,
  unHashAndCompare,
  checkAuthenticated,
  checkNotAuthenticated,
};
