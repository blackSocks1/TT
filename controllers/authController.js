//models
const schemas = require('../models/schemas');
const Lecturer = schemas.Lecturer;
const Course = schemas.Course;
const Student = schemas.Student;
const Level = schemas.Level;


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

    login: async(req, res) => {
        let person = req.body;
        let firstLetter = person._id.slice(0, 1);
        let user;

        if (firstLetter === 'L') {
            user = await Lecturer.findOne({ _id: person._id });
        } else {
            user = await Student.findOne({ _id: person._id });
        }

        if (user) {
            if (person.platform === "web" && user.accountType === 'lecturer') {
                user.platform = "web";
                res.locals.user = user;
                res.render('lecturer');
            } else if (person.platform === "web" && user.accountType === 'student') {
                user.platform = "web";
                res.locals.user = user;
                res.render('student');
            } else if (person.platform === "mobile") {
                user.platform = "mobile";
                res.end(JSON.stringify(user));
            } else {
                res.end(JSON.stringify(undefined));
            }
            // console.log(user)
        } else {
            res.end(JSON.stringify(undefined));
        }
    },
    signUp: () => {},
    signIn: () => {},
    logOut: () => {},
}

module.exports = authController;