import * as fx from "./fx.js";

// Color object for entire sys
export const color = {
  Ok: "gray",
  SuccessGreen: "#4CAF50", // green
  SuccessBlue: "#2196F3", // ; dodgerblue
  Info: "#00bcd4",
  Warning: "#ff9800", // orange
  Danger: "#f44336", // red
};

// Actors
export class User {
  // user class from interface management
  constructor(_id, name) {
    this._id = _id;
    this.name = name;
    this.accountType;
    this.lastSeen;
    this.platform = "web";

    this.socket;
    this.contacts = [];
    this.chats = [];
    this.chatGroups = [];
  }

  main = async () => {};

  userInit = async () => {};

  // this hostLink is the web address for socket connection
  connectToSocket = async (hostLink = `http://${"localhost"}:${45000}`) => {
    this.socket = io(hostLink);

    this.socket.on("connect", async () => {
      this.socket.emit("/book-me", {
        _id: this._id,
        name: this.name,
        accountType: this.accountType,
      });
    });

    this.socket.on("disconnect", () => {
      this.showSnackBar(`${this.name} is now offline`);
    });

    this.socket.on("/online", (res) => {
      if (res.user_id === this._id) {
        this.showSnackBar("you're online");
      } else {
        this.showSnackBar(res.message);
      }
    });

    this.socket.on("/reloadDbData", async (updater) => {
      await this.getDbData(document.querySelector("#Groups").value);

      let weekToProgram = new Week(new Date(this.program_TT.weekStart.value));

      let group = fx.findElement("_id", document.querySelector("#Groups").value, this.groupDb)
        .element;
      this.groupDisplay_TT.TT = group.TT;

      let ttOfThisWeek = fx.findElement("week", weekToProgram, this.groupDisplay_TT.TT);

      if (ttOfThisWeek) {
        this.groupDisplay_TT.index = ttOfThisWeek.index;
      } else if (this.groupDisplay_TT.TT.length > 0) {
        this.groupDisplay_TT.index = this.groupDisplay_TT.TT.length - 1;
      }

      this.groupDisplay_TT.ttOnScreen = this.groupDisplay_TT.TT[this.groupDisplay_TT.index];

      this.groupDisplay_TT.display(this.groupDisplay_TT.ttOnScreen);

      if (this.groupDisplay_TT.TT.length > 0) {
        fx.elementDisabled("#editPresentTT", false);
      } else {
        fx.elementDisabled("#editPresentTT", true);
      }

      fx.elementDisabled("#sendGroupTT", true);

      this.showSnackBar(`My data has been reloaded because ${updater.name} updated some TTs`);
    });

    this.socket.on("/newTT", async (updater) => {
      await this.getTT();
    });
  };

  getSysDefaults = async () => {
    // function to get system default configs
    // ******** this would be a post request so that each user can get only data available for his accountType

    return await (await fetch("/admin/getSysDefaults")).json();
  };

  getMyInfo = async () => {
    let myData = await fx.postFetch("/user/getMyInfo", { _id: this._id, platform: this.platform });
    let message;

    if (myData) {
      Object.keys(myData).forEach((key) => {
        if (key == "TT") {
          this.ownTT.TT = myData.TT;
          this.selectTT();
          this.ownTT.display(this.ownTT.ttOnScreen, this.accountType);
        } else {
          this[key] = myData[key];
          if (key == "avail") {
            this.loadAvail(this.avail.defaultAvail);
          }
        }
      });

      message = "Data fetched successfully";
    } else {
      message = `Could not fetch ${this._id}'s data.`;
    }

    this.showSnackBar(message);
  };

  getAccType = async (_id) => await fx.postFetch("/user/getAccType", { _id });

  addContact = async (_id, name, email = "") => {
    let accountType = await this.getAccType(_id);

    if (accountType) {
      this.contacts.push(new Contact(_id, name, { email, accountType }));
      console.log(
        `${name} was added to your contact list with success. Contact list: `,
        this.contacts
      );
    } else {
      console.log(`The user with id ${_id} does not exist. verify that id`);
    }
  };

  setUserEventListener = () => {
    // adding event listeners to TT elements

    document.querySelector("#getTT").addEventListener("click", this.getTT);

    // if (this.accountType == "Coordinator") {
    //   this.groupDisplay_TT.periods.forEach((period) => {
    //     period.addEventListener("click", this.showPeriod);
    //     period
    //       .querySelectorAll("input.displayPeriod")
    //       .forEach((displayField) => displayField.addEventListener("click", this.showPeriod));
    //   });
    // }
  };

  // user fetching and displaying personal TT
  getTT = async () => {
    // method to get user TT

    this.ownTT.TT = await fx.postFetch("/user/getTT", {
      _id: this._id,
      accountType: this.accountType,
      group_id: this.group_id,
      platform: this.platform,
    });

    this.selectTT();
    this.ownTT.display(this.ownTT.ttOnScreen, this.accountType);
    this.showSnackBar("TTs fetched with success");
  };

  selectTT = (week = new Week()) => {
    // method to get the TT of a specific week

    if (this.ownTT.TT.length > 0) {
      let ttOfThisWeek = fx.findElement("week", week, this.ownTT.TT);

      if (ttOfThisWeek) {
        this.ownTT.ttOnScreen = ttOfThisWeek.element;
        this.ownTT.index = ttOfThisWeek.index;
      } else {
        this.ownTT.ttOnScreen = this.ownTT.TT[this.ownTT.TT.length - 1];
        this.ownTT.index = this.ownTT.TT.length - 1;
      }
    } else {
      this.ownTT.ttOnScreen = undefined;
    }
  };

  showSnackBar = (message) => {
    let x = document.querySelector("#snackbar");
    x.innerText = message;
    x.classList.add("show");
    setTimeout(function () {
      x.classList.remove("show");
    }, 3000);
  };
}

export class Admin extends User {
  constructor(_id, name) {
    super(_id, name);
    this.accountType = "Admin";
    this.sysDefaults = sysDefaults; // default config of entire institution
  }

  setSysDefaults = async () => {
    // method to set/uoDate system default configs
    // Admin designs TT structure (class TT and exam TT)
  };

  // let sysAdmin = new schemas.Admin({
  //   _id: "ROOT",
  //   name: "ROOT",
  //   accountType: "admin",
  //   sysDefaults: {

  //     periods: [
  //       new Period("08:00", "09:50"),
  //       new Period("10:10", "12:00"),
  //       new Period("13:00", "14:50"),
  //       new Period("15:10", "17:00"),
  //       new Period("17:30", "19:30"),
  //       new Period("20:00", "21:30")
  //     ],

  //     weekDays: 7,
  //     pauses: [
  //       new Pause("Morning Pause", 0),
  //       new Pause("Long Pause", 1),
  //       new Pause("Afternoon Pause", 2),
  //       new Pause("Closing", 3),
  //       new Pause("Evening Pause", 4),
  //     ],
  //   },
  // });
}

// Other Actor classes
export class Person {
  /**
   * As of now, this class is useful for:
   *  - know a person's number seat(s) during programs and as such,
   *  - calculating the actual proportion of seats to venue capacity for a program
   */
  constructor(_id, seats = 1) {
    this._id = _id; // person id
    this.seats = seats; // number of seats a person has during an event
  }
}

export class Contact {
  /**
   * this class is to store up a user's contacts for chat messaging
   */
  constructor(_id, name, { email = "", accountType = "" } = { email: "", accountType: "" }) {
    this._id = _id;
    this.name = name;
    this.accountType = accountType;
    this.email = email;
  }
}

// Other Data Structures
export class Week {
  constructor(day) {
    let lastDay;
    let firstDay;
    let dayOfWeek;

    if (
      day instanceof Date ||
      (day instanceof String && Date.parse(day)) ||
      (day && day.toString().length >= 13 && day > 0)
    ) {
      day = new Date(day);
    } else {
      day = new Date();
    }

    dayOfWeek = day.getDay();

    if (dayOfWeek === 0) {
      firstDay = new Date(new Date(day).setDate(day.getDate() - 6));
      lastDay = new Date(day);
    } else {
      firstDay = new Date(new Date(day).setDate(day.getDate() - (day.getDay() - 1)));
      lastDay = new Date(new Date(firstDay).setDate(firstDay.getDate() + 6));
    }

    this.firstDay = new Date(
      new Date(firstDay).getFullYear(),
      new Date(firstDay).getMonth(),
      new Date(firstDay).getDate(),
      1,
      0,
      0,
      0
    ).getTime(); // first day of week to programm

    this.lastDay = new Date(
      new Date(lastDay).getFullYear(),
      new Date(lastDay).getMonth(),
      new Date(lastDay).getDate(),
      23,
      59,
      0,
      0
    ).getTime(); // last day of week to programm
  }

  toDateString = () => {
    return {
      firstDay: new Date(this.firstDay).toDateString(),
      lastDay: new Date(this.lastDay).toDateString(),
    };
  };

  toFullDateString = () =>
    `Week of ${new Date(this.firstDay).toDateString()} to ${new Date(this.lastDay).toDateString()}`;

  toSubString = () => {
    return {
      firstDay: new Date(this.firstDay).toISOString().substring(0, 10),
      lastDay: new Date(this.lastDay).toISOString().substring(0, 10),
    };
  };

  // console.log(`Week of ${new Date(this.firstDay)} to ${new Date(this.lastDay)}`);

  has = (day) => {
    if (this.firstDay <= day && day <= this.lastDay) {
      return true;
    }
    return false;
  };

  add = (num = 0) => {
    return new Week(new Date(this.firstDay).setDate(new Date(this.firstDay).getDate() + 7 * num));
  };

  getNextWeek = (day) => {
    if (!day) {
      day = new Week().firstDay;
    }
    return new Week(new Date(day).setDate(new Date(day).getDate() + 7));
  };
}

export class Period {
  // The period object constructor

  constructor(
    courseName = "",
    courseInfo = "",
    lecturerName = "",
    group_id = "",
    venue_id = "",
    state = "",
    lecturer_id = "",
    start = Date.now(),
    stop = Date.now()
  ) {
    this.courseName = courseName; // name of course programmed
    this.courseInfo = courseInfo; // info of course programmed like hours left / total hours set
    this.lecturerName = lecturerName; // name of lecturer programmed
    this.group_id = group_id; // group programmed
    this.lecturer_id = lecturer_id; // id of lecturer programmed
    this.venue_id = venue_id; // venue where class will hold
    this.state = state; // A -> available, P -> programmed, J -> Joint
    this.start = start; // period start time
    this.stop = stop; // period stop time
  }

  empty = () => {
    return new Period("", "", "", "", "", "", "A", this.start, this.stop);
  };
}

export class Event {
  // the same event can take place at the same time in diff venues
  constructor(
    name = "",
    start = new Date().getTime(),
    stop = new Date().getTime(),
    personsInCharge = [],
    participants = [],
    venue_id = "", // venue _id
    venueState = "A",
    programmedBy = { _id: "", name: "" },
    programmedOn = new Date().getTime()
  ) {
    this.name = name; // name of event
    this.start = start; // event start time
    this.stop = stop; // event stop time
    this.personsInCharge = personsInCharge; // [Person:{_id, seats}] -> collection of persons to coordinate the event
    this.participants = participants; // [Person:{_id, seats}] -> collection of persons other than coordinators partaking in event
    this.venue_id = venue_id; // venue concerned with event
    this.venueState = venueState; // A -> available, P -> programmed, J -> Joint
    this.programmedBy = programmedBy;
    this.programmedOn = programmedOn;
  }

  empty = () => {
    return new Event(
      "",
      this.start,
      this.stop,
      [],
      [],
      "",
      "A",
      { _id: "", name: "" },
      new Date().getTime()
    );
  };
}

export class Avail {
  constructor(
    state = "A",
    { coordinator = { _id: "", name: "" } } = { coordinator: { _id: "", name: "" } }
  ) {
    this.state = state;
    this.coordinator = coordinator;
  }
}

export class Program {
  constructor(week = new Week(), events = []) {
    this.week = week; //
    this.events = events; // collection of events
  }
}

export class Pause {
  constructor(name, index) {
    this.name = name;
    this.index = index;
  }
}

// UI TT Templates
class TT {
  constructor() {}

  setHeader = (weekToProgram) => {
    // re-organising dates in table header
    if (weekToProgram && weekToProgram.firstDay && weekToProgram.has(Date.now())) {
      let th_days_date = new Date();
      th_days_date = th_days_date.getDay();

      if (th_days_date === 0) {
        th_days_date = this.th_days.length;
      }

      this.th_days.forEach((th, index) => {
        index + 1 === th_days_date
          ? th.setAttribute("class", "w3-small dayOfWeek today")
          : th.setAttribute("class", "w3-small dayOfWeek");
      });
    } else {
      this.th_days.forEach((th, index) => th.setAttribute("class", "w3-small dayOfWeek"));
    }
  };
}

export class DisplayTT extends TT {
  /**
   * TT used by students, lecturers and coords to view their TT schedules
   * @param {*} _id unique identifier to be given to this TT
   * @param {*} targetContainer target div in which this TT will place itself
   * @param {*} userAccountType accountType of user generating this TT
   * @param {*} purpose reason of use of this TT because a coord has more than one of such
   * @param {*} sysDefaults data from db needed to generate this TT
   */
  constructor(
    _id,
    targetContainer,
    userAccountType = "Student",
    purpose = "userDisplay",
    sysDefaults
  ) {
    super();

    this._id = _id;
    this.targetContainer = targetContainer;
    this.userAccountType = userAccountType;
    this.nav_id = `${this._id}-nav`;
    this.pagination_id = `${this._id}-page`;
    this.purpose = purpose;
    this.sysDefaults = sysDefaults;

    this.TT = [];
    this.ttOnScreen = {};
    this.index;
    this.displayModal = new DisplayModal();
  }

  main = () => {
    /**
     * only to be called right at the bottom of the this.show() method
     */

    let thisTT = document.querySelector(`#${this._id}`);
    this.weekStart = thisTT.querySelector("#firstD");
    this.weekEnd = thisTT.querySelector("#lastD");
    this.periods = thisTT.querySelectorAll(".period");
    this.periodTime = thisTT.querySelectorAll("input.periodTime");
    this.th_days = thisTT.querySelectorAll(".dayOfWeek");

    // adding event listeners to display TT
    this.periods.forEach((period) => {
      period.addEventListener("click", this.showPeriod);
      period
        .querySelectorAll("input.displayPeriod")
        .forEach((displayField) => displayField.addEventListener("click", this.showPeriod));
    });

    // adding event listeners to TT nav items
    let editButton = document.querySelector("#editPresentTT");
    if (editButton) {
      editButton.addEventListener("click", this.loadTTForEditing);
    }

    setInterval(this.refresh, 1000);
  };

  show = () => {
    // method to make this TT visible on screen

    let rows = this.sysDefaults.periods.length;
    let cols = this.sysDefaults.weekDays;

    // getting div container to place generated TT in
    let container = document.querySelector(this.targetContainer);
    container.innerHTML = "";

    // creating table
    let table = document.createElement("table");

    // setting table attributes (like class || id)
    table.setAttribute("class", "timetable");
    // table.style.color = "black";
    table.setAttribute("id", this._id);

    // creating table header with elements constituting table header
    let thead = document.createElement("tr");
    thead.innerHTML = `<th class="w3-small"> <span id="firstD"></span> <br> <span id="lastD"></span> </th>`;

    let weekDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

    weekDays.forEach((day) => {
      thead.innerHTML += `<th class="w3-small dayOfWeek">${day}</th>`;
    });

    // appending header to table
    table.appendChild(thead);

    let tbody = document.createElement("tbody");

    let timer = 0;
    let periodIndex = 0; // Very uselful to get info about a period
    for (let i = 0; i < rows; i++) {
      // creation of remaining table rows with their data by iteration
      let tr = document.createElement("tr");
      tr.innerHTML = `<td class="w3-small sticky timeSection"> <br> <input class="periodTime" type="text" value="${this.sysDefaults.periods[timer].start}"readonly> <br><input class="periodTime" type="text" value="${this.sysDefaults.periods[timer].stop}"readonly></td>`;

      for (let j = 0; j < cols; j++) {
        tr.innerHTML += `
        <td class="w3-small period">

        <div class="programPopup">
          <input class="displayPeriod" type="text" readonly></input>
          <input class="displayPeriod" type="text" readonly></input>
          <input class="displayPeriod" type="text" readonly></input>
          <input class="displayPeriod" type="text" readonly></input>
          <span class="popuptext"></span>
        </div>
        <br>
        
        <output class="periodIndex" type="text" style="display:none;">${periodIndex}</output>
        </td>`;
        periodIndex++;
      }

      tbody.appendChild(tr);

      // Addition of pauses won't work if system pauses added by admin aren't added at their indices
      if (this.sysDefaults.pauses[i]) {
        let pause = this.sysDefaults.pauses[i];
        tbody.innerHTML += `<tr><td colspan='${cols + 1}' class="break">${pause.name}</td></tr>`;
      }
      timer += 1;
    }

    table.appendChild(tbody);
    // appending table to container div
    container.appendChild(table);

    let navSection = document.createElement("div");
    navSection.setAttribute("id", this.nav_id);
    navSection.setAttribute("class", "navSection w3-center");

    let pagination = document.createElement("div");
    pagination.setAttribute("id", this.pagination_id);
    pagination.setAttribute("aria-label", "Page navigation example");

    navSection.appendChild(pagination);

    if (this.userAccountType === "Coordinator" && this.purpose === "coordDisplay") {
      navSection.innerHTML += `<input class="button" id="editPresentTT" type="button" value="Edit" disabled>`;
    } else {
      navSection.innerHTML += `<input type="button" id="getTT" value="Check TT" class="button">`;
    }

    container.parentNode.appendChild(navSection);

    this.main();
  };

  display = (TT) => {
    // function to display a TT on screen at a time
    let displayTT = document.querySelector(`#${this._id}`);

    // getting all period output fields in table to display period content
    let output = displayTT.querySelectorAll(".period");

    if (TT) {
      let periods = TT.periods; // getting period info
      let week = TT.week; // getting week info

      // displaying first and last dates of week
      this.weekStart.innerHTML = new Date(week.firstDay).toDateString();
      this.weekEnd.innerHTML = new Date(week.lastDay).toDateString();

      // displaying period info
      periods.forEach((period, index) => {
        let out = output[index].querySelectorAll("input");

        out[0].value = period.courseInfo;
        out[1].value = period.lecturerName;
        out[2].value = period.venue_id;
        out[3].value = period.group_id;
      });
    } else {
      this.weekStart.innerHTML = "";
      this.weekEnd.innerHTML = "";

      output.forEach((period, index) => {
        let out = output[index].querySelectorAll("input");

        out[0].value = "";
        out[1].value = "";
        out[2].value = "";
        out[3].value = "";
      });
    }

    this.refresh();
    this.ttDirection();
  };

  goToRef = (e) => {
    this.index = new Number(e.target.innerHTML) - 1;
    this.ttOnScreen = this.TT[this.index];
    this.display(this.ttOnScreen);
  };

  ttDirection = () => {
    // function to enable left and right navs buttons when needed
    let pagination = document.querySelector(`#${this.pagination_id}`);
    pagination.innerHTML = "";
    let paginationButtons;

    for (let i = 0; i < this.TT.length; i++) {
      if (i === 0) {
        paginationButtons = "";
      }
      if (i === this.index) {
        paginationButtons += `<li class="nav-item"><a class="nav-link paginationButton active" data-toggle="pills">
        ${i + 1}</a> </li>`;
      } else {
        paginationButtons += `<li class="nav-item"><a class="nav-link paginationButton" data-toggle="pills">
        ${i + 1}</a></li>`;
      }
    }

    if (paginationButtons) {
      pagination.innerHTML += `
      <ul class="nav nav-pills justify-content-center mt-2">
        ${paginationButtons}
        </ul>`;
    } else {
      pagination.innerHTML += "No time table to display";
    }

    paginationButtons = document.querySelectorAll("a.paginationButton");
    paginationButtons.forEach((button) => {
      button.addEventListener("click", this.goToRef);
    });
  };

  showPeriod = (e) => {
    // getting value of last output field in clicked period

    let periodIndex;
    let period;
    let message = { header: "", body: "", footer: "" };

    if (e.target.tagName == "TD") {
      periodIndex = e.target.querySelector("output.periodIndex").value;
    } else {
      periodIndex = e.target.closest("TD").querySelector("output.periodIndex").value;
    }
    // console.log(periodIndex);

    if (this.ttOnScreen && this.weekStart.innerHTML !== "") {
      period = this.ttOnScreen.periods[periodIndex];

      // console.log(fx.getDuration(period));

      let oldPeriod = this.ttOnScreen.oldPeriods[periodIndex];

      message.header = `${new Date(period.start).toDateString()}<br>
      ${new Date(period.start).getHours() === 0 ? "00" : new Date(period.start).getHours()}:${
        new Date(period.start).getMinutes() === 0 ? "00" : new Date(period.start).getMinutes()
      } - ${new Date(period.stop).getHours() === 0 ? "00" : new Date(period.stop).getHours()}:${
        new Date(period.stop).getMinutes() === 0 ? "00" : new Date(period.stop).getMinutes()
      }`;

      if (!oldPeriod || fx.equalPeriods(period, oldPeriod)) {
        message.body = `
          Course Info : ${period.courseInfo}<br>
          Lecturer Name : ${period.lecturerName}<br>
          Group : ${period.group_id}<br>
          Venue : ${period.venue_id}<br>
          Programmed on : ${
            this.ttOnScreen.uDate ? new Date(this.ttOnScreen.uDate).toDateString() : "N\\A"
          } at ${
          new Date(this.ttOnScreen.uDate).getHours() === 0
            ? "00"
            : new Date(this.ttOnScreen.uDate).getHours()
        }:${
          new Date(this.ttOnScreen.uDate).getMinutes() === 0
            ? "00"
            : new Date(this.ttOnScreen.uDate).getMinutes()
        }:${
          new Date(this.ttOnScreen.uDate).getSeconds() === 0
            ? "00"
            : new Date(this.ttOnScreen.uDate).getSeconds()
        }`;
      } else {
        // logging updated data first
        message.body = `
          <span style="color:blue">Updated Data</span><br>
          <br>
          Course Info : ${period.courseInfo}<br>
          Lecturer Name : ${period.lecturerName}<br>
          Group : ${period.group_id}<br>
          Venue : ${period.venue_id}<br>
          Updated on : ${
            this.ttOnScreen.uDate ? new Date(this.ttOnScreen.uDate).toDateString() : "N\\A"
          } at ${
          new Date(this.ttOnScreen.uDate).getHours() === 0
            ? "00"
            : new Date(this.ttOnScreen.uDate).getHours()
        }:${
          new Date(this.ttOnScreen.uDate).getMinutes() === 0
            ? "00"
            : new Date(this.ttOnScreen.uDate).getMinutes()
        }:${
          new Date(this.ttOnScreen.uDate).getSeconds() === 0
            ? "00"
            : new Date(this.ttOnScreen.uDate).getSeconds()
        }

              <br>
              <hr style="color:5px solid gray;">
              <br>

          <span style="color:red">Old Data</span><br>
          <br>
          Course Info : ${oldPeriod.courseInfo}<br>
          Lecturer Name : ${oldPeriod.lecturerName}<br>
          Group : ${oldPeriod.group_id}<br>
          Venue : ${oldPeriod.venue_id}<br>
          Programmed on : ${
            this.ttOnScreen.oDate ? new Date(this.ttOnScreen.oDate).toDateString() : "N\\A"
          } at ${
          new Date(this.ttOnScreen.oDate).getHours() === 0
            ? "00"
            : new Date(this.ttOnScreen.oDate).getHours()
        }:${
          new Date(this.ttOnScreen.oDate).getMinutes() === 0
            ? "00"
            : new Date(this.ttOnScreen.oDate).getMinutes()
        }:${
          new Date(this.ttOnScreen.oDate).getSeconds() === 0
            ? "00"
            : new Date(this.ttOnScreen.oDate).getSeconds()
        }`;
      }
    } else {
      message.body = "No Programmed TT yet.";
    }

    this.displayModal.header.innerHTML = message.header;
    this.displayModal.body.innerHTML = message.body;
    this.displayModal.footer.innerHTML = message.footer;
    this.displayModal.show();
  };

  loadTTForEditing = (e) => {
    // function to load a previous TT for editing

    // getting periods of coord TT
    let docPeriods = document.querySelectorAll(".coordPeriod");

    // getting TT to display from TT on screen in display TT of coordinator
    let TT = this.ttOnScreen;
    let week = TT.week;

    // setting the week to program to old TT's programmed week
    document.querySelector("#weekStart").value = new Date(week.firstDay)
      .toISOString()
      .substring(0, 10);
    document.querySelector("#weekEnd").value = new Date(week.lastDay)
      .toISOString()
      .substring(0, 10);

    // filling coord TT with required data
    docPeriods.forEach((period, index) => {
      period = period.querySelectorAll("input");
      let ttPeriods = TT.periods;

      period[0].value = ttPeriods[index].courseName;
      period[1].value = ttPeriods[index].lecturerName;
      period[2].value = ttPeriods[index].venue_id;
      if (ttPeriods[index].state === "J") {
        period[3].checked = true;
      } else {
        period[3].checked = false;
      }
      period[4].value = ttPeriods[index].start;
    });
  };

  refresh = () => {
    // console.log("refreshed");
    this.ttOnScreen && this.ttOnScreen.week && this.weekStart.innerHTML !== ""
      ? this.setHeader(new Week(new Date(this.weekStart.innerHTML)))
      : this.setHeader();
  };
}

export class ProgramTT extends TT {
  /**
   * TT used by coords to program lecturers and groups
   * @param {*} _id unique identifier to be given to this TT
   * @param {*} targetContainer target div in which this TT will place itself
   * @param {*} sysDefaults data from db needed to generate this TT
   */
  constructor(_id, targetContainer, sysDefaults) {
    super();

    this._id = _id;
    this.targetContainer = targetContainer;
    this.nav_id = `${this._id}-nav`;
    this.sysDefaults = sysDefaults;
    // this.pagination_id = `${this._id}-page`;

    this.TT = [];
    this.ttOnScreen = {};
    this.index;
  }

  setPeriodDefaults = () => {
    // method to set date and time to each period on program TT

    let weekToProgram = new Week(new Date(this.weekStart.value));

    for (let i = 0; i <= 6; i++) {
      let counter = 0;
      let a = 0;
      let initIndex = i;
      let periodTime = this.periodTime;

      while (counter < periodTime.length / 2) {
        let startTime = periodTime[a].value;
        let stopTime = periodTime[a + 1].value;

        // end of trouble
        let start = new Date(
          new Date(weekToProgram.firstDay).getFullYear(),
          new Date(weekToProgram.firstDay).getMonth(),
          new Date(weekToProgram.firstDay).getDate() + i,
          Number(startTime.slice(0, 2)),
          Number(startTime.slice(3)),
          0,
          0
        );

        let stop = new Date(
          new Date(weekToProgram.firstDay).getFullYear(),
          new Date(weekToProgram.firstDay).getMonth(),
          new Date(weekToProgram.firstDay).getDate() + i,
          Number(stopTime.slice(0, 2)),
          Number(stopTime.slice(3)),
          0,
          0
        );

        let period = this.periods[initIndex];
        period.querySelector("input.start").value = start.getTime();
        period.querySelector("input.stop").value = stop.getTime();

        counter++;
        initIndex += 7;
        a += 2;
      }
    }
  };

  main = () => {
    /**
     * only to be called right at the bottom of the this.show() method
     */

    let thisTT = document.querySelector(`#${this._id}`);

    this.weekStart = thisTT.querySelector("#weekStart");
    this.weekEnd = thisTT.querySelector("#weekEnd");

    this.weekStart.value = new Week().toSubString().firstDay;
    this.weekEnd.value = new Week().toSubString().lastDay;

    this.periods = thisTT.querySelectorAll(".coordPeriod");

    this.periodTime = thisTT.querySelectorAll("input.periodTime");
    this.th_days = thisTT.querySelectorAll(".dayOfWeek");

    // adding event listeners to TT & items
    this.periods.forEach((period) => {
      period.addEventListener("click", this.togglePopup);
    });

    // adding event listeners to TT nav items
    let thisTT_nav = document.querySelector(`#${this.nav_id}`);

    thisTT_nav.querySelector("#clearGroupTT").addEventListener("click", this.clear);
  };

  show = () => {
    // function to generate coordinator's TT

    let rows = this.sysDefaults.periods.length;
    let cols = this.sysDefaults.weekDays;

    // container div where TT will be inserted
    let container = document.querySelector(this.targetContainer);

    let table = document.createElement("table");
    table.setAttribute("id", this._id);
    table.setAttribute("class", "coordTT timetable w3-centered");

    let thead = document.createElement("tr");

    thead.innerHTML = `<th class="w3-small"><input type="date" id="weekStart" placeholder="week start"><br><input type="date" id="weekEnd" placeholder="week end" readonly></th>`;

    let weekDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

    weekDays.forEach((day) => {
      thead.innerHTML += `<th class="w3-small dayOfWeek">${day}</th>`;
    });

    table.appendChild(thead);

    let timer = 0;
    for (let i = 0; i < rows; i++) {
      let tr = document.createElement("tr");
      tr.innerHTML += `
      <td class="w3-small sticky timeSection">
        <br>
        <input class="periodTime" type="time" value="${this.sysDefaults.periods[timer].start}"readonly>
        <br>
        <input class="periodTime" type="time" value="${this.sysDefaults.periods[timer].stop}"readonly>
      </td>`;

      for (let j = 0; j < cols; j++) {
        tr.innerHTML += `
              <td>
                <div class='coordPeriod'>
                  <br>

                  <div class="programPopup">
                    <input list="Courses" type="text" placeholder="Course name">
                    <span class="popuptext"></span>
                  </div>
                  <br>

                  <div class="programPopup">
                    <input list="Lecturers" type="text" placeholder="Lecturer">
                    <span class="popuptext"></span>
                  </div>
                  <br>

                  <div class="programPopup">
                    <input list="Venues" type="text" placeholder="Venue">
                    <span class="popuptext"></span>
                  </div>
                  <br><br>

                  <input type="checkbox" class="form-check-input"/> Joint Class
                  
                  <input class="start" style="display:none;"></input>
                  <input class="stop" style="display:none;"></input>
                </div>
              </td>`;
      }
      table.appendChild(tr);
      timer += 1;
    }

    container.appendChild(table);

    let navSection = document.createElement("div");

    navSection.setAttribute("class", "w3-center w3-bar");
    navSection.setAttribute("id", `${this.nav_id}`);

    navSection.innerHTML = `
          <input class="button" id="clearGroupTT" type="button" value="Clear"> | <input class="button" id="validateGroupTT" type="button" value="Validate"> | <input class="button" id="sendGroupTT" type="button" value="Send" disabled>`;

    container.parentNode.appendChild(navSection);

    this.main();
  };

  clear = () => {
    // method to clear this TT

    this.periods.forEach((period) => {
      period = period.querySelectorAll("input");

      period[0].value = "";
      period[0].disabled = false;
      period[1].value = "";
      period[1].disabled = false;
      period[2].value = "";
      period[2].disabled = false;
      period[3].checked = false;
      period[3].disabled = false;
    });

    console.log("All periods cleared!");
  };

  refresh = (group_id = "", groupDb = []) => {
    // method to match actual date and time with date and time of this TT for accuracy

    let weekToProgram;

    if (Date.parse(this.weekStart.value)) {
      weekToProgram = new Week(new Date(this.weekStart.value));
    } else {
      weekToProgram = new Week();
    }

    this.weekStart.value = weekToProgram.toSubString().firstDay;
    this.weekEnd.value = weekToProgram.toSubString().lastDay;

    this.setPeriodDefaults();

    let today = new Date().getTime();

    weekToProgram.has(today) ? this.setHeader(weekToProgram) : this.setHeader();

    if (weekToProgram.has(today)) {
      // console.log("This Week");

      // first disable periods not to program again
      this.periods.forEach((period, index) => {
        period = period.querySelectorAll("input");

        // console.log(new Date(new Number(period[4].value)), new Date(today));

        if (new Number(period[4].value) <= today) {
          period[0].disabled = true;
          period[1].disabled = true;
          period[2].disabled = true;
          period[3].disabled = true;
          fx.setBorderBColor(period[0], color.Danger);
          fx.setBorderBColor(period[1], color.Danger);
          fx.setBorderBColor(period[2], color.Danger);
        } else {
          period[0].disabled = false;
          period[1].disabled = false;
          period[2].disabled = false;
          period[3].disabled = false;

          if (!period[0].disabled && period[0].style.borderBottom == `2px solid ${color.Ok}`) {
            fx.setBorderBColor(period[0], color.Ok);
          }

          if (!period[1].disabled && period[1].style.borderBottom == `2px solid ${color.Ok}`) {
            fx.setBorderBColor(period[1], color.Ok);
          }

          if (!period[2].disabled && period[2].style.borderBottom == `2px solid ${color.Ok}`) {
            fx.setBorderBColor(period[2], color.Ok);
          }
        }
      });

      if (group_id) {
        let group = fx.findElement("_id", group_id, groupDb).element;
        let prevTT;

        // search for TT with same week in given collection
        if (group) {
          prevTT = fx.findElement("week", weekToProgram, group.TT);
        }

        if (prevTT) {
          prevTT = prevTT.element;

          this.periods.forEach((period, index) => {
            period = period.querySelectorAll("input");
            let prevPeriod = prevTT.periods[index];

            if (new Number(period[4].value) <= today) {
              period[0].value = prevPeriod.courseName;
              period[1].value = prevPeriod.lecturerName;
              period[2].value = prevPeriod.venue_id;
              if (prevPeriod.state === "J") {
                period[3].checked = true;
              } else {
                period[3].checked = false;
              }
            }
          });
        } else {
          this.periods.forEach((period, index) => {
            period = period.querySelectorAll("input");

            if (new Number(period[4].value) <= today) {
              period[0].value = "";
              period[1].value = "";
              period[2].value = "";
              period[3].checked = false;
            }
          });
        }
      }
    } else if (new Week().getNextWeek().firstDay === weekToProgram.firstDay) {
      // console.log("Programming Tt for next week");

      this.periods.forEach((period) => {
        period = period.querySelectorAll("input");

        period[0].disabled = false;
        period[1].disabled = false;
        period[2].disabled = false;
        period[3].disabled = false;
      });
    } else {
      console.log(
        "Either trying to program more than 1 week ahead or trying to program a past week. Not Possible!"
      );

      this.periods.forEach((period) => {
        period = period.querySelectorAll("input");

        period[0].disabled = true;
        period[1].disabled = true;
        period[2].disabled = true;
        period[3].disabled = true;
      });
      fx.elementDisabled("#sendGroupTT", true);
    }
  };

  togglePopup = (e) => {
    // method to show / hide popup notification on program TT very usefuul for validation

    if (e.target.value) {
      let popup = e.target.parentNode.querySelector("span.popuptext");

      popup.classList.toggle("show");
      if (popup.innerText == "") {
        popup.classList.remove("show");
      }
    }
  };
}

export class AvailTT {
  /**
   * TT used by coords and lecturers to state their availability
   * @param {*} _id unique identifier to be given to this TT
   * @param {*} targetContainer target div in which this TT will place itself
   * @param {*} sysDefaults data from db needed to generate this TT
   */
  constructor(_id, targetContainer, sysDefaults) {
    this._id = _id;
    this.targetContainer = targetContainer;
    this.nav_id = `${this._id}-nav`;
    this.pagination_id = `${this._id}-page`;
    this.sysDefaults = sysDefaults;

    this.TT = [];
    this.ttOnScreen = {};
    this.index;
  }

  main = () => {
    let thisTT = document.querySelector(`#${this._id}`);
    this.periods = thisTT.querySelectorAll(".availPeriod");

    this.periodTime = thisTT.querySelectorAll("input.periodTime");
    this.th_days = thisTT.querySelectorAll(".dayOfWeek");

    // adding event listeners to TT nav items
    let thisTT_nav = document.querySelector(`#${this.nav_id}`);
    thisTT_nav.querySelector("#resetAvailTT").addEventListener("click", this.reset);
  };

  show = () => {
    // method to make avail TT visible (generate) on screen

    let rows = this.sysDefaults.periods.length;
    let cols = this.sysDefaults.weekDays;

    // getting div container to place generated TT in
    let container = document.querySelector(this.targetContainer);
    container.innerHTML = "";

    // creating table
    let table = document.createElement("table");

    // setting table attributes (like class || id)
    table.setAttribute("class", "table table-bordered timetable");
    // table.style.color = "black";
    table.setAttribute("id", this._id);

    // creating table header with elements constituting table header
    let thead = document.createElement("tr");

    thead.innerHTML = `<th class="w3-small"> TIME </th>`;

    let weekDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

    weekDays.forEach((day) => {
      thead.innerHTML += `<th class="w3-small dayOfWeek">${day}</th>`;
    });

    // appending header to table
    table.appendChild(thead);

    let timer = 0;
    let periodIndex = 0; // Very uselful to get info about a period
    let tbody = document.createElement("tbody");
    for (let i = 0; i < rows; i++) {
      // creation of remaining table rows with their data by iteration

      let tr = document.createElement("tr");
      tr.innerHTML = `
      <td class="w3-small sticky timeSection"><br>
        <input class="periodTime" type="text" value="${this.sysDefaults.periods[timer].start}" readonly><br>
        <input class="periodTime" type="text" value="${this.sysDefaults.periods[timer].stop}" readonly>
      </td>`;

      for (let j = 0; j < cols; j++) {
        tr.innerHTML += `
        <td><br>
          <label class="switch">
            <input class="availPeriod" type="checkbox">
            <span class="slider round"></span>
          </label>
          <output type="text" style="display:none;">${periodIndex}</output>
        </td>`;
        periodIndex++;
      }

      tbody.appendChild(tr);

      // Addition of pauses won't work if system pauses added by admin aren't added at their indices
      if (this.sysDefaults.pauses[i]) {
        let pause = this.sysDefaults.pauses[i];
        tbody.innerHTML += `<tr><td colspan='${cols + 1}'>${pause.name}</td></tr>`;
      }
      timer += 1;
    }

    // appending table to container div
    table.appendChild(tbody);
    container.appendChild(table);

    let navSection = document.createElement("div");

    navSection.setAttribute("class", "w3-center w3-bar");
    navSection.setAttribute("id", this.nav_id);

    navSection.innerHTML = `<input type="button" id="resetAvailTT" value="RESET A TT" class="button"> | <input type="button" id="saveAvailOnScreen" value="Save" class="button">`;

    container.parentNode.appendChild(navSection);
    this.main();
  };

  reset = () => {
    // mehtod to uncheck all avail periods

    let result = [];
    this.periods.forEach((period) => {
      period.checked = false;
      result.push(new Avail("N\\A"));
    });
    console.log("AvailTT reset with success:", result);
  };

  compile = () => {
    // method to distinguish between checked and unchecked avail periods

    let result = [];

    this.periods.forEach((period) =>
      result.push(period.checked ? new Avail("A") : new Avail("N\\A"))
    );
    return result;
  };
}

// UI additionals
export class DisplayModal {
  constructor() {
    this._id = "myModal";
    this.header = document.querySelector("#modalHeader");
    this.body = document.querySelector("#modalBody");
    this.footer = document.querySelector("#modalFooter");
  }

  show = () => {
    // mehtod to make modal visible on screen

    let thisModal = document.querySelector(`#${this._id}`);
    thisModal.style.display = "block";

    document.querySelector("#modalClose").addEventListener("click", this.close);
  };

  close = () => {
    // method to close modal

    document.querySelector(`#${this._id}`).style.display = "none";
  };
}

// Not yet used
export class chat {}

export class chatMessage {}

export class TTdraft {
  constructor(group_id, periods = []) {
    this.group_id = group_id; // id of group
    this.periods = periods; // periods of group
  }
}

export { fx };
