// const importGlobal = require('import-global');
const mongoose = require("mongoose");
const express = require("express");
const morgan = require("morgan");
const _ = require("lodash");
const uniqid = require("uniqid");
const faker = require("faker");

//models
const schemas = require("./models/schemas");

const app = express();

// connection to db
mongoose
  .connect("mongodb://localhost/TimeTable", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connection Successfully Established");
    app.listen(4500);
  })
  .catch("error", (error) => console.log("\nError at ", error));

function userTTInit(noCells = 42, initValue = "A") {
  let arr = [];
  for (let i = 0; i < noCells; i++) {
    arr[i] = initValue;
  }
  return arr;
}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Pause {
  constructor(name, index) {
    this.name = name;
    this.index = index;
  }
}

class Period {
  constructor(start, stop) {
    this.start = start;
    this.stop = stop;
  }
}

let levelArray = ["L1", "L2"];

async function createCampus(_id = "", location = "", venues = []) {
  // "LOG", "Dla-Logbessou",[]
  // "AKWA", "Dla-Akwa",[]

  let campus = new schemas.Campus({
    _id,
    location,
    venues,
  });

  try {
    await campus.save();
    console.log(`${campus._id} was created with success.`);
  } catch (err) {
    console.log(err);
  }
}

async function createVenues(campus_id = "AKWA") {
  let letters = ["A", "B", "C", "D"];

  let campus = await schemas.Campus.findOne({ _id: campus_id });

  // Generating and filling rooms
  for (letter of letters) {
    for (let i = 0; i <= 5; i++) {
      let venue = new schemas.Venue({
        _id: i === 10 ? `${letter}0${i}-${campus_id}` : `${letter}00${i}-${campus_id}`,
        campus,
        capacity: getRndInteger(50, 100),
        programs: [], // collection of programs => {week, days}
        longTermPrograms: [],
      });

      campus.venues.push(venue);

      await venue.save();
      await campus.save();
      console.log(`${venue._id} was successfully registered in db.`);
    }
  }
}

async function createSector(_id = "", name = "", departments = []) {
  // "SEAS", "School of Engineering and Applied Sciences", []

  let sector = new schemas.Sector({
    _id,
    name,
    departments,
  });

  try {
    await sector.save();
    console.log(`${sector._id} was created with success.`);
  } catch (err) {
    console.log(err);
  }
}

async function createDepartment(_id = "", sector_id = "", cycles = []) {
  // "Industrial & Tech.", "SEAS",[]

  let sector = await schemas.Sector.findOne({ _id: sector_id });

  let depart = new schemas.Department({
    _id,
    sector,
    cycles,
  });

  try {
    sector.departments.push(depart);
    await depart.save();
    await sector.save();

    console.log(`${depart._id} was created with success.`);
  } catch (err) {
    console.log(err);
  }
}

async function createCycle(_id = "", department_id = "", cycles = []) {
  // "HND", "Industrial & Tech.", []
  //"BTS", "Industrial & Tech.", []
  //"Bachelor", "Industrial & Tech.", []
  //"Licence", "Industrial & Tech.", []

  let department = await schemas.Department.findOne({ _id: department_id });

  let depart = new schemas.Cycle({
    _id,
    department,
    cycles,
  });

  try {
    department.cycles.push(depart);

    await depart.save();
    await department.save();

    console.log(`${depart._id} was created with success.`);
  } catch (err) {
    console.log(err);
  }
}

async function createSpecialties(_id, coordinator_id, cycle_id, courses, levels) {
  // ["ACC", "MAG'T", "LAW", "T & L", "FOOD Sc.", "BANK"];
  // ["CMA", "EPS", "SWE", "NWS", "TEL", "ICA"]

  let coordinator = await schemas.Coordinator.findOne({ _id: coordinator_id });

  let cycle = await schemas.Cycle.findOne({ _id: cycle_id });

  let specialty = new schemas.Specialty({
    _id,
    coordinator,
    cycle,
    courses,
    levels,
  });

  try {
    coordinator.specialties.push(specialty);
    cycle.specialties.push(specialty);

    await coordinator.save();
    await specialty.save();

    console.log(`${specialty._id} was created successfully.`);
  } catch (err) {
    console.log(err);
  }
}

async function createLevels(name = "", specialty_id = "", groups = [], courses = []) {
  // let specialty = await schemas.Specialty.findOne({ _id: specialty_id });

  let specialties = await schemas.Specialty.find();

  for (let specialty of specialties) {
    let level = new schemas.Level({
      _id: `${specialty._id}-${name}`,
      specialty,
      groups,
      courses,
    });

    try {
      specialty.levels.push(level);

      await level.save();
      await specialty.save();

      console.log(`${level._id} was created under ${specialty._id} successfully.`);
    } catch (err) {
      console.log(err);
    }
  }
}

async function createGroups(
  name = "",
  level_id = "",
  campus_id = "",
  courses = [],
  students = [],
  TT = [],
  notifications = []
) {
  let level = await schemas.Level.findOne({ _id: level_id });
  let campus = await schemas.Campus.findOne({ _id: campus_id });

  let group = new schemas.Group({
    _id: `${level._id}-${name}`,
    level,
    campus,
    courses,
    students,
    TT,
    notifications,
  });

  try {
    level.groups.push(group);

    await level.save();
    await group.save();

    console.log(
      `${group._id} was created under ${level._id} at campus ${campus._id} successfully.`
    );
  } catch (err) {
    console.log(err);
  }
}

async function createCourses(group_id) {
  let courseList = [
    "English Language",
    // "Physics",
    "Logic",
    // "C Programming",
    // "Web Programming",
    // "Computer Networks",
    // "Math Lab.",
    // "Cisco",
    "Graphics Design",
    // "Algorithms & Data Structures",
    // "Digital Electronics",
    "Civil Law",
    "Civics & Ethics",
    // "Operating Systems",
    "Economics",
    "Data Analysis",
    "Probability and Statistics for Engineers",
    // "Construction Methods and Management",
    "Water Resources Engineering",
    // "Introduction to Civil Engineering",
    "Critical Reading & Writing",
    // "Solid Mechanics",
    "Technical Writing",
    // "Dynamics",
    "Intro to Surveying and CAD",
    "General Chemistry",
    "General Physics",
    "Calculus",
    // "Materials Science",
    "Computer Science",
    // "Engineering Math",
    // "Structural Analysis",
    "Structural Design",
    // "Soil Mechanics",
    // "Geotechnical Engineering",
    // "Environmental Engineering",
    "Fluid Mechanics",
    "Transportation Engineering",
  ].sort();

  // let specialties = await schemas.Specialty.find({ coordinator: "coord_2" });

  let group = await schemas.Group.findOne({ _id: group_id });

  for (let name of courseList) {
    let time = getRndInteger(100, 250);
    course = new schemas.Course({
      _id: `${name}-${group._id}`,
      name,
      group,
      time: { allocated: time, left: time, week: [] },
    });

    try {
      group.courses.push(course);

      await course.save();
      await group.save();

      console.log(`${course.name} was successfully registered in ${group._id}`);
    } catch (err) {
      console.log(err);
    }
  }

  // for coord_1
  // let levels = await schemas.Level.find({});

  // for (level of levels) {
  //   for (name of courseList) {
  //     let time = getRndInteger(50, 100);
  //     course = new schemas.Course({
  //       _id: level._id + "-" + name,
  //       name,
  //       level,
  //       timeAlloc: time,
  //       timeLeft: time,
  //       timeInWeek: 0,
  //     });
  //     await course.save();
  //     level.courses.push(course);
  //     await level.save();
  //     console.log(`${course.name} was successfully registered in ${level._id}`);
  //   }
  // }
}

async function createLecturers() {
  // generating fake lecturers and filling in db
  for (let i = 0; i < 10; i++) {
    let name = `${faker.name.firstName()} ${faker.name.lastName()}`;
    let lecturer = new schemas.Lecturer({
      _id: uniqid.time("L-"),
      name,
      accountType: "Lecturer",
      TT: [],
    });

    await lecturer.save();
    console.log(`${name} was successfully registered in db with id ${lecturer._id}.`);
  }
}

async function createStudents(group_id, num = 5) {
  for (i = 0; i < num; i++) {
    let group = await schemas.Group.findOne({ _id: group_id });
    let level = await schemas.Level.findOne({ _id: group.level });
    let specialty = await schemas.Specialty.findOne({ _id: level.specialty });

    // let specialty = await schemas.Specialty.findOne({
    //   _id: spec,
    // });

    let name = `${faker.name.firstName()} ${faker.name.lastName()}`;

    let student = new schemas.Student({
      _id: uniqid.time("s", `-${group._id}`),
      name,
      specialty,
      level,
      group,
      accountType: "Student",
    });

    await student.save();
    group.students.push(student);
    await group.save();
    console.log(`${student.name} was registered in ${student.level._id} with id ${student._id}.`);

    // let students = await schemas.Student.find({
    //   level: level._id
    // });

    // for (let student of students) {
    //   level.students.push(student);
    //   await level.save();
    //   console.log(`${ student.name } was registered in ${ student.level._id } with id ${ student._id }.`);

    // }
  }
}

async function modDbData(collection = "Group", attribute = "courses", value = []) {
  let group = await schemas[collection].find({});

  for (let object of group) {
    object[attribute] = value;
    console.log(object);
    await object.save();
  }
  console.log("All good!");
}

(async () => {
  //   let sysAdmin = new schemas.Admin({
  //     _id: "ROOT",
  //     name: "ROOT",
  //     accountType: "Admin",
  //     sysDefaults: {
  //       periods: [
  //         new Period("08:00", "09:50"),
  //         new Period("10:10", "12:00"),
  //         new Period("13:00", "14:50"),
  //         new Period("15:10", "17:00"),
  //         new Period("17:30", "19:30"),
  //         new Period("20:00", "21:30"),
  //       ],
  //       weekDays: 7,
  //       pauses: [
  //         new Pause("Morning Pause", 0),
  //         new Pause("Long Pause", 1),
  //         new Pause("Afternoon Pause", 2),
  //         new Pause("Closing", 3),
  //         new Pause("Evening Pause", 4),
  //       ],
  //     },
  //   });
  //   await sysAdmin.save();
  //   console.log(`${sysAdmin.name} was successfully saved`);
  //   // Creating Coordinator
  // let coord = new schemas.Coordinator({
  //   _id: "coord_2",
  //   name: "Mr Alibaba",
  //   accountType: "Coordinator",
  //   TT_Defaults: {
  //     week: {
  //       firstDay: new Date().getTime(),
  //       lastDay: new Date().getTime(),
  //     },
  //     periods: [],
  //   },
  //   specialties: [],
  //   lastSeen: new Date().getTime(),
  //   TTdrafts: [],
  // });
  // coord.save();
  // console.log(`${coord.name} was successfully`);
  // await createCampus("AKWA", "Dla-Akwa", []);
  // await createVenues("LOG");
  // await createSector("SEAS", "School of Engineering and Applied Sciences", []);
  // await createDepartment("Industrial & Tech.", "SEAS", []);
  // await createCycle("BTS", "Industrial & Tech.", []);
  // await createLecturers();
  // await createSpecialties("FOOD Sc.", "coord_2", "HND", [], []);
  // await createLevels("L2", "", [], []);
  // await createGroups(
  //   "AKWA",
  //   "CMA-L1",
  //   "AKWA",
  //   (courses = []),
  //   (students = []),
  //   (TT = []),
  //   (notifications = [])
  // );
  // await createCourses("SWE-L1-AKWA");
  // await createStudents("CMA-L1-AKWA",5);
})();
// modDbData();

console.log(new Date().toDateString());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(morgan("dev"));
