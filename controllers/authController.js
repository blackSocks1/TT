const { getUserCollection, handleErrors } = require("../myFunctions/npm_fx");
const preRegStudent = require("../models/preRegStudent");

let authController = {
  // preregistration
  preRegistration_Get: (req, res) => res.render("preregistration", { title: "Pre-Registration" }),

  preRegistration_Post: async (req, res) => {
    const { name, dob, department, cycle, specialty, level, email, phoneNum } = req.body;

    try {
      let preStud = await preRegStudent.create({
        name,
        dob,
        department,
        cycle,
        specialty,
        level,
        email,
        phoneNum,
      });

      res.status(201).json(preStud);
    } catch (err) {
      handleErrors(err);
      res.status(400).json(err);
    }

    // console.log(preStud);
    res.end();
  },

  // registration
  registration_Post: (req, res) => {},

  // registration_Get: (req, res) => res.render("registration", { title: " Registration" }),

  // sign up
  signup_Get: (req, res) => res.render("signup", { title: "Token Validation" }),

  signup_Post: (req, res) => {
    let { token } = req.body;

    console.log(token);

    if (token) {
      res.render("registration", { title: " Registration" });
    } else {
      res.json({ message: `'${token}' is an invalid token!` });
    }
  },

  // log in
  login_Get: (req, res) => res.render("login", { title: "Login" }),

  login_Post: async (req, res) => {
    let person = req.body;
    let user = await getUserCollection(person);
    // console.log(person);

    if (user) {
      res.locals.user = user;

      if (person.platform === "web" && person.accountType === "Coordinator") {
        user.platform = "web";
        res.render("Coordinator");
      } else if (person.platform === "web" && person.accountType === "Lecturer") {
        user.platform = "web";
        res.render("Lecturer");
      } else if (person.platform === "web" && person.accountType === "Student") {
        user.platform = "web";
        res.render("Student");
      } else if (person.platform === "web" && person.accountType === "Admin") {
        user.platform = "web";
        res.render("Admin");
      } else if (person.platform === "mobile") {
        user.platform = "mobile";
        res.end(JSON.stringify(user));
      } else {
        res.end(
          JSON.stringify({
            _id: person._id,
            password: person.password,
            found: false,
          })
        );
      }
      // console.log(user)
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
};

module.exports = authController;
