// const importGlobal = require('import-global');
const extendSchema = require("mongoose-extend-schema");
const { functions } = require('lodash');
const mongoose = require('mongoose');
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
        required: true
    },
    name: {
        type: String,
        required: true
    },
    accountType: {
        type: String,
        required: true
    },
    platform: String,
    TT: [],
});

const LecturerSchema = extendSchema(UserSchema,{
    avail_TT: {default:[],currentAvail:[]},
    temp_TT: [],
    schedule: [],you:[]
});

const StudentSchema = extendSchema(UserSchema,{
    specialty: {
        type: String,
        required: true
    },
    level: { type: Schema.Types.String, ref: "level" }
});

const CoordinatorSchema = extendSchema(LecturerSchema,{
    timeDefault:{
        week:{},
        periodStart:Date,
        periodStop:Date
    }
});

const AdminSchema = extendSchema(UserSchema,{
    _id: {
        type: String,
        required: true
    },
    name:{
        type:String,
        required:true
    },
    sysDefaults: {
        sysPeriods: [],
        sysWeekDays:Number,
        sysBreaks:[] // [0, 1, 2, 3, 4]
    }
});

const CourseSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    timeAlloc: { type: Number, required: true },
    interTimeAlloc: Number,
    timeLeft: Number,
    specialty: { type: Schema.Types.String, ref: "specialty" }
});

const LevelSchema = new Schema({
    _id: {
        type: String, // l1, l2, l3,
        required: true
    },
    TT: [],
    notifications: { permanent: [], temporary: [] },
    specialty: { type: Schema.Types.String, ref: "specialty" },
    students: [{ type: Schema.Types.String, ref: "student" }]
});

const SpecialtySchema = new Schema({
    _id: {
        type: String, // SWE, NWS, TEL, CMA, EPS
        required: true
    },
    courses: [{ type: Schema.Types.String, ref: "course" }], // array of course objects ['SWE-subject_code': {name: 'Klog', credit_val: 'credit_val', time_alloc:'time_alloc', time_left: 'time_left'}, ...]
    levels: [{ type: Schema.Types.String, ref: "level" }] // array of levels together with list of students for each level {l1 : ['Aaron Jack', 'Mary Palmer', 'Matt Watson', 'Abu Muhammad'], ...}
});

const CycleSchema = new Schema({
    _id: {
        type: String, // HND, BTS, Bachelor, Licence
        required: true
    },
    department: { type: Schema.Types.String, ref: "department" },
    specialties: [{ type: Schema.Types.String, ref: "specialty" }]
});

const DepartmentSchema = new Schema({
    _id: {
        type: String, // Industrial & Tech, Commercial
        required: true
    },
    cycles: [{ type: Schema.Types.String, ref: "cycle" }]
});

const VenueSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    state: [],
    capacity: Number,
    effective: Number
});

const DefaultSchema = new Schema({
    _id: { // _id here would be Main to say main default for entire system
        type: String,
        required: true
    },
    data: {
        time: [],
        noCells: Number
    }
});

const Default = mongoose.model('default', DefaultSchema);
const Venue = mongoose.model('venue', VenueSchema);
const Department = mongoose.model('department', DepartmentSchema);
const Cycle = mongoose.model('cycle', CycleSchema);
const Admin = mongoose.model('admin', AdminSchema);
const Coordinator = mongoose.model('coordinator', CoordinatorSchema);
const Student = mongoose.model('student', StudentSchema);
const Lecturer = mongoose.model('lecturer', LecturerSchema);
const Course = mongoose.model('course', CourseSchema);
const Level = mongoose.model('level', LevelSchema)
const Specialty = mongoose.model('specialty', SpecialtySchema);

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
    Default
};