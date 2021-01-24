// const importGlobal = require('import-global');
const extendSchema = require("mongoose-extend-schema");
const { functions } = require("lodash");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// function extendSchema (Schema, definition, options){
//     return new mongoose.Schema(
//         Object.assign({},Schema.obj,definition),
//         options
//         );
// }

// const BreakSchema = new Schema({
//     name:{
//         type:String,
//         required:true
//     },
//     index:Number
// });

const UserSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  accountType: {
    type: String,
    required: true,
  },

  platform: String,

  TT: [],
});

const LecturerSchema = extendSchema(UserSchema, {
  avail: { weekAvail: [], defaultAvail: [] },
});

const StudentSchema = extendSchema(UserSchema, {
  specialty: {
    type: String,
    ref: "specialty",
    required: true,
  },

  level: {
    type: Schema.Types.String,
    ref: "level",
    required: true,
  },
});

const CoordinatorSchema = extendSchema(LecturerSchema, {
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
  lastSeen: Number,
  TTdrafts: [],
});

const AdminSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  sysDefaults: {
    periods: [],
    pauses: [],
    weekDays: Number,
  },
});

const CourseSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  timeAlloc: {
    type: Number,
    required: true,
  },

  interTimeAlloc: Number,

  timeLeft: Number,

  level: {
    type: Schema.Types.String,
    ref: "level",
    required: true,
  },
});

const LevelSchema = new Schema({
  _id: {
    type: String, // l1, l2, l3,
    required: true,
  },

  TT: [],

  notifications: {
    permanent: [],
    temporary: [],
  },

  specialty: {
    type: Schema.Types.String,
    ref: "specialty",
    required: true,
  },

  courses: [
    {
      type: Schema.Types.String,
      ref: "course",
    },
  ],

  students: [
    {
      type: Schema.Types.String,
      ref: "student",
    },
  ],
});

const SpecialtySchema = new Schema({
  _id: {
    type: String, // SWE, NWS, TEL, CMA, EPS
    required: true,
  },

  coordinator: {
    type: Schema.Types.String,
    ref: "coordinator",
    required: true,
  },

  levels: [
    {
      type: Schema.Types.String,
      ref: "level",
    },
  ],
});

const CycleSchema = new Schema({
  _id: {
    type: String, // HND, BTS, Bachelor, Licence
    required: true,
  },
  department: {
    type: Schema.Types.String,
    ref: "department",
  },
  specialties: [
    {
      type: Schema.Types.String,
      ref: "specialty",
    },
  ],
});

const DepartmentSchema = new Schema({
  _id: {
    type: String, // Industrial & Tech, Commercial
    required: true,
  },
  cycles: [
    {
      type: Schema.Types.String,
      ref: "cycle",
    },
  ],
});

const VenueSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  programs: [], // collection of programs
  longTermPrograms: [],
});

const Venue = mongoose.model("venue", VenueSchema);
const Department = mongoose.model("department", DepartmentSchema);
const Cycle = mongoose.model("cycle", CycleSchema);
const Admin = mongoose.model("admin", AdminSchema);
const Coordinator = mongoose.model("coordinator", CoordinatorSchema);
const Student = mongoose.model("student", StudentSchema);
const Lecturer = mongoose.model("lecturer", LecturerSchema);
const Course = mongoose.model("course", CourseSchema);
const Level = mongoose.model("level", LevelSchema);
const Specialty = mongoose.model("specialty", SpecialtySchema);

module.exports = {
  Department,
  Cycle,
  Specialty,
  Level,
  Admin,
  Coordinator,
  Student,
  Lecturer,
  Course,
  Venue,
};
