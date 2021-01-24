// const importGlobal = require('import-global');
const mongoose = require("mongoose");
const express = require("express");
const morgan = require("morgan");
const _ = require("lodash");
const uniqid = require("uniqid");
const faker = require("faker");

//models
const schemas = require("./models/schemas");
const { indexOf } = require("lodash");

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

let specialtyArray = ["ACC", "MAG'T", "LAW", "T & L", "F & N", "BANK"];
// ["CMA", "EPS", "SWE", "NWS", "TEL", "ICA"]
let levelArray = ["L1", "L2"];

async function createVenues() {
  let letters = ["A", "B", "C", "D"];

  // Generating and filling rooms
  for (letter of letters) {
    for (let i = 0; i <= 5; i++) {
      let venue = new schemas.Venue({
        _id: i === 10 ? `${letter}0${i}` : `${letter}00${i}`,
        capacity: getRndInteger(50, 100),
        programs: [], // collection of programs
        longTermPrograms: [],
      });

      await venue.save();
      console.log(`${venue._id} was successfully registered in db.`);
    }
  }
}

async function createCourses() {
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

  // for coord_2
  // let specialties = await schemas.Specialty.find({ coordinator: "coord_2" });
  // for (let specialty of specialties) {
  //   for (let level of specialty.levels) {
  //     level = await schemas.Level.findOne({ _id: level });
  //     for (name of courseList) {
  //       let time = getRndInteger(50, 100);
  //       course = new schemas.Course({
  //         _id: level._id + "-" + name,
  //         name,
  //         level,
  //         timeAlloc: time,
  //         timeLeft: time,
  //         timeInWeek: 0,
  //       });
  //       await course.save();
  //       level.courses.push(course);
  //       await level.save();
  //       console.log(`${course.name} was successfully registered in ${level._id}`);
  //     }
  //   }
  // }

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
  for (let i = 0; i < 40; i++) {
    let name = `${faker.name.firstName()} ${faker.name.lastName()}`;
    let lecturer = new schemas.Lecturer({
      _id: uniqid.time("L-"),
      name: name,
      accountType: "lecturer",
      TT: [],
    });

    await lecturer.save();
    console.log(`${name} was successfully registered in db with id ${lecturer._id}.`);
  }
}

async function createStudents() {
  for (spec of specialtyArray) {
    for (lev of levelArray) {
      for (i = 0; i < 5; i++) {
        let level = await schemas.Level.findOne({
          _id: `${spec}-${lev}`,
        });

        let specialty = await schemas.Specialty.findOne({
          _id: spec,
        });

        let name = `${faker.name.firstName()} ${faker.name.lastName()}`;

        let student = new schemas.Student({
          _id: uniqid.time("s", `-${spec}-${lev}`),
          name: name,
          specialty,
          level,
          accountType: "student",
        });

        await student.save();
        level.students.push(student);
        await level.save();
        console.log(
          `${student.name} was registered in ${student.level._id} with id ${student._id}.`
        );

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
  }
}

async function createSpecialties() {
  for (spec of specialtyArray) {
    let coordinator = await schemas.Coordinator.findOne({
      _id: "coord_2",
    });
    let specialty = new schemas.Specialty({
      _id: spec,
      coordinator,
      courses: [],
      levels: [],
    });

    coordinator.specialties.push(specialty);
    await coordinator.save();

    await specialty.save();
    console.log(`${specialty._id} was created successfully.`);
  }
}

async function createLevels() {
  for (spec of specialtyArray) {
    for (lev of levelArray) {
      let specialty = await schemas.Specialty.findOne({
        _id: spec,
      });

      let level = new schemas.Level({
        _id: `${spec}-${lev}`,
        specialty,
        TT: [],
        courses: [],
      });

      await level.save();
      specialty.levels.push(level);
      await specialty.save();

      console.log(`\n${level._id} was created under ${specialty._id} successfully.`);
    }
  }
}

(async () => {
  //   let sysAdmin = new schemas.Admin({
  //     _id: "ROOT",
  //     name: "ROOT",
  //     accountType: "admin",
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
  //   _id: "coord_1",
  //   name: "Mr KloG",
  //   accountType: "coordinator",
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
  // console.log(`${coord.name} was successfully saved`);
  // await createLecturers();
  // await createVenues();
  // await createSpecialties();
  // await createLevels();
  // await createCourses();
  // await createStudents();
})();

// createLecturers();
// createVenues();

const app = express();
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(morgan("dev"));
