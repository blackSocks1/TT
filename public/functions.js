//module containing most functions of various interfaces
// import { io } from "./socket.io.js";

//import { functions } from "lodash";

export const host = 'localhost'; // '192.168.1.141'; //
export const port = 45000;

let sysDefaults;

getSysDefaults();

// export const socket = io.connect(`https://${host}:${port}`);

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

// system classes

export class Student {
  // user class from interface management
  constructor(_id, name, accountType, platform, level, leftTT, rightTT) {
    this._id = _id;
    this.name = name;
    this.accountType = accountType;
    this.platform = platform;
    this.connected = false;
    this.leftTT = leftTT;
    this.rightTT = rightTT;
    this.level = level;

    // nav attributes
    this.TT = [];
    this.ttOnScreen = {};
    this.index = 4;

    this.resetTT = () => {
      this.TT = [];
      this.ttOnScreen = undefined;
    }

    this.goToRef = (e) => {
      this.index = new Number(e.target.innerHTML) - 1;
      this.ttOnScreen = this.TT[this.index];
      this.displayTT(this.ttOnScreen);
      // if (this.accountType === 'coordinator') {
      //     this.displayTT(this.ttOnScreen, 'student');
      // } else {
      //     this.displayTT(this.ttOnScreen, this.accountType);
      // }
    };

    this.ttDirection = () => {
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
        elementDisabled(this.leftTT, true);
      } else {
        elementDisabled(this.leftTT, false);
      }


      // if the index of TT on screen is 4 (maximum index) or the next TT on the right of the TT on screen is undefined, block the right nav else unlock
      if (this.index === 4 || this.TT[this.index + 1] === undefined) {
        elementDisabled(this.rightTT, true);
      } else {
        elementDisabled(this.rightTT, false);
      }

      paginationButtons = document.querySelectorAll("a.paginationButton");
      paginationButtons.forEach((button) => {
        button.addEventListener("click", this.goToRef);
      });
    };

    // user fetching and displaying personal TT
    this.getTT = async () => {
      let data = await fetch('/getTT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
          _id: this._id,
          accountType: this.accountType,
          level: this.level,
          platform: this.platform
        })
      });
      this.TT = await data.json();

      if (this.TT.length > 0) {
        // display and point to latest TT
        this.ttOnScreen = this.TT[this.TT.length - 1];
        this.index = this.TT.length - 1;
        this.displayTT(this.ttOnScreen);
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

      this.displayTT(this.ttOnScreen);

      // if (this.accountType === 'coordinator') {
      //     this.displayTT(this.ttOnScreen, 'student');
      // } else {
      //     this.displayTT(this.ttOnScreen, this.accountType);
      // }
    };

    this.displayTT = (TT) => {
      // function to display a TT on screen at a time

      if (TT) {
        let cells = TT.cells; // getting cell info
        let week = TT.week; // getting week info

        // displaying first and last dates of week
        document.querySelector('#firstD').innerHTML = new Date(week.firstDay).toDateString();
        document.querySelector('#lastD').innerHTML = new Date(week.lastDay).toDateString();

        // getting all cell output fields in table to display cell content
        let output = document.querySelector('.displayTT').querySelectorAll('.display');

        // displaying cell info
        cells.forEach((cell, index) => {
          let out = output[index].querySelector('a');
          out.innerHTML = "";
          out.innerHTML = `<br>${cell.courseInfo} <br> ${cell.lecturerName} <br> ${cell.venue} <br><br>`;
          // let out = output[index].querySelectorAll('output');
          // out[0].value = cell.courseInfo;
          // out[1].value = cell.lecturerName;
          // out[2].value = cell.venue;
        });

      } else {
        let output = document.querySelector('.displayTT').querySelectorAll('.display');
        output.forEach((out, index) => {
          out = output[index].querySelector('a');
          out.innerHTML = "";
          // let info = out.querySelectorAll('a');
          // info[0].value = "";
          // info[1].value = "";
          // info[2].value = "";
        });
      }
      this.ttDirection();
    }

    this.showCell = (e) => {
      let cell;
      if (e.target.tagName !== "TD") {
        cell = e.target.parentNode.querySelectorAll('output');
      } else {
        cell = e.target.querySelectorAll('output');
      }
      let cellIndex = cell[cell.length - 1].value;
      cell = this.ttOnScreen.cells[cellIndex];
      console.log(`
Date: ${new Date(cell.periodStart).toDateString()}
---------------------
> Start: ${new Date(cell.periodStart).getHours()}:${new Date(cell.periodStart).getMinutes()}
> Stop: ${new Date(cell.periodStop).getHours()}:${new Date(cell.periodStop).getMinutes()}
> Course Info : ${cell.courseInfo}
> Lecturer Name : ${cell.lecturerName}
> Venue : ${cell.venue}\n`);
    }
  }

}

export class Lecturer extends Student {
  constructor(_id, name, accountType, platform, leftTT, rightTT, connected = false, TT = [], avail_TT = [], temp_TT = []) {
    super(_id, name, accountType, platform, connected, TT);
    // this.connected;
    this.aval_TT = avail_TT;
    this.temp_TT = temp_TT;
    this.leftTT = leftTT;
    this.rightTT = rightTT;

    this.displayTT = (TT) => {
      // function to display a TT on screen at a time

      if (TT) {
        let cells = TT.cells; // getting cell info
        let week = TT.week; // getting week info

        // displaying first and last dates of week
        document.querySelector('#firstD').innerHTML = new Date(week.firstDay).toDateString();
        document.querySelector('#lastD').innerHTML = new Date(week.lastDay).toDateString();

        // getting all cell output fields in table to display cell content
        let output = document.querySelector('.displayTT').querySelectorAll('.display');

        // displaying cell info
        cells.forEach((cell, index) => {
          let out = output[index].querySelector('a');
          out.innerHTML = "";
          out.innerHTML = `<br>${cell.courseInfo} <br> ${cell.level} <br> ${cell.venue} <br><br>`;
        });

      } else {
        let output = document.querySelector('.displayTT').querySelectorAll('.display');
        output.forEach((out, index) => {
          out = output[index].querySelector('a');
          out.innerHTML = "";
          // let info = out.querySelectorAll('output');
          // info[0].value = "";
          // info[1].value = "";
          // info[2].value = "";
        });
      }
      this.ttDirection();
    }

    this.showCell = (e) => {
      let cell;
      if (e.target.tagName !== "TD") {
        cell = e.target.parentNode.querySelectorAll('output');
      } else {
        cell = e.target.querySelectorAll('output');
      }
      let cellIndex = cell[cell.length - 1].value;
      cell = this.ttOnScreen.cells[cellIndex];
      console.log(`
Date: ${new Date(cell.periodStart).toDateString()}
---------------------
> Start: ${new Date(cell.periodStart).getHours()}:${new Date(cell.periodStart).getMinutes()}
> Stop: ${new Date(cell.periodStop).getHours()}:${new Date(cell.periodStop).getMinutes()}
> Course Info : ${cell.courseInfo}
> Level : ${cell.level}
> Venue : ${cell.venue}\n`);
    }

    this.resetAvailTT = async () => {
      let reset = await fetch('/resetAvail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
          _id: this._id
        })
      });
      let result = await reset.json();
      console.log(result, 'Done!');
    };
  }
}

export class Coordinator extends Student {
  constructor(_id, name, accountType, platform, leftTT, rightTT, connected) {
    super(_id, name, accountType, platform, connected);
    this.leftTT = leftTT;
    this.rightTT = rightTT;
    this.TT_Defaults; // = { week: {}, periods: [] }

    this.getMyDefaults = async () => {
        this.TT_Defaults = await fetch('/getMyDefaults', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json;charset=utf-8'
          },
          body: JSON.stringify({
            _id: this._id
          })
        });
        this.TT_Defaults = await this.TT_Defaults.json();
        // console.log(this.TT_Defaults)
      },

      this.setMyDefaults = async () => {
        let data = await fetch('/setMyDefaults', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json;charset=utf-8'
          },
          body: JSON.stringify({
            _id: this._id,
            TT_Defaults: {
              week: this.TT_Defaults.week,
              periods: this.TT_Defaults.periods
            }
          })
        });
        this.TT_Defaults = await data.json();
      }

    this.getMyDefaults();
  }
}

export class Admin extends Student {
  constructor(_id, name, accountType, platform, connected, TT, sysDefaults) {
    super(_id, name, accountType, platform, connected, TT);
    this.sysDefaults = sysDefaults;
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
    let weekS = new Date(new Date(firstDay).getFullYear(), new Date(firstDay).getMonth(), new Date(firstDay).getDate(), 0, 0, 0, 0);

    let weekE = new Date(new Date(lastDay).getFullYear(), new Date(lastDay).getMonth(), new Date(lastDay).getDate(), 0, 0, 0, 0);
    weekS.setHours(6, 0, 0, 0);
    weekE.setHours(6, 0, 0, 0);
    this.firstDay = weekS.getTime();
    this.lastDay = weekE.getTime();
  }
}

export class Cell {
  // The cell object constructor

  constructor(courseName, courseInfo, lecturerName, venue, state, lecturerId, periodStart, periodStop) {
    this.courseName = courseName;
    this.courseInfo = courseInfo;
    this.lecturerName = lecturerName;
    this.lecturerId = lecturerId;
    this.venue = venue;
    this.state = state; // P, J, A
    this.periodStart = periodStart;
    this.periodStop = periodStop;
  }
}

// functions
async function getSysDefaults() {

  sysDefaults = await fetch('/getSysDefaults', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({
      _id: 'ROOT'
    })
  });

  sysDefaults = await sysDefaults.json();
  return sysDefaults;
}

export function millisecondsToDays(milliseconds) {
  return parseInt(milliseconds / 86400000);
}

export function sendMessage() {
  let message = document.querySelector('#messageOut').value.trim();
  let receiver = document.querySelector('#receiverId').value;
  document.querySelector('#messageIn').innerHTML += `${message}<br>`;
  socket.emit('message', {
    sender: Me.name,
    message,
    receiver
  });
}

export function elementDisabled(id, bool) {
  // function to disable any HTML element by id
  document.querySelector(id).disabled = bool;
}

export function takeColorIfNotDisabled(target, color) {
  if (!target.disabled) {
    target.style.borderBottom = color;
  }
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

  sysDefaults.sysBreaks.forEach(pause => breaks.push(pause.index));

  breaks = new Set(breaks.sort());
  let rows = sysDefaults.sysPeriods.length / 2;
  let cols = sysDefaults.sysWeekDays;

  // getting div container to place generated TT in
  let container = document.querySelector(target);

  // creating table
  let table = document.createElement("table");

  // setting table attributes (like class || id)
  table.setAttribute("class", 'displayTT w3-table w3-bordered w3-centered');
  // table.setAttribute("id", user._id);

  // creating table header with elements constituting table header
  let thead = document.createElement('tr');
  thead.innerHTML = `<th> <span id="firstD"></span><br><span id="lastD"></span> </th> <th>MONDAY</th> <th>TUESDAY</th> <th>WEDNESDAY</th> <th>THURSDAY</th> <th>FRIDAY</th> <th>SATURDAY</th> <th>SUNDAY</th>`;

  // appending header to table
  table.appendChild(thead);

  let timer = 0;
  let cellIndex = 0;
  for (let i = 0; i < rows; i++) {
    // creation of remaining table rows with their data by iteration

    let tr = document.createElement('tr');
    tr.innerHTML = `<td class="timeSection"> <br> <a class="time">Start: ${sysDefaults.sysPeriods[timer]} <br> Stop: ${sysDefaults.sysPeriods[timer+1]}</a></td>`;

    //  `<td class="timeSection">
    // Start: <output class="time">${sysDefaults.sysPeriods[timer]}</output>
    // <br>
    // Stop: <output class="time">${sysDefaults.sysPeriods[timer+1]}</output>
    //  </td>`;

    for (let j = 0; j < cols; j++) {

      // <br>
      //     <output type="text" value="Course name"></output>
      //     <br>
      //     <output type="text" value="Lecturer"></output>
      //     <br>
      //     <output type="text" value="Venue"></output>

      tr.innerHTML +=
        `<td class="tdCell display">
                <a></a>
                <output type="text" value="cellIndex" style="display:none;">${cellIndex}</output>
            </td>`;
      cellIndex++;
    }
    table.appendChild(tr);

    if (breaks.has(i)) {
      let pause = findElement("index", i, sysDefaults.sysBreaks);
      table.innerHTML += `<tr ><td colspan='${cols + 1}' class='break'>${pause.name}</td></tr>`;
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
            <div class = "navSection" ><input type="button" id="left" value="<" class="button"> | <input class="button" id="editPresentTT" type="button" value="Edit" disabled> | <input type="button" id="right" value=">" class="button"> </div>`;
  }

  container.innerHTML += `
    <div class="w3-center">
    <div class="w3-bar">
    ${paginationSection} ${navSection}
    </div>
    </div>`;
  return table;
}

export async function generateCoordinatorTT(target) {
  // function to generate coordinator's TT

  let sysDefaults = await getSysDefaults();
  let rows = sysDefaults.sysPeriods.length / 2;
  let cols = sysDefaults.sysWeekDays;

  let container = document.querySelector(target);
  let table = document.createElement("table");
  table.setAttribute("class", 'w3-table w3-bordered w3-centered');
  let div = document.createElement("div");
  div.innerHTML = `<span><h4>Admin TimeTable</h4></span>`;

  let thead = document.createElement('tr');
  thead.innerHTML = `<th><input type="date" id="weekS" placeholder="week start"><br><input type="date" id="weekE" placeholder="week end"></th> <th>MONDAY</th> <th>TUESDAY</th> <th>WEDNESDAY</th> <th>THURSDAY</th> <th>FRIDAY</th> <th>SATURDAY</th> <th>SUNDAY</th>`;
  table.appendChild(thead);

  let timer = 0;
  for (let i = 0; i < rows; i++) {

    let tr = document.createElement('tr');
    tr.innerHTML += `<td class="timeSection">
            <div>
            Start: <input type="time" class="adTime" value="${sysDefaults.sysPeriods[timer]}" disabled></input>
            <br>
            Stop: <input type="time" class="adTime" value="${sysDefaults.sysPeriods[timer+1]}" disabled></input>
            </div>
         </td>`;

    for (let j = 0; j < cols; j++) {
      tr.innerHTML += `
            <td>
            <div class='cell'>
                <br>
                <input list="Courses" type="text" placeholder="Course name">
                <br>
                <input list="Lecturers" type="text" placeholder="Lecturer">
                <br>
                <input list="Venues" type="text" placeholder="Venue">
                <br>
                <input type="checkbox" class="form-check-input"/>Joint Class
                
                <input class="periodStart" style="display:none;">
                </input><input class="periodStop" style="display:none;"></input>
            </div>
            </td>`;
    }
    table.appendChild(tr);
    timer += 2;
  }
  div.appendChild(table);
  container.appendChild(div);
  container.innerHTML += `
    <div class="w3-center">
        <div class="w3-bar">
            <input class="button" id="Validate" type="button" value="Validate"> | <input class="button" id="preview" type="button" value="Preview" disabled> | <input class="button"    id="sendButton" type="button" value="Send" disabled>
        </div>
    </div> `;
  return table;
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

export function userTTInit(noCells = 42, initValue = {
  courseInfo: '',
  level: '',
  venue: ""
}) {
  // returns an array of info of user's choice; good to initialize other collections
  let arr = [];
  for (let i = 0; i < noCells; i++) {
    arr[i] = initValue;
  }
  return arr;
}