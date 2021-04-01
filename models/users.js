const mongoose = require("mongoose");
const Schema = mongoose.Schema;

function extendSchema(Schema, definition, options) {
  return new mongoose.Schema(Object.assign({}, Schema.obj, definition), options);
}

const onlineUserSchema = new Schema({
  online_id: {
    type: String,
    required: true,
  },

  accountType: {
    type: String,
    required: true,
  },

  network_id: {
    type: String,
    required: true,
  },

  name: String,
});

const userSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  password: { type: String, required: true },

  accountType: {
    type: String,
    required: true,
  },

  student_Ref: { type: Schema.Types.ObjectId, ref: "student" },

  lecturer_Ref: { type: Schema.Types.ObjectId, ref: "lecturer" },

  coordinator_Ref: { type: Schema.Types.ObjectId, ref: "coordinator" },

  admin_Ref: { type: Schema.Types.ObjectId, ref: "admin" },

  lastSeen: Number,

  contacts: [],

  chats: [{ type: Schema.Types.String, ref: "chat" }],
});

const studentSchema = new Schema({
  user_Ref: { type: Schema.Types.String, ref: "user", required: true },

  specialty: {
    type: String,
    ref: "specialty",
    required: true,
  },

  group: {
    type: Schema.Types.String,
    ref: "group",
    required: true,
  },

  level: {
    type: Schema.Types.String,
    ref: "level",
    required: true,
  },
});

const lecturerSchema = new Schema({
  user_Ref: { type: Schema.Types.String, ref: "user", required: true },

  TT: [],

  avail: { weekAvail: [], defaultAvail: [] },
});

const coordinatorSchema = extendSchema(lecturerSchema, {
  TT_Defaults: {
    week: {},
    periods: [],
  },

  specialties: [
    {
      type: Schema.Types.String,
      ref: "specialty",
    },
  ],
});

const adminSchema = new Schema({
  user_Ref: { type: Schema.Types.String, ref: "user", required: true },
});

const User = mongoose.model("user", userSchema);
const OnlineUser = mongoose.model("onlineuser", onlineUserSchema);
const Student = mongoose.model("student", studentSchema);
const Lecturer = mongoose.model("lecturer", lecturerSchema);
const Coordinator = mongoose.model("coordinator", coordinatorSchema);
const Admin = mongoose.model("admin", adminSchema);

module.exports = { User, OnlineUser, Student, Lecturer, Coordinator, Admin };
