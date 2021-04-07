import * as fx from "./fx.js";

// Color object for entire sys
export const color = {
  Ok: "gray",
  SuccessGreen: "#4CAF50", // green
  SuccessBlue: "#2196F3", // dodgerblue --> color of this day
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
    this.canTakeAtt = true;

    this.AttFrom = new AttForm();
    this.DataForm = new DataForm();

    this.Att = {
      currentGroup: {},
      groups: [],
      currentList: [],
      result: [],
      history: { perso: [], group: [] },
    };

    this.AttgroupSelect = document.querySelector("#Att-groupSelect");

    this.socket;
    this.contacts = [];
    this.chats = [];
    this.chatGroups = [];
  }

  userInit = async () => {
    this.sysDefaults = await this.getSysDefaults();

    this.ownTT = new DisplayTT(
      "myTT",
      "displayTTContainer",
      this.accountType,
      "",
      this.sysDefaults
    );

    this.ownTT.show();

    await this.getTT();
  };

  /**
   * method to let a user communicate via sockect.io
   * @param {String} hostLink link of server to use for sockect connection
   */
  connectToSocket = async (hostLink = `http://${"localhost"}:${45000}`) => {
    this.socket = io.connect(hostLink);

    this.socket.on("connect", async () => {
      this.socket.emit("/book-me", {
        _id: this._id,
        name: this.name,
        group_id: this.group,
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
      await this.getDbData(this.groupToUpdate);

      let weekToProgram = new Week(new Date(this.program_TT.weekStart.value));

      let group = fx.findElement("_id", this.groupToUpdate, this.groupDb).element;
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

  /**
   * method to get system default configs
   */
  getSysDefaults = async () => {
    // ******** this would be a post request so that each user can get only data available for his accountType
    return await (await fetch("/user/getSysDefaults")).json();
  };

  getMyInfo = async () => {
    let myData = await fx.postFetch("/user/getMyInfo", { _id: this._id, platform: this.platform });
    let message;

    if (myData) {
      Object.keys(myData).forEach((key) => {
        if (
          key == "student_Ref" ||
          key == "lecturer_Ref" ||
          key == "coordinator_Ref" ||
          key == "admin_Ref"
        ) {
          Object.keys(myData[key]).forEach((subKey) => {
            if (subKey == "_id") {
              this[key] = myData[key][subKey];
            } else {
              if (subKey == "TT") {
                this.ownTT.TT = myData[key][subKey];
                this.selectTT();
                this.ownTT.display(this.ownTT.ttOnScreen, this.accountType);
              } else {
                this[subKey] = myData[key][subKey];
                if (subKey == "avail") {
                  this.loadAvail(this.avail.defaultAvail);
                }
              }
            }
          });
        } else {
          this[key] = myData[key];
        }
      });

      message = "Data fetched successfully";
    } else {
      message = `Could not fetch ${this._id}'s data.`;
    }

    this.showSnackBar(message);
    // console.log(this);
  };

  getAccType = async (_id) => await fx.postFetch("/user/getAccType", { _id });

  // Att methods //

  /**
   * Method to get or reload Att data
   * @param {Boolean} reload value to reload user data or not
   */
  getAttData = async (reload = false) => {
    this.Att.groups = await fx.postFetch("/Att/getGroupDetails", {
      _id: this._id,
      group_id: this.accountType == "Student" ? this.group : null,
      accountType: this.accountType,
    });

    if (this.Att.groups.length > 0) {
      this.Att.groups = this.Att.groups.sort((a, b) => (a._id > b._id ? 1 : -1));

      if (reload) {
        this.use_Att({ target: { value: this.Att.currentGroup._id } });
      } else {
        this.use_Att({ target: { value: this.Att.groups[0]._id } });
        this.AttgroupSelect.innerHTML = "";

        this.Att.groups.forEach((group, index) => {
          this.AttgroupSelect.innerHTML +=
            index == 0
              ? `<option value="${group._id}" selected>${group._id}</option>`
              : `<option value="${group._id}">${group._id}</option>`;
        });
      }
    }
  };

  /**
   * Method to enable user to use Att of group in group select menu
   * @param {*} e
   */
  use_Att = (e) => {
    let group_id = e.target.value;

    // Arranging Att form data
    this.Att.currentGroup = fx.findElement("_id", group_id, this.Att.groups).element;

    // sort student names
    this.Att.currentList = this.Att.currentGroup.students.sort((a, b) =>
      a.name > b.name ? 1 : -1
    );

    this.AttFrom.show("Att-container", this.Att.currentList);
    this.AttFrom.searchBar.value = "";

    // Arranging Att Data form data
    let Att_hist_panel = document.querySelector("#Att-hist-panel");
    Att_hist_panel.innerHTML = "";
    Att_hist_panel.parentNode.querySelector("#Att-hist-details").innerHTML = "";

    let groupAtt = this.Att.currentGroup.Att.sort((a, b) =>
      new Date(a.date).getTime() > new Date(b.date).getTime() ? 1 : -1
    );

    this.Att.history.group = groupAtt.filter((Att) => Att.owner_id == group_id);
    this.Att.history.perso = groupAtt.filter((Att) => Att.owner_id == this._id);

    if (this.Att.history.group.length > 0) {
      let groupDataForm = new DataForm();

      groupDataForm.show(Att_hist_panel.id, {
        ths: ["date", "time", "description"],
        data: this.Att.history.group,
        tr_id: "_id",
      });

      groupDataForm.addEvent("trs", "click", (e) => {
        let target_id = e.target.tagName == "TR" ? e.target.id : e.target.parentNode.id;
        let Att = fx.findElement("_id", target_id, this.Att.currentGroup.Att).element;
        this.DataForm.show("Att-hist-details", { ...Att });
      });
    }

    if (this.Att.history.perso.length > 0) {
      let persoDataFrom = new DataForm();

      persoDataFrom.show(Att_hist_panel.id, {
        ths: ["date", "time", "note"],
        data: this.Att.history.perso,
        tr_id: "_id",
      });

      persoDataFrom.addEvent("trs", "click", (e) => {
        let target_id = e.target.tagName == "TR" ? e.target.id : e.target.parentNode.id;
        let Att = fx.findElement("_id", target_id, this.Att.currentGroup.Att).element;
        this.DataForm.show("Att-hist-details", { ...Att });
      });
    }

    // Arranging Custom Class Lists' data
  };

  /**
   * Method to save Att in Att form
   */
  save_Att = async () => {
    this.Att.result = [];

    this.AttFrom.li_items.forEach((li) => {
      this.Att.result.push({
        name: li.querySelector("div").innerText,
        presence: li.querySelector("input[type='checkbox']").checked,
        remark: li.querySelector("input[type='text']").value,
      });
    });

    let newAtt = {
      data: this.Att.result, // {name, presence, remark}

      description: this.AttFrom.description.value.trim(),

      type: "Att",

      group_id: this.Att.currentGroup._id,

      date: moment()._d.toDateString(),

      time: moment().format("h:mm:ss a"),

      takenBy: this._id,

      owner_id: this.Att.currentGroup._id,
    };

    let Att_res = await fx.postFetch("/Att/save", newAtt);
    await this.getAttData(true);

    this.AttFrom.unCheckAll();

    this.use_Att({ target: { value: this.Att.currentGroup._id } });
    this.DataForm.show("Att-hist-details", { ...Att_res });

    let dataFormContainer = document.querySelector("#Att-hist-details");
    document.querySelector(`a[data-ref=${dataFormContainer.parentNode.id}]`).click();
  };

  /**
   * Method to enable / disable Student canTakeAtt attribute
   */
  enable_Att = () => {
    if (this.canTakeAtt) {
      document.querySelector("#Att").innerHTML = `
      <div class="container" id="Att-main">
          <div class="ownNav" id="Att-nav" style="background-color: #0a4c9b">
            <a class="navLink active" id="take_Att-link" data-navset="Att-nav" data-ref="take_Att">New</a>

            <a class="navLink" id="Att_history-link" data-navset="Att-nav" data-ref="Att_history"
              >History</a
            >
          </div>

        <hr />

        <div class="" id="header">
          <div id="Att-coreOptions" class="toCenter">
            <select id="Att-groupSelect"></select>
          </div>
        </div>

        <div class="nav-item" style="display: block" data-navset="Att-nav" id="take_Att">
          <h1>Take New Attendance</h1>
          <div class="" id="Att-container"></div>
        </div>
        <div class="nav-item" data-navset="Att-nav" id="Att_history">
          <hr />
          <button class="myAccordion">Attendance History</button>
          <div class="AccPanel" id="Att-hist-panel"></div>
          <hr />

          <div class="" id="Att-hist-details"></div>
        </div>
      </div>
      `;
    } else {
      document.querySelector("#Att").innerHTML = `
      <div class="container" id="Att-main">
          <div class="ownNav" id="Att-nav" style="background-color: #0a4c9b">
            <a class="navLink active" id="Att_history-link" data-navset="Att-nav" data-ref="Att_history"
              >History</a
            >
          </div>

        <hr />

        <div class="" id="header">
          <div id="Att-coreOptions" class="toCenter">
            <select id="Att-groupSelect"></select>
          </div>
        </div>

        <div class="nav-item" style="display: block" data-navset="Att-nav" id="Att_history">
          <hr />
          <button class="myAccordion">Attendance History</button>
          <div class="AccPanel" id="Att-hist-panel"></div>
          <hr />

          <div class="" id="Att-hist-details"></div>
        </div>
      </div>`;
    }
  };

  /**
   * method to add a new contact to user contact list
   * @param {String} _id _id of person user you want to save contact
   * @param {String} name name of person user you want to save contact
   * @param {String} email email of person user you want to save contact
   */
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

  /**
   * method for adding event listeners to elements prior to user class and children class if called
   */
  setUserEventListener = async () => {
    // adding event listeners to TT elements
    document.querySelector("#getTT").addEventListener("click", this.getTT);
    this.AttgroupSelect.addEventListener("change", this.use_Att);
    await this.getAttData();

    if (this.accountType != "Student") {
      this.AttFrom.checkAllBtn.addEventListener("click", () => {
        this.AttFrom.checkAll();
      });

      this.AttFrom.uncheckAllBtn.addEventListener("click", () => {
        this.AttFrom.unCheckAll();
      });

      this.AttFrom.saveBtn.addEventListener("click", () => {
        this.save_Att();
      });
    }
  };

  /**
   * method for fetching user personal TT
   */
  getTT = async () => {
    this.ownTT.TT = await fx.postFetch("/user/getTT", {
      _id: this._id,
      accountType: this.accountType,
      group_id: this.group,
      platform: this.platform,
      stud_ref: this.student_Ref,
    });
    // console.log(this.ownTT.TT);

    this.selectTT();
    this.ownTT.display(this.ownTT.ttOnScreen, this.accountType);
    this.showSnackBar("TTs fetched with success");
  };

  /**
   * method to get the TT of a specific week in order to display it
   * @param {{}} week
   */
  selectTT = (week = new Week()) => {
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

  /**
   * Method to display a given message in snack bar
   * @param {String} message text message to be displayed in snack bar
   */
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
   * @param {String} _id _id of person
   * @param {Number} seats number of seats the person has for the event
   */
  constructor(_id, seats = 1) {
    this._id = _id; // person id
    this.seats = seats; // number of seats a person has during an event
  }
}

export class Contact {
  /**
   * this class is to store up a user's contacts for chat messaging
   * @param {String} _id contact _id
   * @param {String} name contact name
   * @param {{email:String,accountType:String}} param2 contact email and accounttype
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
  /**
   * class to model a week in date time
   * As of now it's composed of:
   * - firstDay and
   * - lastDay
   * @param {Date} day date of day of year you wish to get week it belongs to
   */
  constructor(day) {
    let firstDay;
    let lastDay;

    if (
      day instanceof Date ||
      (day instanceof String && Date.parse(day)) ||
      (day && day.toString().length >= 13 && day > 0)
    ) {
      day = new Date(day);
    } else {
      day = new Date();
    }

    if (day.getDay() == 0) {
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

  /**
   * method to have an object with first and lastdays of week in dateString
   */
  toDateString = () => {
    return {
      firstDay: new Date(this.firstDay).toDateString(),
      lastDay: new Date(this.lastDay).toDateString(),
    };
  };

  toFullDateString = () =>
    `Week of ${new Date(this.firstDay).toDateString()} to ${new Date(this.lastDay).toDateString()}`;

  /**
   * - method to have an object with first and last days in substrings
   * - useful in filling HTML date input fields
   */
  toSubString = () => {
    return {
      firstDay: new Date(this.firstDay).toISOString().substring(0, 10),
      lastDay: new Date(this.lastDay).toISOString().substring(0, 10),
    };
  };

  /**
   * method to determine if a day belongs to the instanciated week
   * @param {Number} day date of day to check in milliseconds
   */
  has = (day) => {
    if (this.firstDay <= day && day <= this.lastDay) {
      return true;
    }
    return false;
  };

  add = (num = 0) => {
    return new Week(new Date(this.firstDay).setDate(new Date(this.firstDay).getDate() + 7 * num));
  };

  /**
   * method to get time difference between instanciated week and week to compare
   * @param {{}} week week to compare
   */
  getDifference = (week) => {};

  /**
   * method to get week following date passed in
   * @param {Date} day
   */
  getNextWeek = (day) => {
    if (!day) {
      day = new Week().firstDay;
    }
    return new Week(new Date(day).setDate(new Date(day).getDate() + 7));
  };
}

export class Period {
  // The period object constructor

  /**
   * class to model a timetable period
   * @param {String} courseName
   * @param {String} courseInfo
   * @param {String} lecturerName
   * @param {String} group_id
   * @param {String} venue_id
   * @param {String} state
   * @param {String} lecturer_id
   * @param {Number} start
   * @param {Number} stop
   */
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

  /**
   * method to get a free period
   */
  empty = () => {
    return new Period("", "", "", "", "", "A", "", this.start, this.stop);
  };
}

export class Event {
  /**
   * class to model school event
   * @param {String} name event name
   * @param {Number} start event start date in milliseconds
   * @param {Number} stop event stop date in milliseconds
   * @param {[]} personsInCharge array of persons in charge of the event (ushers)
   * @param {[]} participants array of persons partaking in event
   * @param {String} venue_id _id of venue concerned
   * @param {String} venueState state of venue concerned
   * @param {{ _id: String, name: String }} programmedBy _id and name of person programming the evnet
   * @param {Number} programmedOn date event was programmed in milliseconds
   */
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

  /**
   * method to get a free event
   */
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
  /**
   * class to model a lecturer's availability
   * @param {String} state state of availability
   * @param {*} param1
   */
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

export class UserForms {
  constructor() {}

  addEvent(target = "trs", action = "click", callBack) {
    this[target].forEach((tr) => {
      tr.addEventListener(action, callBack);
    });
  }
}

export class AttForm extends UserForms {
  /**
   * @param {String} label AttForm label
   * @param {String} data AttForm data to manipulate
   */
  constructor() {
    super();
    this.loaded = false;
  }

  init = () => {
    this.saveBtn = this.container.querySelector("#saveAtt");
    this.checkAllBtn = this.container.querySelector("#checkAll_Att");
    this.uncheckAllBtn = this.container.querySelector("#uncheckAll_Att");
    this.classList = this.container.querySelector("#AttForm-list");

    this.li_items = this.container.querySelectorAll("li");

    this.description = this.container.querySelector("#Att-description");
    this.searchBar = this.container.querySelector("#AttForm-search");

    this.searchBar.addEventListener("keyup", () => {
      // try wrapping the search function into one good piece

      let searchItems = this.container.querySelectorAll(`div[data-search="${this.searchBar.id}"]`);

      let filter = this.searchBar.value.trim();
      if (filter) {
        searchItems.forEach((item) => {
          let originalValue = item.parentNode.querySelector("input.originalValue").value;

          if (originalValue.toLowerCase().indexOf(filter.toLowerCase()) != -1) {
            item.innerHTML = fx.colorMatches(filter, originalValue, "#2196f3");
            item.parentNode.style.display = "";
          } else {
            item.innerHTML = originalValue;
            item.parentNode.style.display = "none";
          }
        });
      } else {
        searchItems.forEach((item) => {
          item.innerHTML = item.parentNode.querySelector("input.originalValue").value;
          item.parentNode.style.display = "";
        });
      }
    });
  };

  /**
   * @param {String} container_id container div to append AttForm in
   */
  show = (container_id, data = []) => {
    this.data = data;

    this.container = document.querySelector(`#${container_id}`);

    if (this.loaded) {
      this.classList.innerHTML = this.searchBar.innerHTML = this.description.value = "";

      this.data.forEach((elt) => {
        this.classList.innerHTML += `
            <li class="list-group-item studentSearch AttBlock">
              <input type="checkbox" class="form-check-input"/>
              <input
                type="text"
                class="form-control Att-remark"
                autocomplete="off"
                placeholder="Remark..."
              />
              <div class="" data-search="AttForm-search">${elt.name}</div>
              <input class="originalValue" type="text" value="${elt.name}" style="display:none;"/>`;
      });
    } else {
      this.container.innerHTML = "";
      let AttForm = document.createElement("form");
      AttForm.setAttribute("id", "AttForm");

      this.body = document.createElement("div");
      let mainDiv = document.createElement("div");

      let searchBar = document.createElement("input");
      searchBar.setAttribute("class", "form-control search");
      searchBar.setAttribute("type", "search");
      searchBar.setAttribute("placeholder", "Search");
      searchBar.setAttribute("aria-label", "Search");
      searchBar.setAttribute("id", "AttForm-search");

      mainDiv.appendChild(searchBar);
      mainDiv.innerHTML += "<hr>";
      this.body.appendChild(mainDiv);

      let classListContainer = document.createElement("div");

      classListContainer.setAttribute("class", "card-body");
      classListContainer.setAttribute("style", "max-height: 550px; overflow: auto");

      this.classList = document.createElement("ul");
      this.classList.setAttribute("class", "list-group list-group-flush");
      this.classList.setAttribute("id", "AttForm-list");

      this.data.forEach((elt) => {
        this.classList.innerHTML += `
            <li class="list-group-item studentSearch AttBlock">
              <input type="checkbox" class="form-check-input"/>
              <input
                type="text"
                class="form-control Att-remark"
                autocomplete="off"
                placeholder="Remark..."
              />
              <div class="" data-search="AttForm-search">${elt.name}</div>
              <input class="originalValue" type="text" value="${elt.name}" style="display:none;"/>`;
      });

      classListContainer.appendChild(this.classList);
      this.body.appendChild(classListContainer);

      AttForm.appendChild(this.body);

      AttForm.innerHTML += `<br>
        <div class="card-footer w3-center w3-bar">
          <input placeholder="Add a description..." type="text" maxlength=150 id="Att-description" class="Att-description">
          <br>
          <div>
            <input type="button" class="button" id="checkAll_Att" value="CHECK ALL"> | 
            <input type="button" class="button" id="uncheckAll_Att" value="UNCHECK ALL"> | 
            <input type="button" class="button" id="saveAtt" value="SAVE">
          </div>
        </div>`;

      this.container.appendChild(AttForm);
      this.container.style.display = "block";
      this.loaded = true;
    }

    this.init();
  };

  checkAll = () => {
    this.li_items.forEach((li) => {
      li.querySelector("input[type='checkbox']").checked = true;
    });
  };

  unCheckAll = () => {
    this.li_items.forEach((li) => {
      li.querySelector("input[type='checkbox']").checked = false;
    });
  };
}

export class DataForm extends UserForms {
  constructor() {
    super();
  }

  /**
   * @param {String} container_id container div to append AttForm in
   */
  show(
    container_id,
    {
      type = "",
      ths = ["name", "presence", "remark"],
      data = [],
      description = "",
      tr_id = "",
      date = "",
      time = "",
    }
  ) {
    this.type = type;
    this.ths = ths;
    this.data = data;
    this.description = description;
    this.tr_id = tr_id;
    this.date = date;
    this.time = time;

    this.container = document.querySelector(`#${container_id}`);
    // this.container.classList.add("table-scroll");
    this.container.innerHTML = "";

    let dataForm = document.createElement("form");

    if (this.type == "Att") {
      dataForm.innerHTML = `
    <div class="card-header" style="text-align:center;">
      <div class="card-title">
        <span>${this.date}</span>
        <br>
        <span>${this.time}</span>
        <br>
        <span>${this.description}</span>
      </div>
    </div>`;
    }

    let table = document.createElement("table");
    table.setAttribute("id", "viewStatTable");
    table.setAttribute("class", "table table-bordered w3-centered");

    let thead = document.createElement("thead");
    let thead_tr = document.createElement("tr");
    // thead_tr.setAttribute("colspan", this.sysDefaults.weekDays.length + 1);

    thead_tr.innerHTML += `<th scope="col">#</th>`; // serial number header

    this.ths.forEach((th) => {
      thead_tr.innerHTML += `<th scope="col">${th.toUpperCase()}</th>`;
    });

    thead.appendChild(thead_tr);

    table.appendChild(thead);

    let tbody = document.createElement("tbody");

    this.data.forEach((elt, index) => {
      let tr = document.createElement("tr");
      tr.setAttribute("class", "tableRow");
      tr.setAttribute("id", data[index][tr_id]);

      tr.innerHTML += `<td>${index + 1}</td>`; // serial number

      this.ths.forEach((th, index) => {
        tr.innerHTML +=
          this.type == "Att"
            ? th == "presence"
              ? elt[th]
                ? `<td><div class="color" id="color2"></div></td>`
                : `<td><div class="color" id="color3"></div></td>`
              : `<td>${elt[th]}</td>`
            : `<td>${elt[th]}</td>`;
      });

      tbody.appendChild(tr);
    });

    // tbody.innerHTML +=
    //   this.type == "Att" && this.description
    //     ? `<div style="text-align:left;"><b>Note: </b><br><p>${this.description}</p><br></div>`
    //     : "";

    table.appendChild(tbody);

    dataForm.appendChild(table);

    this.container.appendChild(dataForm);
    this.container.style.display = "block";

    this.trs = this.container.querySelectorAll("tr.tableRow");
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
   * @param {String} _id unique identifier to be given to this TT
   * @param {String} container_id target div in which this TT will place itself
   * @param {String} userAccountType accountType of user generating this TT
   * @param {String} purpose reason of use of this TT because a coord has more than one of such
   * @param {*} sysDefaults data from db needed to generate this TT
   */
  constructor(
    _id,
    container_id,
    userAccountType = "Student",
    purpose = "userDisplay",
    sysDefaults
  ) {
    super();

    this._id = _id;
    this.container = document.querySelector(`#${container_id}`);
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

  /**
   * - Method to set initialize and to set eventlisteners of instantiated object
   * - Only to be called right at the bottom of the `show()` method of this class
   */
  init = () => {
    let thisTT = document.querySelector(`#${this._id}`);
    this.weekStart = thisTT.querySelector("#firstD");
    this.weekEnd = thisTT.querySelector("#lastD");
    this.periods = thisTT.querySelectorAll(".period");
    this.periodTime = thisTT.querySelectorAll("input.periodTime");
    this.th_days = thisTT.querySelectorAll(".dayOfWeek");
    this.editButton = document.querySelector("#editPresentTT");

    // adding event listeners to display TT
    this.periods.forEach((period) => {
      period.addEventListener("click", this.showPeriod);
      period
        .querySelectorAll("input.displayPeriod")
        .forEach((displayField) => displayField.addEventListener("click", this.showPeriod));
    });

    setInterval(this.refresh, 1000);
  };

  /**
   * method to make this TT visible on screen
   */
  show = () => {
    // getting div container to place generated TT in
    this.container.innerHTML = "";
    this.container.classList.add("table-scroll");

    // creating table
    let table = document.createElement("table");

    // setting table attributes (like class || id)
    table.setAttribute("class", "timetable");
    table.setAttribute("id", this._id);

    // creating table header with elements constituting table header
    let thead = document.createElement("thead");
    let thead_tr = document.createElement("tr");
    thead_tr.setAttribute("colspan", this.sysDefaults.weekDays.length + 1);
    thead_tr.innerHTML = `<th class="w3-small"> <span id="firstD"></span> <br> <span id="lastD"></span> </th>`;

    this.sysDefaults.weekDays.forEach((day) => {
      thead_tr.innerHTML += `<th class="w3-small dayOfWeek">${day}</th>`;
    });

    thead.appendChild(thead_tr);

    // appending header to table
    table.appendChild(thead);

    let tbody = document.createElement("tbody");

    let timer = 0;
    let periodIndex = 0; // Very uselful to get info about a period

    for (let i = 0; i < this.sysDefaults.periods.length; i++) {
      // creation of remaining table rows with their data by iteration
      let tr = document.createElement("tr");
      tr.innerHTML = `<th class="w3-small sticky timeSection sideFixed"> <br> <input class="periodTime" type="text" value="${this.sysDefaults.periods[timer].start}"readonly> <br><input class="periodTime" type="text" value="${this.sysDefaults.periods[timer].stop}"readonly></th>`;

      for (let j = 0; j < this.sysDefaults.weekDays.length; j++) {
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
        tbody.innerHTML += `<tr><td colspan='${
          this.sysDefaults.weekDays.length + 1
        }' class="break">${pause.name}</td></tr>`;
      }
      timer += 1;
    }

    table.appendChild(tbody);
    // appending table to container div
    this.container.appendChild(table);

    let navSection = document.createElement("div");
    navSection.setAttribute("id", this.nav_id);
    navSection.setAttribute("class", "navSection w3-center");

    let pagination = document.createElement("div");
    pagination.setAttribute("id", this.pagination_id);
    pagination.setAttribute("aria-label", "Page navigation example");

    navSection.appendChild(pagination);

    if (this.userAccountType === "Coordinator" && this.purpose === "coordDisplay") {
      navSection.innerHTML += `<input class="button" id="editPresentTT" type="button" value="EDIT" disabled>`;
    } else {
      navSection.innerHTML += `<input type="button" id="getTT" value="Check TT" class="button">`;
    }

    this.container.parentNode.appendChild(navSection);

    this.init();
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
        let date = this.ttOnScreen.oDate
          ? this.ttOnScreen.oDate
          : this.ttOnScreen.uDate
          ? this.ttOnScreen.uDate
          : "N\\A";

        message.body = `
          Course Info : ${period.courseInfo}<br>
          Lecturer Name : ${period.lecturerName}<br>
          Group : ${period.group_id}<br>
          Venue : ${period.venue_id}<br>
          Programmed on : ${new Date(date).toDateString()} at ${moment(date).format("h:mm:ss a")}`;
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
          } at ${moment(this.ttOnScreen.uDate).format("h:mm:ss a")}

              <br>
              <hr style="color:5px solid gray;">

          <span style="color:red">Old Data</span><br>
          <br>
          Course Info : ${oldPeriod.courseInfo}<br>
          Lecturer Name : ${oldPeriod.lecturerName}<br>
          Group : ${oldPeriod.group_id}<br>
          Venue : ${oldPeriod.venue_id}<br>
          Programmed on : ${
            this.ttOnScreen.oDate ? new Date(this.ttOnScreen.oDate).toDateString() : "N\\A"
          } at ${moment(this.ttOnScreen.oDate).format("h:mm:ss a")}`;
      }
    } else {
      message.body = "No Programmed TT yet.";
    }

    this.displayModal.header.innerHTML = message.header;
    this.displayModal.body.innerHTML = message.body;
    this.displayModal.footer.innerHTML = message.footer;
    this.displayModal.show();
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
   * @param {*} container_id target div in which this TT will place itself
   * @param {*} sysDefaults data from db needed to generate this TT
   */
  constructor(_id, container_id, sysDefaults) {
    super();

    this._id = _id;
    this.container = document.querySelector(`#${container_id}`);

    this.nav_id = `${this._id}-nav`;
    this.sysDefaults = sysDefaults;

    this.TT = [];
    this.ttOnScreen = {};
    this.index;
  }

  /**
   * Only to be called right at the bottom of the this.show() method
   */
  init = () => {
    let thisTT = document.querySelector(`#${this._id}`);

    this.weekStart = thisTT.querySelector("#weekStart");
    this.weekEnd = thisTT.querySelector("#weekEnd");

    this.setWeek();
    this.weekStart.addEventListener("change", () => {
      this.setWeek();
      this.refresh();
    });

    this.periods = thisTT.querySelectorAll(".coordPeriod");

    this.periodTime = thisTT.querySelectorAll("input.periodTime");
    this.th_days = thisTT.querySelectorAll(".dayOfWeek");

    // adding event listeners to TT & items
    this.periods.forEach((period) => {
      period.addEventListener("click", this.togglePopup);
    });

    // adding event listeners to TT nav items
    let thisTT_nav = document.querySelector(`#${this.nav_id}`);

    this.sendBtn = thisTT_nav.querySelector("#sendGroupTT");
    this.clearBtn = thisTT_nav.querySelector("#clearGroupTT");
    this.validateBtn = thisTT_nav.querySelector("#validateGroupTT");
    this.clearBtn.addEventListener("click", this.clear);
  };

  /**
   * method to generate coordinator's TT
   */
  show = () => {
    this.container.innerHTML = "";
    this.container.classList.add("table-scroll");

    let table = document.createElement("table");
    table.setAttribute("id", this._id);
    table.setAttribute("class", "coordTT");

    // creating table header with elements constituting table header
    let thead = document.createElement("thead");
    let thead_tr = document.createElement("tr");
    thead_tr.setAttribute("colspan", this.sysDefaults.weekDays.length + 1);
    thead_tr.innerHTML = `<th class="w3-small"><input type="date" id="weekStart" placeholder="week start"><br><input type="date" id="weekEnd" placeholder="week end" readonly></th>`;

    this.sysDefaults.weekDays.forEach((day) => {
      thead_tr.innerHTML += `<th class="w3-small dayOfWeek">${day}</th>`;
    });

    thead.appendChild(thead_tr);

    table.appendChild(thead);

    let timer = 0;
    for (let i = 0; i < this.sysDefaults.periods.length; i++) {
      let tr = document.createElement("tr");
      tr.innerHTML += `
      <th class="w3-small sticky timeSection sideFixed">
        <br>
        <input class="periodTime" type="time" value="${this.sysDefaults.periods[timer].start}"readonly>
        <br>
        <input class="periodTime" type="time" value="${this.sysDefaults.periods[timer].stop}"readonly>
      </th>`;

      for (let j = 0; j < this.sysDefaults.weekDays.length; j++) {
        tr.innerHTML += `
              <td>
                <div class='coordPeriod'>
                  <br>

                  <div class="programPopup">
                    <input class="programTT_input" list="Courses" type="text" placeholder="Course name">
                    <span class="popuptext"></span>
                  </div>
                  <br>

                  <div class="programPopup">
                    <input class="programTT_input" list="Lecturers" type="text" placeholder="Lecturer">
                    <span class="popuptext"></span>
                  </div>
                  <br>

                  <div class="programPopup">
                    <input class="programTT_input" list="Venues" type="text" placeholder="Venue">
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

    this.container.appendChild(table);

    let navSection = document.createElement("div");

    navSection.setAttribute("class", "w3-center w3-bar");
    navSection.setAttribute("id", `${this.nav_id}`);

    navSection.innerHTML = `
          <input class="button" id="clearGroupTT" type="button" value="CLEAR"> | <input class="button" id="validateGroupTT" type="button" value="VALIDATE"> | <input class="button" id="sendGroupTT" type="button" value="SEND" disabled>`;

    this.container.parentNode.appendChild(navSection);

    this.init();
  };

  /**
   * Method to reset all periods of programTT to empty
   */
  clear = () => {
    this.sendBtn.disabled = true;

    this.periods.forEach((period) => {
      period.querySelectorAll("input").forEach((inputField, index) => {
        if (index == 3) {
          inputField.checked = false;
        } else {
          inputField.value = "";
          inputField.parentNode.querySelector("span.popuptext").classList.remove("show");
          fx.setBorderBColor(inputField, color.Ok);
        }
        inputField.disabled = false;
      });
    });

    // console.log("All periods cleared!");
  };

  setWeek = () => {
    if (Date.parse(this.weekStart.value)) {
      this.weekToProgram = new Week(new Date(this.weekStart.value));
    } else {
      this.weekToProgram = new Week();
    }

    this.weekStart.value = this.weekToProgram.toSubString().firstDay;
    this.weekEnd.value = this.weekToProgram.toSubString().lastDay;
  };

  /**
   * method to set date and time to each period on program TT
   */
  setPeriodDefaults = () => {
    if (this.weekToProgram.toDateString().firstDay != this.weekStart.value) {
      this.weekToProgram = new Week(new Date(this.weekStart.value));
    }

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
          new Date(this.weekToProgram.firstDay).getFullYear(),
          new Date(this.weekToProgram.firstDay).getMonth(),
          new Date(this.weekToProgram.firstDay).getDate() + i,
          Number(startTime.slice(0, 2)),
          Number(startTime.slice(3)),
          0,
          0
        );

        let stop = new Date(
          new Date(this.weekToProgram.firstDay).getFullYear(),
          new Date(this.weekToProgram.firstDay).getMonth(),
          new Date(this.weekToProgram.firstDay).getDate() + i,
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

  refresh = ({ group_id = "", groupDb = [] } = { group_id: "", groupDb: [] }) => {
    // method to match actual date and time with date and time of this TT for accuracy

    this.setPeriodDefaults();

    let today = new Date().getTime();

    this.weekToProgram.has(today) ? this.setHeader(this.weekToProgram) : this.setHeader();

    if (this.weekToProgram.has(today)) {
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
          prevTT = fx.findElement("week", this.weekToProgram, group.TT);
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
    } else if (new Week().getNextWeek().firstDay === this.weekToProgram.firstDay) {
      // console.log("Programming Tt for next week");

      this.periods.forEach((period) => {
        period = period.querySelectorAll("input");

        period[0].disabled = false;
        period[1].disabled = false;
        period[2].disabled = false;
        period[3].disabled = false;
      });
    } else {
      // console.log(
      //   "Either trying to program more than 1 week ahead or trying to program a past week. Not Possible!"
      // );

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
   * @param {*} container_id target div in which this TT will place itself
   * @param {*} sysDefaults data from db needed to generate this TT
   */
  constructor(_id, container_id, sysDefaults) {
    this._id = _id;
    this.container_id = container_id;
    this.nav_id = `${this._id}-nav`;
    this.pagination_id = `${this._id}-page`;
    this.sysDefaults = sysDefaults;

    this.TT = [];
    this.ttOnScreen = {};
    this.index;
  }

  init = () => {
    let thisTT = document.querySelector(`#${this._id}`);
    this.periods = thisTT.querySelectorAll(".availPeriod");

    this.periodTime = thisTT.querySelectorAll("input.periodTime");
    this.th_days = thisTT.querySelectorAll(".dayOfWeek");

    // adding event listeners to TT nav items
    let thisTT_nav = document.querySelector(`#${this.nav_id}`);
    this.resetBtn = thisTT_nav.querySelector("#resetAvailTT");
    this.saveBtn = thisTT_nav.querySelector("#saveAvailOnScreen");
  };

  /**
   * method to make avail TT visible (generate) on screen
   */
  show = () => {
    // getting div container to place generated TT in
    this.container = document.querySelector(this.container_id);
    this.container.classList.add("table-scroll");

    // creating table
    let table = document.createElement("table");

    // setting table attributes (like class || id)
    table.setAttribute("class", "timetable");
    table.setAttribute("id", this._id);

    // creating table header with elements constituting table header
    let thead = document.createElement("thead");
    let thead_tr = document.createElement("tr");
    thead_tr.setAttribute("colspan", this.sysDefaults.weekDays.length + 1);
    thead_tr.innerHTML = `<th class="w3-small"> TIME</th>`;

    this.sysDefaults.weekDays.forEach((day) => {
      thead_tr.innerHTML += `<th class="w3-small dayOfWeek">${day}</th>`;
    });

    thead.appendChild(thead_tr);

    // appending header to table
    table.appendChild(thead);

    let timer = 0;
    let periodIndex = 0; // Very uselful to get info about a period
    let tbody = document.createElement("tbody");

    for (let i = 0; i < this.sysDefaults.periods.length; i++) {
      // creation of remaining table rows with their data by iteration

      let tr = document.createElement("tr");
      tr.innerHTML = `
      <th class="w3-small sticky timeSection sideFixed"><br>
        <input class="periodTime" type="text" value="${this.sysDefaults.periods[timer].start}" readonly><br>
        <input class="periodTime" type="text" value="${this.sysDefaults.periods[timer].stop}" readonly>
      </th>`;

      for (let j = 0; j < this.sysDefaults.weekDays.length; j++) {
        tr.innerHTML += `
        <td><br>
          <label class="switch">
            <input class="availPeriod" type="checkbox">
            <span class="slider round"></span>
          </label>
          <output type="text" style="display:none;">${periodIndex}</output>
          <input class="displayPeriod" type="text" readonly></input>
        </td>`;
        periodIndex++;
      }

      tbody.appendChild(tr);

      // Addition of pauses won't work if system pauses added by admin aren't added at their indices
      if (this.sysDefaults.pauses[i]) {
        let pause = this.sysDefaults.pauses[i];
        tbody.innerHTML += `<tr><td colspan='${this.sysDefaults.weekDays.length + 1}'>${
          pause.name
        }</td></tr>`;
      }
      timer += 1;
    }

    // appending table to container div
    table.appendChild(tbody);
    this.container.appendChild(table);

    let navSection = document.createElement("div");

    navSection.setAttribute("class", "w3-center w3-bar");
    navSection.setAttribute("id", this.nav_id);

    navSection.innerHTML = `<input type="button" id="resetAvailTT" value="RESET" class="button"> | <input type="button" id="saveAvailOnScreen" value="SAVE" class="button">`;

    this.container.parentNode.appendChild(navSection);
    this.init();
  };

  reset = () => {
    this.periods.forEach((period) => {
      period.checked = false;
    });
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
