const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const users = require("../models/users");
const uniqid = require("uniqid");

// const maxAge = 3 * 24 * 60 * 60; // 3 days in secs

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, "school management", (err, decodedToken) => {
      if (err) {
        res.redirect("/login");
      } else {
        next();
      }
    });
  } else {
    res.redirect("/login");
  }
};

const createToken = (id) => {
  return jwt.sign({ id }, "school management", { expiresIn: "1d" });
};

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

const gen_ID = (endPattern = "") => {
  return endPattern ? uniqid.time("u", `-${endPattern}`) : uniqid.time("u");
};

module.exports = {
  requireAuth,
  createToken,
  hashPassword,
  get_db_User,
  get_RefData,
  gen_ID,
  unHashAndCompare,
};
