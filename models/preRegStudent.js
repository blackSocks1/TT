const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { isEmail } = require("validator");

const preRegStudentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },

  dob: {
    type: String,
    required: true,
  },

  department: {
    type: String,
    required: true,
  },

  cycle: {
    type: String,
    required: true,
  },

  specialty: {
    type: String,
    required: true,
  },

  level: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    validate: [isEmail, "Please enter a valid email"],
  },

  phoneNum: {
    type: String,
  },
});

preRegStudentSchema.pre("save", function (next) {
  next();
});

const preRegStudent = mongoose.model("preregistrationstudent", preRegStudentSchema);

module.exports = preRegStudent;
