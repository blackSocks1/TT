//module containing most functions of various interfaces
// import { io } from "./socket.io.js";

//import { functions } from "lodash";

export const host = 'localhost'; // '192.168.1.141'; //
export const port = 45000;

let sysDefaults;

getSysDefaults();

async function getSysDefaults(){
    
   sysDefaults = await fetch('/getSysDefaults',{
        method: 'POST',
        headers: {'Content-type': 'application/json;charset=utf-8'},
        body: JSON.stringify({_id:'ROOT'})
    });

    sysDefaults =  await sysDefaults.json();
    console.log(sysDefaults);
    return sysDefaults;
}

// export const socket = io.connect(`http://${host}:${port}`);

export const defaultPeriods = [
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
];

export class User {
    // user class from interface management
    constructor(_id, name, accountType, platform, level, leftTT, rightTT) {
        this._id = _id;
        this.name = name;
        this.accountType = accountType;
        this.platform = platform;
        this.connected = false;

        if (this.accountType === "student") {
            this.level = level;
        }

        // nav attributes
        this.TT = [];
        this.ttOnScreen = {};
        this.index = 4;

        let goToRef = (e) => {
            this.index = new Number(e.target.innerHTML) - 1;
            this.ttOnScreen = this.TT[this.index];
            if (this.accountType === 'coordinator') {
                this.displayTT(this.ttOnScreen, 'student');
            } else {
                this.displayTT(this.ttOnScreen, this.accountType);
            }
        };

        const ttDirection = () => {
            // function to enable left and right navs buttons when needed
            let pagination = document.querySelector(".pagination");
            pagination.innerHTML = '';
            let paginationButtons = undefined;

            for (let i = 0; i < this.TT.length; i++) {
                if (i === 0) {
                    paginationButtons = '';
                }
                if (i === this.index) {
                    paginationButtons += `<a class="paginationButton onScreen">${i+1}</a>`;
                } else {
                    paginationButtons += `<a class="paginationButton">${i+1}</a>`;
                }
            }
            if (paginationButtons) {
                pagination.innerHTML += paginationButtons;
            } else {
                pagination.innerHTML += 'No time table to display';
            }


            // if the index of TT on screen is 0 (minimum index) or the next TT on the left of the TT on screen is undefined, block the left nav else unlock
            if (this.index === 0 || this.TT[this.index - 1] === undefined) {
                elementDisabled(leftTT, true);
            } else {
                elementDisabled(leftTT, false);
            }


            // if the index of TT on screen is 4 (maximum index) or the next TT on the right of the TT on screen is undefined, block the right nav else unlock
            if (this.index === 4 || this.TT[this.index + 1] === undefined) {
                elementDisabled(rightTT, true);
            } else {
                elementDisabled(rightTT, false);
            }
            paginationButtons = document.querySelectorAll("a.paginationButton");
            paginationButtons.forEach((button) => {
                button.addEventListener("click", goToRef);
            });
        };

        // user fetching and displaying personal TT
        this.getTT = async() => {
            let data = await fetch('/getTT', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({ _id: this._id, accountType: this.accountType, level: this.level, platform: this.platform })
            });
            this.TT = await data.json();

            if (this.TT.length > 0) {
                // display and point to latest TT
                this.ttOnScreen = this.TT[this.TT.length - 1];
                this.index = this.TT.length - 1;
                this.displayTT(this.ttOnScreen, this.accountType);
            }
        };

        // method to navigate TTs
        this.nextTT = (e) => {
            if (e.target.value === '<') {
                this.ttOnScreen = this.TT[this.index - 1];
                this.index -= 1;
            } else {
                this.ttOnScreen = this.TT[this.index + 1];
                this.index += 1;
            }
            if (this.accountType === 'coordinator') {
                this.displayTT(this.ttOnScreen, 'student');
            } else {
                this.displayTT(this.ttOnScreen, this.accountType);
            }
        };

        this.displayTT = (TT, accountType) => {
            // function to display a TT on screen at a time

            if (TT) {
                let cells = TT.cells; // getting cell info
                let week = TT.week; // getting week info

                // displaying first and last dates of week
                document.querySelector('#firstD').innerHTML = new Date(week.firstDay).toDateString();
                document.querySelector('#lastD').innerHTML = new Date(week.lastDay).toDateString();

                // getting all cell output fields in table to display cell content
                let output = document.querySelector('.displayTT').querySelectorAll('.display');

                // getting all time output fields to display time
                let timeOutput = document.querySelector('.displayTT').querySelectorAll('.time');

                // displaying cell info
                cells.forEach((cell, index) => {
                    let out = output[index].querySelectorAll('output');
                    out[0].value = cell.courseInfo;
                    if (accountType === 'lecturer' || accountType === 'coordinator') {
                        out[1].value = cell.level;
                    } else {
                        out[1].value = cell.lecturerName;
                    }
                    out[2].value = cell.venue;
                });

                // displaying time
                // timeOutput.forEach((time, i) => {
                //     time.value = defaultPeriods[i];
                // });
            } else {
                let output = document.querySelector('.displayTT').querySelectorAll('.display');
                output.forEach((out) => {
                    let info = out.querySelectorAll('output');
                    info[0].value = "";
                    info[1].value = "";
                    info[2].value = "";
                });
            }
            ttDirection();
        }

        this.resetAvailTT = async() => {
            let reset = await fetch('/resetAvail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({ _id: this._id })
            });
            let result = await reset.json();
            console.log(result, 'Done!');
        };
    }

}

export class Level {
    constructor(_id, TT, students) {
        this._id = _id;
        this.TT = TT;
        this.students = students;
    }
}

export class Week {
    constructor(firstDay, lastDay) {
        this.firstDay = new Date(firstDay).getTime();
        this.lastDay = new Date(lastDay).getTime();
    }
}

export function sendMessage() {
    let message = document.querySelector('#messageOut').value.trim();
    let receiver = document.querySelector('#receiverId').value;
    document.querySelector('#messageIn').innerHTML += `${message}<br>`;
    socket.emit('message', { sender: Me.name, message, receiver });
}

export function displayTT(TT, accountType) {
    // function to display a TT on screen at a time

    if (TT) {
        let cells = TT.cells; // getting cell info
        let week = TT.week; // getting week info

        // displaying first and last dates of week
        document.querySelector('#firstD').innerHTML = new Date(week.firstDay).toDateString();
        document.querySelector('#lastD').innerHTML = new Date(week.lastDay).toDateString();

        // getting all cell output fields in table to display cell content
        let output = document.querySelector('.displayTT').querySelectorAll('.display');

        // getting all time output fields to display time
        let timeOutput = document.querySelector('.displayTT').querySelectorAll('.time');

        // displaying cell info
        cells.forEach((cell, index) => {
            let out = output[index].querySelectorAll('output');
            out[0].value = cell.courseInfo;
            if (accountType === 'lecturer' || accountType === 'coordinator') {
                out[1].value = cell.level;
            } else {
                out[1].value = cell.lecturerName;
            }
            out[2].value = cell.venue;
        });

        // displaying time
        // timeOutput.forEach((time, i) => {
        //     time.value = defaultPeriods[i];
        // });
    }
    ttDirection();
}

export function elementDisabled(id, bool) {
    // function to disable any HTML element by id
    document.querySelector(id).disabled = bool;
}

// TT generators for various interfaces
export async function iucTemplate(target, user) {
    // rows = 6, cols = 7,  , breaks = [0, 1, 2, 3, 4]
    // function to display IUC user TT
    // set rows, columns as first 2 params
    // set the target div to append table after generation
    // user is just for testing on coordinator interface
    // set the indices of where the breaks should be on table in an array as last param

    // converting breaks from array to set to take off duplicates
    let breaks = [];
    let sysDefaults = await getSysDefaults();
    
    sysDefaults.sysBreaks.forEach(pause =>breaks.push(pause.index));

    breaks = new Set(breaks.sort());
    let rows = sysDefaults.sysPeriods.length / 2;
    let cols = sysDefaults.sysWeekDays;

    // getting div container to place generated TT in
    let container = document.querySelector(target);

    // creating table
    let table = document.createElement("table");

    // setting table attributes (like class || id)
    table.setAttribute("class", 'displayTT w3-table w3-bordered w3-centered');
    table.setAttribute("id", user._id);

    // creating table header with elements constituting table header
    let thead = document.createElement('tr');
    thead.innerHTML = `<th> <span id="firstD"></span><br><span id="lastD"></span> </th> <th>MONDAY</th> <th>TUESDAY</th> <th>WEDNESDAY</th> <th>THURSDAY</th> <th>FRIDAY</th> <th>SATURDAY</th> <th>SUNDAY</th>`;

    // appending header to table
    table.appendChild(thead);

    let timer = 0;
    for (let i = 0; i < rows; i++) {
        // creation of remaining table rows with their data by iteration

        let tr = document.createElement('tr');
        tr.innerHTML += `<td class="timeSection">
        Start: <output class="time">${defaultPeriods[timer]}</output>
        <br>
        Stop: <output class="time">${defaultPeriods[timer+1]}</output>
         </td>`;

        for (let j = 0; j < cols; j++) {
            tr.innerHTML +=
                `<td class="tdCell"><div class='display'>
                <br>
                <output type="text" value="Course name"></output>
                <br>
                <output type="text" value="Lecturer"></output>
                <br>
                <output type="text" value="Venue"></output>
            </div></td>`;
        }
        table.appendChild(tr);

        if (breaks.has(i)) {
            let pause = findElement("index",i,sysDefaults.sysBreaks);

            table.innerHTML += `<tr ><td colspan='${cols+1}' class='break'>${pause.name}</td></tr>`;
        }
        timer += 2;
    }
    // appending table to container div
    container.appendChild(table);
    let paginationSection = `<div class = "pagination" > </div>`;

    let navSection;
    if (user.accountType === "student") {
        navSection = `
            <div class = "navSection" ><input type="button" id="left" value="<" class="button"> | <input type="button" id="getTT" value="Check TT" class="button"> | <input type="button" id="right" value=">" class="button"> </div>`;
    } else if (user.accountType === "lecturer") {
        navSection = `
            <div class = "navSection" > <input type="button" id="left" value="<" class="button"> | <input type="button" id="getTT" value="Check TT" class="button"> | <input type="button" id="reset" value="RESET A TT" class="button"> | <input type="button" id="right" value=">" class="button"></div>`;
    } else if (user.accountType === "coordinator") {
        navSection = `
        <div class = "navSection" ><input type="button" id="left" value="<" class="button"> | <input class="button" id="editPresentTT" type="button" value="Edit" disabled> | <input type="button" id="right" value=">" class="button"> </div>`
    }

    container.innerHTML += `
    <div class="w3-center">
    <div class="w3-bar">
    ${paginationSection} ${navSection}
    </div>
</div>`;
}

export function generateCoordinatorTT(rows = 6, cols = 7, target) {
    // function to generate coordinator's TT 

    let container = document.querySelector(target);
    let table = document.createElement("table");
    table.setAttribute("class", 'w3-table w3-bordered w3-centered');
    let div = document.createElement("div");
    div.innerHTML = `<span><h4>Admin TimeTable</h4></span>`;

    let thead = document.createElement('tr');
    thead.innerHTML = `<th><input type="date" id="weekS" placeholder="week start"><br><input type="date" id="weekE" placeholder="week end"></th> <th>MONDAY</th> <th>TUESDAY</th> <th>WEDNESDAY</th> <th>THURSDAY</th> <th>FRIDAY</th> <th>SATURDAY</th> <th>SUNDAY</th>`;
    table.appendChild(thead);

    for (let i = 0; i < rows; i++) {

        let tr = document.createElement('tr');
        tr.innerHTML += `<td class="timeSection">
        <div>
        Start: <input type="time" class="adTime"></input>
        <br>
        Stop: <input type="time" class="adTime"></input>
        </div>
         </td>`;

        for (let j = 0; j < cols; j++) {
            tr.innerHTML += `
            <td>
            <form class='cell'>
                <br>
                <input list="Courses" type="text" placeholder="Course name">
                <br>
                <input list="Lecturers" type="text" placeholder="Lecturer">
                <br>
                <input list="Venues" type="text" placeholder="Venue">
                <br>
                <input type="checkbox" class="form-check-input"/>Joint Class
                
                <input class="periodStart" style="display:none;"></input>
            </form>
            </td>`;
        }
        table.appendChild(tr);
    }
    div.appendChild(table);
    container.appendChild(div);
    container.innerHTML += `
    <div class="w3-center">
        <div class="w3-bar">
            <input class="button" id="Validate" type="button" value="Validate"> | <input class="button" id="preview" type="button" value="Preview" disabled> | <input class="button"    id="sendButton" type="button" value="Send" disabled>
        </div>
    </div> `;
}

export function findElement(criteria = '_id', value, iterableCollection = []) {
    // function to simulate a database query from an iterable collection
    if (iterableCollection.length === 0) {
        return undefined;
    }
    for (let element of iterableCollection) {
        if (element[criteria] === value) {
            return element;
        }
    }
    return undefined;
}

export function userTTInit(noCells = 42, initValue = { courseInfo: '', level: '', venue: "" }) {
    // returns an array of info of user's choice; good to initialize other collections
    let arr = [];
    for (let i = 0; i < noCells; i++) {
        arr[i] = initValue;
    }
    return arr;
}