const { Oath } = require("../myFunctions/npmFunctions");

// module.exports.signupGet = (req, res) => {
//     res.render('signup');
// }

// module.exports.signupPost = (req, res) => {
//     const { _id, name } = req.body;
//     console.log(_id, name);
//     res.render('signupSuccess');
// }

// module.exports.loginGet = (req, res) => {
//     res.render('login');
// }

// module.exports.loginPost = (req, res) => {
//     const { _id, name } = req.body;
//     console.log(_id, name);
//     res.send('User logged in');
// }

// module.exports.logout = (req, res) => {
//     res.send('User logged out');
// }

let authController = {
  login: async (req, res) => {
    let person = req.body;
    let user = await Oath(person);

    if (user) {
      res.locals.user = user;

      if (person.platform === "web" && person.accountType === "coordinator") {
        user.platform = "web";
        res.render("coord");
      } else if (person.platform === "web" && person.accountType === "lecturer") {
        user.platform = "web";
        res.render("lecturer");
      } else if (person.platform === "web" && person.accountType === "student") {
        user.platform = "web";
        res.render("student");
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
  signUp: () => {},
  signIn: () => {},
  logOut: () => {},
};

module.exports = authController;
