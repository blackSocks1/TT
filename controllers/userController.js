const schemas = require('../models/schemas');
const Lecturer = schemas.Lecturer;
const Level = schemas.Level;

let userController = {
    resetAvail: async(req, res) => {
        let lecturer = req.body;
        let lectFromDb = await Lecturer.findOne({ _id: lecturer._id });
        lectFromDb.avail_TT.currentAvail = lectFromDb.avail_TT.default;

        await lectFromDb.save();
        res.end(JSON.stringify(lectFromDb.avail_TT.currentAvail)); // sending back currentAvail to load it to his interface
    },
    getTT: async (req, res) => {
        let person = req.body;
        let source;

        if (person.accountType === 'student') {
            source = await Level.findOne({ _id: person.level });
            if (!source){
                res.end();
            }
        } else if (person.accountType === 'lecturer') {
            source = await Lecturer.findOne({ _id: person._id });
            if (!source){
                res.end();
            }
        }
    
        if (person.platform === "web") {
            res.end(JSON.stringify(source.TT));
        } else {
            let root = await schemas.Admin.findOne({name:"ROOT"});
            let timeArray = root.sysDefaults.sysPeriods;
            let noOfPeriods = timeArray.length / 2;
            let TT = [];

            for (let bigIndex = 0; bigIndex < source.TT.length; bigIndex++) {
                let daysOfWeek = [
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    []
                ];

                for (let i = 0; i <= 6; i++) {
                    let counter = 0;
                    let initIndex = i;

                    while (counter < (noOfPeriods)) {
                        daysOfWeek[i].push(source.TT[bigIndex].cells[initIndex]);
                        counter++;
                        initIndex += 7;
                    }
                }
                TT.push({ time: timeArray, cells: daysOfWeek, week: source.TT[bigIndex].week });
            }
            console.log(TT[TT.length - 1].cells);
            res.end(JSON.stringify(TT));
        }

    },
    getTTGetMethod: (req, res) => {
        Level.findOne({ _id: 'CMA-L1' }).then( async (source) => {

            let latestTT = source.TT[source.TT.length - 1];
            let root = await schemas.Admin.findOne({name:"ROOT"});
            let timeArray = root.sysDefaults.sysPeriods;
            let noOfPeriods = timeArray.length / 2;
            let TT = [];

            for (let bigIndex = 0; bigIndex < source.TT.length; bigIndex++) {
                let daysOfWeek = [
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    []
                ];

                for (let i = 0; i <= 6; i++) {
                    let counter = 0;
                    let initIndex = i;

                    while (counter < (noOfPeriods)) {
                        daysOfWeek[i].push(source.TT[bigIndex].cells[initIndex]);
                        counter++;
                        initIndex += 7;
                    }
                }
                TT.push({ time: timeArray, cells: daysOfWeek, week: source.TT[bigIndex].week });
            }

            console.log(TT[TT.length - 1].week);
            res.end(JSON.stringify(TT));
        });

    }
}

function userTTInit(noCells, initValue) {
    let arr = [];
    for (let i = 0; i < noCells; i++) {
        arr[i] = initValue;
    }
    return arr;
}

module.exports = userController;