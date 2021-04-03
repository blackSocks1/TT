// const importGlobal = require('import-global');
const mongoose = require("mongoose");
const express = require("express");
const morgan = require("morgan");
const _ = require("lodash");
const uniqid = require("uniqid");
const faker = require("faker");

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

//models
const schemas = require("./models/schemas");
const systemDefaults = require("./models/systemDefaults");
const users = require("./models/users");
const { gen_ID, hashPassword } = require("../middlewares/authMiddleware");

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

async function createVenue(campus_id = "AKWA") {
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

async function createSpecialty(_id, coordinator_id, cycle_id, courses, levels) {
  // ["ACC", "MAG'T", "LAW", "T & L", "FOOD Sc.", "BANK"];
  // ["CMA", "EPS", "SWE", "NWS", "TEL", "ICA"]

  let coordinator = await users.Coordinator.findOne({ user_Ref: coordinator_id });

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

async function createGroup(
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
  await createCourses(group._id);
  await createStudents(group._id, 5);
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

async function createCoordinator(_id = "coord_1") {
  let person = {
    _id,
    name: `${faker.name.firstName()} ${faker.name.lastName()}`,
    password: await hashPassword("hey"),
    accountType: "Coordinator",
    TT: [],
    TT_Defaults: {
      week: {
        firstDay: new Date().getTime(),
        lastDay: new Date().getTime(),
      },
      periods: [],
    },
    specialties: [],
    lastSeen: new Date().getTime(),
  };

  let newUser = await users.User.create({ ...person });
  person.user_Ref = newUser;
  delete person._id;

  let newCoord = await users.Coordinator.create({ ...person });

  newUser.coordinator_Ref = newCoord;
  await newUser.save();

  console.log(`${newUser.name} was successfully`);
}

async function createLecturers(num = 10) {
  // generating fake lecturers and filling in db
  for (let i = 0; i < num; i++) {
    let lecturer = {
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      _id: gen_ID("-Lect"),
      accountType: "Lecturer",
      password: await hashPassword("hey"),
      TT: [],
    };

    let newUser = await users.User.create({ ...lecturer });
    lecturer.user_Ref = newUser;
    delete lecturer._id;
    let newLect = await users.Lecturer.create({ ...lecturer });
    newUser.lecturer_Ref = newLect;
    await newUser.save();

    console.log(`${newUser.name} was successfully registered in db with id ${newUser._id}.`);
  }
}

async function createStudents(group_id, num = 5) {
  for (i = 0; i < num; i++) {
    let group = await schemas.Group.findOne({ _id: group_id });
    let level = await schemas.Level.findOne({ _id: group.level });
    let specialty = await schemas.Specialty.findOne({ _id: level.specialty });
    let person = {
      _id: gen_ID(group._id),
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      specialty,
      level,
      group,
      accountType: "Student",
      password: await hashPassword("hey"),
    };

    let newUser = await users.User.create({ ...person });
    person.user_Ref = newUser;
    delete person._id;
    let newStudent = await users.Student.create({ ...person });

    await newStudent.save();
    newUser.student_Ref = newStudent;
    await newUser.save();

    group.students.push(newStudent);
    await group.save();

    console.log(
      `${newUser.name} was registered in ${newStudent.group._id} with id ${newStudent._id}.`
    );
  }
}

async function modDbData(collection = "Group", attribute = "Att", value = []) {
  let group = await schemas[collection].find({});

  for (let object of group) {
    if (object[attribute]) {
      object[attribute] = hashPassword(object.attribute);
      object.markModified(attribute);
      await object.save();
    } else {
      await schemas[collection].update({ _id: object._id }, { $set: { attribute: value } });
    }
  }
  console.log("All good!");
}

async function modSpecific() {
  let coords = await users.User.find({});
  coords.forEach(async (user) => {
    user.password = await hashPassword("hey");
    await user.save();
    console.log(`${user.name} pass updated`);
  });
}

(async () => {
  // await modSpecific();
  let systemDefault = new systemDefaults({
    periods: [
      new Period("08:00", "09:50"),
      new Period("10:10", "12:00"),
      new Period("13:00", "14:50"),
      new Period("15:10", "17:00"),
      new Period("17:30", "19:30"),
      new Period("20:00", "21:30"),
    ],
    weekDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
    pauses: [
      new Pause("Morning Break", 0),
      new Pause("Long Break", 1),
      new Pause("Afternoon Break", 2),
      new Pause("Closing", 3),
      new Pause("Evening Break", 4),
    ],
  });
  await systemDefault.save();
  //
  // let sysAdmin = new schemas.Admin({
  //   _id: "ROOT",
  //   name: "ROOT",
  //   accountType: "Admin"
  // });
  // await sysAdmin.save();
  // console.log(`${sysAdmin.name} was successfully saved`);
  await createCoordinator("coord_1");
  await createCampus("AKWA", "Dla-Akwa", []);
  await createCampus("LOG", "Dla-Logbessou", []);
  await createVenue("AKWA");
  await createVenue("LOG");
  await createSector("SEAS", "School of Engineering and Applied Sciences", []);
  await createDepartment("Industrial & Tech.", "SEAS", []);
  await createCycle("HND", "Industrial & Tech.", []);
  await createLecturers();
  await createSpecialty("SWE", "coord_1", "HND", [], []);
  await createLevels("L1", "SWE", [], []);
  await createLevels("L2", "SWE", [], []);
  await createGroup(
    "AKWA",
    "SWE-L1",
    "AKWA",
    (courses = []),
    (students = []),
    (TT = []),
    (notifications = [])
  );
  await createGroup(
    "AKWA",
    "SWE-L2",
    "AKWA",
    (courses = []),
    (students = []),
    (TT = []),
    (notifications = [])
  );
  await createGroup(
    "LOG",
    "SWE-L1",
    "LOG",
    (courses = []),
    (students = []),
    (TT = []),
    (notifications = [])
  );
  await createGroup(
    "LOG",
    "SWE-L2",
    "LOG",
    (courses = []),
    (students = []),
    (TT = []),
    (notifications = [])
  );
  console.log(`\n\nDone!`);
})();

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(morgan("dev"));
