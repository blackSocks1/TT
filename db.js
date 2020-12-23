// const importGlobal = require('import-global');
const mongoose = require('mongoose');
const express = require('express');
const morgan = require('morgan');
const _ = require('lodash');
const uniqid = require('uniqid');
const faker = require('faker');

//models
const schemas = require('./models/schemas');
const { result } = require('lodash');
const Lecturer = schemas.Lecturer;
const Course = schemas.Course;
const Venue = schemas.Venue;
const Student = schemas.Student;
const Level = schemas.Level;
const Admin = schemas.Admin;

// connection to db
mongoose.connect('mongodb://localhost/TimeTable', { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log('Connection Successfully Established');
    app.listen(4500);

}).catch('error', (error) => console.log('\nError at ', error));

function userTTInit(noCells = 42, initValue = { courseInfo: '', level: '', venue: "" }) {
    let arr = [];
    for (let i = 0; i < noCells; i++) {
        arr[i] = initValue;
    }
    return arr;
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// default TT for whole sys
let defaultTT = {
    week: { firstDay: "", lastDay: "" },
    cells: userTTInit(42, { courseInfo: '', courseName: "", lecturerName: "", level: '', venue: "" }),
    time: [
        "08:00",
        "09:50",
        "10:10",
        "12:00",
        "13:00",
        "14:50",
        "15:10",
        "17:00",
        "17:30",
        "19:30",
        "20:00",
        "21:30",
    ]
};


class Break{
    constructor(name,index){
        this.name = name;
        this.index = index;
    }
}

let sysAdmin = new Admin({
    _id:"ROOT",
    name:"ROOT",
    accountType:"admin",
    sysDefaults: {
        sysPeriods: [
            "08:00",
            "09:50",
            "10:10",
            "12:00",
            "13:00",
            "14:50",
            "15:10",
            "17:00",
            "17:30",
            "19:30",
            "20:00",
            "21:30",
        ],
        sysWeekDays:7,
        sysBreaks: [new Break("Morning Break",0), new Break("Long Break",1), new Break("Afternoon Break",2), new Break("Closing",3), new Break("Evening Break",4)]
    }
});

sysAdmin.save().then(result=>console.log(`${sysAdmin.name} was successfully saved`));

function fillDb() {
    let courseList = ["English Language", "Physics", "Logic", "C Programming", "Web Programming", "Computer Networks", "Math Lab.", "Cisco", "Graphics Design", "Algorithms & Data Structures", "Digital Electronics", "Civil Law", "Civics & Ethics", "Operating Systems", "Economics", "Data Analysis", "Probability and Statistics for Engineers", "Construction Methods and Management", "Water Resources Engineering", "Introduction to Civil Engineering", "Critical Reading & Writing", "Solid Mechanics", "Technical Writing", "Dynamics", "Intro to Surveying and CAD", "General Chemistry", "General Physics", "Calculus", "Materials Science", "Computer Science", "Engineering Math", "Structural Analysis", "Structural Design", "Soil Mechanics", "Geotechnical Engineering", "Environmental Engineering", "Fluid Mechanics", "Transportation Engineering"].sort();

    let letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

    // Generating and filling rooms
    letters.forEach((letter) => {
        for (let i = 0; i <= 10; i++) {
            let venueId = '';
            if (i === 10) {
                venueId = `${letter}0${i}`;
            } else {
                venueId = `${letter}00${i}`;
            }
            let venue = new Venue({
                _id: venueId,
                state: userTTInit(42, 'A'),
                capacity: getRndInteger(50, 100)
            });

            venue.save().then((result) => {
                console.log(`${venueId} was successfully registered in db.`);
            }).catch((err) => {
                console.log(err);
            });
        }
    });

    // generating fake lecturers and filling in db
    for (let i = 0; i < 40; i++) {
        let name = `${faker.name.firstName()} ${faker.name.lastName()}`;
        let lecturer = new Lecturer({
            _id: uniqid('L-'),
            name: name,
            accountType: 'lecturer',
            TT: [],
            avail_TT:  {default:userTTInit(42, 'A'),currentWeek:[]},
            temp_TT: userTTInit(42, { courseInfo: '', level: '', venue: "" }),
            schedule: []
        });

        lecturer.save().then((result) => {
            console.log(`${name} was successfully registered in db.`);
        }).catch((err) => {
            console.log(err);
        });
    }

    //Filling courses
    courseList.forEach((name) => {
        let time = getRndInteger(50, 100);
        let course = new Course({
            _id: uniqid('C-'),
            name: name,
            timeAlloc: time,
            timeLeft: time,
            timeInWeek: 0
        });

        course.save().then((result) => {
            console.log(`${name} was successfully registered in db.`);
        }).catch((err) => {
            console.log(err);
        });
    });

}

// fillDb();

async function CreateStudents() {
    for (spec of specialtyArray) {
        for (lev of levelArray) {
            for (i = 0; i < 5; i++) {
                try {
                    let level = await Level.findOne({ _id: `${spec}-${lev}` });
                    let name = `${faker.name.firstName()} ${faker.name.lastName()}`;
                    let student = new Student({
                        _id: uniqid('stud-'),
                        name: name,
                        accountType: 'student',
                        specialty: spec,
                        level: level._id
                    });

                    student.save().then((result) => {
                        level.students.push(student);
                        level.save().then((result) => {
                            console.log(`${student.name} was registered in ${student.specialty} ${student.level} with id ${student._id}.`);
                        });
                    });

                } catch (err) {
                    console.log(err)
                }
            }
        }
    }
}

let specialtyArray = ['CMA', 'EPS', 'SWE', 'NWS', 'TEL', 'ICA'];
let levelArray = ['L1', 'L2'];

function CreateLevels() {
    for (spec of specialtyArray) {
        for (lev of levelArray) {
            let level = new Level({
                _id: `${spec}-${lev}`,
                TT: []
            });

            level.save().then((result) => {
                console.log(`${level._id} was registered successfully.`);
            });
        }
    }
}

// CreateLevels();
// CreateStudents();

function FindElement(criteria = '_id', value, source) {
    return _.find(source, (o) => { return o[criteria] === value; });
}

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));