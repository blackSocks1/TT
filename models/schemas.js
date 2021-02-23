// const importGlobal = require('import-global');
const extendSchema = require("mongoose-extend-schema");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// function extendSchema (Schema, definition, options){
//     return new mongoose.Schema(
//         Object.assign({},Schema.obj,definition),
//         options
//         );
// }

const OnlineUserSchema = new Schema({
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

  contacts: [],

  chats: [{ type: Schema.Types.String, ref: "chat" }],
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

  group: {
    type: Schema.Types.String,
    ref: "group",
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

  time: {
    allocated: {
      type: Number,
      required: true,
    },

    left: Number,

    week: [], // {week, schedule:[{index, dateStart, hoursLeft}], timeStart, timeEnd} // timeStart & timeEnd might get off in long run thanks to 1st and last indices of schedule of this week
  },

  group: {
    type: Schema.Types.String,
    ref: "group",
    required: true,
  },

  // level is ignored here for testing purposes
  // level: {
  //   type: Schema.Types.String,
  //   ref: "level",
  //   required: true,
  // },

  notifications: [], // notification : {priority, type(default -> announcement, fees, exam), header, message, }
});

const CampusSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },

  location: {
    type: String,
    required: true,
  },

  venues: [
    {
      type: Schema.Types.String,
      ref: "venue",
    },
  ],
});

const VenueSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },

  campus: {
    type: Schema.Types.String,
    ref: "campus",
    required: true,
  },

  capacity: {
    type: Number,
    required: true,
  },

  programs: [], // collection of programs-> {week, days:[{dateString:"Fri Feb 05 2021", events:[{event}]}]}
  longTermPrograms: [],
  schedule: [],
  tempProgram: {},
});

const SectorSchema = new Schema({
  _id: {
    type: String, // SEAS, TIC
    required: true,
  },

  name: {
    type: String, // SEAS, TIC in full
    required: true,
  },

  departments: [
    {
      type: Schema.Types.String,
      ref: "department",
    },
  ],
});

const DepartmentSchema = new Schema({
  _id: {
    type: String, // Industrial & Tech, Commercial
    required: true,
  },

  sector: {
    type: Schema.Types.String,
    ref: "sector",
    required: true,
  },

  cycles: [
    {
      type: Schema.Types.String,
      ref: "cycle",
    },
  ],

  notifications: [], // notification : {priority, type(default -> announcement, fees, exam), header, message, }
});

const CycleSchema = new Schema({
  _id: {
    type: String, // HND, BTS, Bachelor, Licence
    required: true,
  },

  // name: { // HND, BTS, Bachelor, Licence
  //   type: String,
  //   required: true,
  // },

  department: {
    type: Schema.Types.String,
    ref: "department",
    required: true,
  },

  specialties: [
    {
      type: Schema.Types.String,
      ref: "specialty",
    },
  ],

  notifications: [], // notification : {priority, type(default -> announcement, fees, exam), header, message, }
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

  cycle: {
    type: Schema.Types.String,
    ref: "cycle",
    required: true,
  },

  // these courses are abstract instances of courses to be used by groups
  courses: [
    {
      type: Schema.Types.String,
      ref: "course",
    },
  ],

  levels: [
    {
      type: Schema.Types.String,
      ref: "level",
    },
  ],

  notifications: [], // notification : {priority, type(default -> announcement, fees, exam), header, message, }
});

const LevelSchema = new Schema({
  _id: {
    type: String, // l1, l2, l3,
    required: true,
  },

  specialty: {
    type: Schema.Types.String,
    ref: "specialty",
    required: true,
  },

  groups: [
    {
      type: Schema.Types.String,
      ref: "group",
    },
  ],

  // courses are not needed here because every group is going to create its courses based on the courses oof it's specialty

  notifications: [], // notification : {priority, type(default -> announcement, fees, exam), header, message, }
});

const GroupSchema = new Schema({
  _id: {
    type: String, // SWE-L2-LOG-a, SWE-L2-LOG-b, NWS-L2-LOG, SWE-L2-AKWA
    required: true,
  },

  level: {
    type: Schema.Types.String,
    ref: "level",
    required: true,
  },

  campus: {
    type: Schema.Types.String,
    ref: "campus",
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

  TT: [],

  notifications: [], // notification : {priority, type(default -> announcement, fees, exam), header, message, }
});

const OnlineUser = mongoose.model("onlineuser", OnlineUserSchema);

const Campus = mongoose.model("campus", CampusSchema);
const Venue = mongoose.model("venue", VenueSchema);

const Sector = mongoose.model("sector", SectorSchema);
const Department = mongoose.model("department", DepartmentSchema);
const Cycle = mongoose.model("cycle", CycleSchema);
const Specialty = mongoose.model("specialty", SpecialtySchema);
const Level = mongoose.model("level", LevelSchema);
const Group = mongoose.model("group", GroupSchema);

const Course = mongoose.model("course", CourseSchema);

const Admin = mongoose.model("admin", AdminSchema);
const Coordinator = mongoose.model("coordinator", CoordinatorSchema);
const Student = mongoose.model("student", StudentSchema);
const Lecturer = mongoose.model("lecturer", LecturerSchema);

module.exports = {
  OnlineUser,
  Sector,
  Group,
  Department,
  Cycle,
  Specialty,
  Level,
  Admin,
  Coordinator,
  Student,
  Lecturer,
  Course,
  Campus,
  Venue,
};
