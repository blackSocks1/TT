//module containing most functions of various interfaces

// this hostLink is the web address for socket connection
export const hostLink = `http://${"localhost"}:${45000}`;

// system classes

export class User {
  // user class from interface management
  constructor(_id, name) {
    this._id = _id;
    this.name = name;
    this.accountType;
    this.platform = "web";
    this.socket;

    this.connectToSocket = (hostLink) => {
      this.socket = io(hostLink);

      this.socket.on("connect", () => {
        console.log(this.socket.id);

        this.socket.emit("book-me", { _id: this._id, name: this.name });
      });
    };

    // nav attributes
    this.TT = [];
    this.ttOnScreen = {};
    this.index;

    // this.getMyInfo = async () => {
    //   if (this.perso) {
    //     let req = await fetch("/getMyInfo", {
    //       method: "POST",
    //       headers: { "Content-Type": "application/json;charset=utf-8" },
    //       body: JSON.stringify({ _id: this._id, platform: this.platform }),
    //     });
    //     let myData = await req.json();

    //     if (myData) {
    //       this.name = myData.name;
    //       if (this.accountType === "student") {
    //         this.level = myData.level;
    //         this.specialty = myData.specialty;
    //       }
    //       this.TT = myData.TT;
    //     }
    //   }
    // };

    // iucTemplate
    this.generateDisplayTT = async (target, purpose = "userDisplay") => {
      // purpose = "userDisplay", "coordDisplay"
      // rows = 6, cols = 7,  , pauses = [0, 1, 2, 3, 4]
      // function to display IUC user TT
      // set rows, columns as first 2 params
      // set the target div to append table after generation
      // user is just for testing on coordinator interface
      // set the indices of where the pauses should be on table in an array as last param

      let pauses = [];
      let sysDefaults = await getSysDefaults();

      sysDefaults.pauses.forEach((pause) => pauses.push(pause.index));

      // converting pauses from array to set to take off duplicates
      pauses = new Set(pauses.sort());
      let rows = sysDefaults.periods.length;
      let cols = sysDefaults.weekDays;

      // getting div container to place generated TT in
      let container = document.querySelector(target);
      container.innerHTML = "";

      // creating table
      let table = document.createElement("table");

      // setting table attributes (like class || id)
      table.setAttribute("class", "table table-bordered");
      table.style.color = "black";
      table.setAttribute("id", "displayTT");

      // creating table header with elements constituting table header
      let thead = document.createElement("tr");
      thead.setAttribute("id", "thead");
      thead.innerHTML = `<th class="w3-small"> <span id="firstD"></span> <br> <span id="lastD"></span></th>`;

      let weekDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

      weekDays.forEach((day, index) => {
        thead.innerHTML += `<th class="w3-small dayOfWeekDisplay">${day}</th>`;
      });

      // appending header to table
      table.appendChild(thead);

      let timer = 0;
      let periodIndex = 0; // Very uselful to get info about a period
      for (let i = 0; i < rows; i++) {
        // creation of remaining table rows with their data by iteration

        let tr = document.createElement("tr");
        tr.innerHTML = `<td class="w3-small sticky timeSection"> <br><br> <span class="time">${sysDefaults.periods[timer].start}</span> - <span class="time">${sysDefaults.periods[timer].stop}</span></td>`;

        // <td class="w3-small cell">WINDOWS SERVER<br style=""><span class="w3-small lect-venue">Mr Njikang Francis<br> Venue: A244<br></span></td>

        for (let j = 0; j < cols; j++) {
          tr.innerHTML += `
          <td class="w3-small period">
          <input class="displayPeriod" type="text" readonly></input>
          <br>
          <input class="displayPeriod" type="text" readonly></input>
          <br>
          <input class="displayPeriod" type="text" readonly></input>
          <output type="text" style="display:none;">${periodIndex}</output>
          </td>`;

          {
            /* tr.innerHTML += `<td class="w3-small period">
                    <a></a>
                    <output type="text" style="display:none;">${periodIndex}</output>
                </td>`; */
          }
          periodIndex++;
        }
        table.appendChild(tr);

        // Addition of pauses won't work if system pauses added by admin aren't added at their indices
        if (sysDefaults.pauses[i]) {
          let pause = sysDefaults.pauses[i];
          table.innerHTML += `<tr ><td colspan='${cols + 1}'>${pause.name}</td></tr>`;
        }
        timer += 1;
      }

      // appending table to container div
      container.appendChild(table);

      let navSection = document.createElement("div");
      navSection.setAttribute("class", "navSection w3-center");

      let pagination = document.createElement("div");
      pagination.setAttribute("id", "pagination");
      // pagination.setAttribute("class", " w3-bar");
      pagination.setAttribute("aria-label", "Page navigation example");

      navSection.appendChild(pagination);

      if (this.accountType === "lecturer" || this.accountType === "student") {
        navSection.innerHTML += `<input type="button" id="getTT" value="Check TT" class="button">`;
      } else if (this.accountType === "coordinator" && purpose === "coordDisplay") {
        navSection.innerHTML += `<input class="button" id="editPresentTT" type="button" value="Edit" disabled>`;
      }

      // <nav id="pagination" aria-label="Page navigation example">
      //       <ul class="pagination justify-content-center mt-2">
      //         <li class="page-item">
      //           <a class="page-link" href="#" aria-label="Previous">
      //             <span aria-hidden="true">&laquo;</span>
      //           </a>
      //         </li>
      //         <li class="page-item"><a class="page-link" href="#">1</a></li>
      //         <li class="page-item"><a class="page-link" href="#">2</a></li>
      //         <li class="page-item"><a class="page-link" href="#">3</a></li>
      //         <li class="page-item">
      //           <a class="page-link" href="#" aria-label="Next">
      //             <span aria-hidden="true">&raquo;</span>
      //           </a>
      //         </li>
      //       </ul>
      //     </nav>

      container.appendChild(navSection);

      return table;
    };

    this.resetTT = () => {
      this.TT = [];
      this.ttOnScreen = undefined;
    };

    this.goToRef = (e) => {
      this.index = new Number(e.target.innerHTML) - 1;
      this.ttOnScreen = this.TT[this.index];
      this.displayTT(this.ttOnScreen);
    };

    this.ttDirection = () => {
      // function to enable left and right navs buttons when needed
      let pagination = document.querySelector("#pagination");
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

      // // if the index of TT on screen is 0 (minimum index) or the next TT on the left of the TT on screen is undefined, block the left nav else unlock
      // if (this.index === 0 || this.TT[this.index - 1] === undefined) {
      //   elementDisabled(this.leftTT, true);
      // } else {
      //   elementDisabled(this.leftTT, false);
      // }

      // // if the index of TT on screen is 4 (maximum index) or the next TT on the right of the TT on screen is undefined, block the right nav else unlock
      // if (this.index === 4 || this.TT[this.index + 1] === undefined) {
      //   elementDisabled(this.rightTT, true);
      // } else {
      //   elementDisabled(this.rightTT, false);
      // }

      paginationButtons = document.querySelectorAll("a.paginationButton");
      paginationButtons.forEach((button) => {
        button.addEventListener("click", this.goToRef);
      });
    };

    // user fetching and displaying personal TT
    this.getTT = async () => {
      let data = await fetch("/getTT", {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
          _id: this._id,
          accountType: this.accountType,
          level: this.level,
          platform: this.platform,
        }),
      });
      this.TT = await data.json();
      console.log(this.TT);

      if (this.TT.length > 0) {
        // display and point to latest TT
        let ttOfThisWeek = findElement("week", new Week(), this.TT);

        if (ttOfThisWeek) {
          this.ttOnScreen = ttOfThisWeek.element;
          this.index = ttOfThisWeek.index;
        } else {
          this.ttOnScreen = this.TT[this.TT.length - 1];
          this.index = this.TT.length - 1;
        }

        this.displayTT(this.ttOnScreen);
      } else {
        this.ttOnScreen = undefined;
        this.displayTT(this.ttOnScreen);
      }
    };

    // method to navigate TTs
    // this.nextTT = (e) => {
    //   console.log(e.target);
    //   if (e.target.id === "left") {
    //     this.ttOnScreen = this.TT[this.index - 1];
    //     this.index -= 1;
    //   } else {
    //     this.ttOnScreen = this.TT[this.index + 1];
    //     this.index += 1;
    //   }

    //   this.displayTT(this.ttOnScreen);
    // };

    this.displayTT = (TT) => {
      // function to display a TT on screen at a time
      let displayTT = document.querySelector("#displayTT");

      // getting all period output fields in table to display period content
      let output = displayTT.querySelectorAll(".period");
      let weekStart = displayTT.querySelector("#firstD");
      let weekEnd = displayTT.querySelector("#lastD");

      if (TT) {
        let periods = TT.periods; // getting period info
        let week = TT.week; // getting week info
        // let thead = displayTT.querySelector("#thead");
        // thead.innerHTML = `<th class="w3-small"> <span id="firstD"></span> <br> <span id="lastD"></span></th>`;

        let ths = document.querySelectorAll(".dayOfWeekDisplay");
        // console.log(weekToProgram.toDateString());

        let today = new Date();

        if (new Week(week.firstDay).has(today)) {
          today = today.getDay();

          if (today === 0) {
            today = ths.length;
          }

          ths.forEach((th, index) => {
            index + 1 === today
              ? th.setAttribute("class", "w3-small dayOfWeekDisplay today")
              : th.setAttribute("class", "w3-small dayOfWeekDisplay");
          });
        } else {
          ths.forEach((th) => th.setAttribute("class", "w3-small dayOfWeekDisplay"));
        }

        // displaying first and last dates of week
        weekStart.innerHTML = new Date(week.firstDay).toDateString();
        weekEnd.innerHTML = new Date(week.lastDay).toDateString();

        // displaying period info
        periods.forEach((period, index) => {
          let out = output[index].querySelectorAll("input");

          out[0].value = period.courseInfo;
          out[1].value = `${this.accountType === "lecturer" ? period.level : period.lecturerName}`;
          out[2].value = period.venue;
        });
      } else {
        weekStart.innerHTML = "";
        weekEnd.innerHTML = "";
        output.forEach((period, index) => {
          let out = output[index].querySelectorAll("input");

          out[0].value = "";
          out[1].value = "";
          out[2].value = "";
        });
      }
      this.ttDirection();
    };

    this.showPeriod = (e) => {
      let period;
      let periodInfo = document.querySelector("#periodInfo");
      if (e.target.tagName !== "TD") {
        period = e.target.parentNode.querySelectorAll("output");
      } else {
        period = e.target.querySelectorAll("output");
      }

      // getting value of last output field in clicked period
      let periodIndex = period[period.length - 1].value;

      if (this.ttOnScreen) {
        period = this.ttOnScreen.periods[periodIndex];
        let oldPeriod = this.ttOnScreen.oldPeriods[periodIndex];

        if (!oldPeriod || equalPeriods(period, oldPeriod)) {
          periodInfo.innerHTML = `
${new Date(period.start).toDateString()}<br>
${new Date(period.start).getHours() === 0 ? "00" : new Date(period.start).getHours()}:${
            new Date(period.start).getMinutes() === 0 ? "00" : new Date(period.start).getMinutes()
          } - ${new Date(period.stop).getHours() === 0 ? "00" : new Date(period.stop).getHours()}:${
            new Date(period.stop).getMinutes() === 0 ? "00" : new Date(period.stop).getMinutes()
          }<br>
-------------------------- <br>
<ul>
<li>Course Info : ${period.courseInfo}</li>
<li>Lecturer Name : ${this.accountType === "lecturer" ? this.name : period.lecturerName}</li>
<li>Level : ${this.accountType === "student" ? this.level : period.level}</li>
<li>Venue : ${period.venue}</li>
<li>Programmed on : ${
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
          }</li>
</ul> `;
        } else {
          // logging updated data first
          periodInfo.innerHTML = `
${new Date(period.start).toDateString()}<br>
${new Date(period.start).getHours() === 0 ? "00" : new Date(period.start).getHours()}:${
            new Date(period.start).getMinutes() === 0 ? "00" : new Date(period.start).getMinutes()
          } - ${new Date(period.stop).getHours() === 0 ? "00" : new Date(period.stop).getHours()}:${
            new Date(period.stop).getMinutes() === 0 ? "00" : new Date(period.stop).getMinutes()
          } <br>
Updated Data <br>
-------------------------- <br>
<ul>
<li>Course Info : ${period.courseInfo}</li>
<li>Lecturer Name : ${this.accountType === "lecturer" ? this.name : period.lecturerName}</li>
<li>Level : ${this.accountType === "student" ? this.level : period.level}</li>
<li>Venue : ${period.venue}</li>
<li>Updated on : ${
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
          }</li>
</ul>
          
          <hr>
          
Old data <br>
-------------------------- <br>
<ul>
<li>Course Info : ${oldPeriod.courseInfo}</li>
<li>Lecturer Name : ${this.accountType === "lecturer" ? this.name : oldPeriod.lecturerName}</li>
<li>Level : ${this.accountType === "student" ? this.level : oldPeriod.level}</li>
<li>Venue : ${oldPeriod.venue}</li>
<li>Programmed on : ${
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
          }</li>
</ul>`;
        }
      } else {
        periodInfo.innerHTML = "No Programmed TT yet.";
      }
      // setTimeout(() => document.querySelector("#periodInfo").innerHTML = "", 5*60000);
    };
  }
}

export class Student extends User {
  // user class from interface management
  constructor(_id, level) {
    super(_id, name);
    this.level = level;
    this.accountType = "student";

    // this.getMyInfo = async () => {
    //   if (this.perso) {
    //     let req = await fetch("/getMyInfo", {
    //       method: "POST",
    //       headers: { "Content-Type": "application/json;charset=utf-8" },
    //       body: JSON.stringify({ _id: this._id, platform: this.platform }),
    //     });
    //     let myData = await req.json();

    //     if (myData) {
    //       this.name = myData.name;
    //       this.level = myData.level;
    //       this.specialty = myData.specialty;
    //       this.name = myData.name;
    //       this.name = myData.name;
    //     } else {
    //       console.log(`Could not fetch ${this._id}'s data.`);
    //     }
    //   }
    // };
  }
}

export class Lecturer extends User {
  constructor(_id, name) {
    super(_id, name);
    // this.connected;
    this.avail = {};
    this.tempTT = {};
    this.schedule = [];
    this.accountType = "lecturer";

    // this.getMyInfo = async () => {
    //   if (this.perso) {
    //     let req = await fetch("/getMyInfo", {
    //       method: "POST",
    //       headers: { "Content-Type": "application/json;charset=utf-8" },
    //       body: JSON.stringify({ _id: this._id, platform: this.platform }),
    //     });
    //     let myData = await req.json();

    //     if (myData) {
    //       this.name = myData.name;
    //       this.avail = myData.avail;
    //       this.TT = myData.TT;
    //     } else {
    //       console.log(`Could not fetch ${this._id}'s data.`);
    //     }
    //   }
    // };

    this.generateAvailTT = async (target) => {
      // function to display lecturer avail TT
      // set rows, columns as first 2 params
      // set the target div to append table after generation

      let pauses = [];
      let sysDefaults = await getSysDefaults();

      sysDefaults.pauses.forEach((pause) => pauses.push(pause.index));

      // converting pauses from array to set to take off duplicates
      pauses = new Set(pauses.sort());
      let rows = sysDefaults.periods.length;
      let cols = sysDefaults.weekDays;

      // getting div container to place generated TT in
      let container = document.querySelector(target);
      container.innerHTML = "";

      // creating table
      let table = document.createElement("table");

      // setting table attributes (like class || id)
      table.setAttribute("class", "table table-bordered");
      table.style.color = "black";
      table.setAttribute("id", "AvailTT");

      // creating table header with elements constituting table header
      let thead = document.createElement("tr");
      thead.innerHTML = `<th class="w3-small"> TIME </th> <th class="w3-small">MONDAY</th> <th class="w3-small">TUESDAY</th> <th class="w3-small">WEDNESDAY</th> <th class="w3-small">THURSDAY</th> <th class="w3-small">FRIDAY</th> <th class="w3-small">SATURDAY</th> <th class="w3-small">SUNDAY</th>`;

      // appending header to table
      table.appendChild(thead);

      let timer = 0;
      let periodIndex = 0; // Very uselful to get info about a period
      for (let i = 0; i < rows; i++) {
        // creation of remaining table rows with their data by iteration

        let tr = document.createElement("tr");
        tr.innerHTML = `<td class="w3-small sticky" timeSection"> <br><br> <span class="time">${sysDefaults.periods[timer].start}</span> - <span class="time">${sysDefaults.periods[timer].stop}</span></td>`;

        // <td class="w3-small cell">WINDOWS SERVER<br style=""><span class="w3-small lect-venue">Mr Njikang Francis<br> Venue: A244<br></span></td>

        for (let j = 0; j < cols; j++) {
          // <br>
          //     <output type="text" value="Course name"></output>
          //     <br>
          //     <output type="text" value="Lecturer"></output>
          //     <br>
          //     <output type="text" value="Venue"></output>

          tr.innerHTML += `<td class="availPeriod">
            <label class="radio"><input type="radio" name="avail+${i}+${j}" value="A" checked/> A</label><br>
            <label class="radio"><input type="radio" name="avail+${i}+${j}" value="N\\A" /> N\A</label>
            <output type="text" style="display:none;">${periodIndex}</output>
                </td>`;
          periodIndex++;

          // <select name="" id="">
          //   <option value="A" selected>
          //     A
          //   </option>
          //   <option value="N\\A">N\\A</option>
          // </select>;
        }
        table.appendChild(tr);

        // Addition of pauses won't work if system pauses added by admin aren't added at their indices
        if (sysDefaults.pauses[i]) {
          let pause = sysDefaults.pauses[i];
          table.innerHTML += `<tr ><td colspan='${cols + 1}'>${pause.name}</td></tr>`;
        }
        timer += 1;
      }

      // appending table to container div
      container.appendChild(table);

      let navSection = document.createElement("div");
      navSection.setAttribute("class", "navSection w3-center");

      navSection.innerHTML = `<input type="button" id="reset" value="RESET A TT" class="button">`;
      container.appendChild(navSection);

      return table;
    };

    this.resetLocalDefaults = () => {
      this.schedule = [];
      this.temp_TT = new Timetable();
      this.temp_TT.periods = arrayInit("period");
    };

    this.resetAvailTT = async () => {
      let reset = await fetch("/resetAvail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
          _id: this._id,
        }),
      });
      let result = await reset.json();
      console.log(result, "Done!");
    };
  }
}

export class Coordinator extends Lecturer {
  constructor(_id) {
    super(_id);
    this.TT_Defaults; // = { week: {}, periods: [] }
    this.lastSeen;
    this.TTdrafts = [];
    this.accountType = "coordinator";

    this.getMyInfo = async () => {
      let req = await fetch("/getMyInfo", {
        method: "POST",
        headers: { "Content-Type": "application/json;charset=utf-8" },
        body: JSON.stringify({ _id: this._id, platform: this.platform }),
      });
      let myData = await req.json();

      if (myData) {
        this.name = myData.name;
        this.avail = myData.avail;
        this.TT = myData.TT;
        this.TTdrafts = myData.TTdrafts;
        this.specialties = myData.specialties;
        this.lastSeen = myData.lastSeen;
        console.log("Coord data fetched successfully");
      } else {
        console.log(`Could not fetch ${this._id}'s data.`);
      }
    };

    this.connectToSocket = (hostLink) => {
      this.socket = io(hostLink);

      this.socket.on("connect", async () => {
        console.log(this.socket.id);
        await this.getMyInfo();

        this.socket.emit("book-me", { _id: this._id, name: this.name });
      });
    };

    this.generateCoordinatorTT = async (target) => {
      // function to generate coordinator's TT

      let sysDefaults = await getSysDefaults();
      let rows = sysDefaults.periods.length;
      let cols = sysDefaults.weekDays;

      // container div where TT will be inserted
      let container = document.querySelector(target);

      let table = document.createElement("table");
      table.setAttribute("id", "coordTT");
      table.setAttribute("class", "coordTT w3-table table-bordered w3-bordered w3-centered");

      let thead = document.createElement("tr");
      thead.setAttribute("id", "thead");

      thead.innerHTML = `<th class="w3-small"><input type="date" id="weekStart" placeholder="week start"><br><input type="date" id="weekEnd" placeholder="week end" readonly></th>`;

      let weekDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

      weekDays.forEach((day, index) => {
        thead.innerHTML += `<th class="w3-small dayOfWeek">${day}</th>`;
      });

      table.appendChild(thead);

      let timer = 0;
      for (let i = 0; i < rows; i++) {
        let tr = document.createElement("tr");
        tr.innerHTML += `<td class="timeSection">
                <div>
                Start: <input type="time" class="adTime" value="${sysDefaults.periods[timer].start}" disabled></input>
                <br>
                Stop: <input type="time" class="adTime" value="${sysDefaults.periods[timer].stop}" disabled></input>
                </div>
             </td>`;

        for (let j = 0; j < cols; j++) {
          tr.innerHTML += `
                <td>
                <div class='coordPeriod'>
                    <br>
                    <input list="Courses" type="text" placeholder="Course name">
                    <br>
                    <input list="Lecturers" type="text" placeholder="Lecturer">
                    <br>
                    <input list="Venues" type="text" placeholder="Venue">
                    <br>
                    <input type="checkbox" class="form-check-input"/>Joint Class
                    
                    <input class="start" style="display:none;">
                    </input><input class="stop" style="display:none;"></input>
                </div>
                </td>`;
        }
        table.appendChild(tr);
        timer += 1;
      }
      container.appendChild(table);

      // let navSection = document.createElement("div");
      // navSection.setAttribute("class", "navSection w3-center");

      // let pagination = document.createElement("div");
      // pagination.setAttribute("id", "pagination");
      // pagination.setAttribute("aria-label", "Page navigation example");

      // navSection.appendChild(pagination);

      container.innerHTML += `
            <div class="w3-center w3-bar">
                <input class="button" id="Validate" type="button" value="Validate"> | <input class="button" id="preview" type="button" value="Preview" disabled> | <input class="button"    id="sendButton" type="button" value="Send" disabled>
            </div> `;
      return table;
    };

    this.getMyDefaults = async () => {
      this.TT_Defaults = await fetch("/coord/getMyDefaults", {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
          _id: this._id,
        }),
      });
      this.TT_Defaults = await this.TT_Defaults.json();
      // console.log(this.TT_Defaults)
    };

    this.setMyDefaults = async () => {
      let data = await fetch("/coord/setMyDefaults", {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
          _id: this._id,
          TT_Defaults: {
            week: this.TT_Defaults.week,
            periods: this.TT_Defaults.periods,
          },
        }),
      });
      this.TT_Defaults = await data.json();
    };

    this.getLastSeen = async () => {
      let lastSeen = await fetch("/coord/getLastSeen", {
        method: "post",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
          _id: this._id,
        }),
      });
      this.lastSeen = await lastSeen.json();
      // console.log("Last seen: ", new Date(this.lastSeen));
      return this.lastSeen;
    };

    this.setLastSeen = async () => {
      let lastSeen = await fetch("/coord/setLastSeen", {
        method: "post",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
          _id: this._id,
          lastSeen: new Date().getTime(),
        }),
      });
      this.lastSeen = await lastSeen.json();
      // console.log("Last seen uoDated: ", new Date(this.lastSeen));
    };

    this.getDrafts = async () => {
      let req = await fetch("/coord/getDrafts", {
        method: "post",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
          _id: this._id,
        }),
      });

      this.TTdrafts = await req.json();
    };

    this.saveTTDrafts = async () => {
      let req = await fetch("/coord/saveTTDrafts", {
        method: "post",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
          _id: this._id,
          TTdrafts: this.TTdrafts,
        }),
      });

      this.TTdrafts = await req.json();
    };

    // this.getDrafts();
    this.getLastSeen();
    this.getMyDefaults();
  }
}

export class Admin extends User {
  constructor(_id, name, accountType, platform, connected, TT, sysDefaults) {
    super(_id, name, accountType, platform, connected, TT);
    this.sysDefaults = sysDefaults; // default config of entire institution

    this.setSysDefaults = async () => {
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
}

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

    this.toDateString = () =>
      `Week of ${new Date(this.firstDay).toDateString()} to ${new Date(
        this.lastDay
      ).toDateString()}`;

    // console.log(`Week of ${new Date(this.firstDay)} to ${new Date(this.lastDay)}`);

    this.has = (day) => {
      if (this.firstDay <= day && day <= this.lastDay) {
        return true;
      }
      return false;
    };

    this.isNextWeek = () => {
      let thisWeek = new Week();
      if (new Date(this.firstDay).getDate() - new Date(thisWeek.firstDay).getDate() === 7) {
        return true;
      }
      return false;
    };
  }
}

export class Period {
  // The period object constructor

  constructor(
    courseName = "",
    courseInfo = "",
    lecturerName = "",
    level = "",
    venue = "",
    state = "",
    lecturerId = "",
    start = "",
    stop = ""
  ) {
    this.courseName = courseName; // name of course programmed
    this.courseInfo = courseInfo; // info of course programmed like hours left / total hours set
    this.lecturerName = lecturerName; // name of lecturer programmed
    this.level = level; // level programmed
    this.lecturerId = lecturerId; // id of lecturer programmed
    this.venue = venue; // venue where class will hold
    this.state = state; // A -> available, P -> programmed, J -> Joint
    this.start = start; // period start time
    this.stop = stop; // period stop time

    this.empty = () => {
      return {
        courseName: "",
        courseInfo: "",
        lecturerName: "",
        level: "",
        lecturerId: "",
        venue: "",
        state: "A",
        start: this.start,
        stop: this.stop,
      };
    };

    this.getDuration = () => {
      let startTime = new Date(
        "",
        "",
        "",
        new Date(this.start).getHours(),
        new Date(this.start).getMinutes(),
        0,
        0
      ).getTime();

      let stopTime = new Date(
        "",
        "",
        "",
        new Date(this.stop).getHours(),
        new Date(this.stop).getMinutes(),
        0,
        0
      ).getTime();

      console.log(
        `${new Date(stopTime - startTime).getHours() - 1}:${new Date(
          stopTime - startTime
        ).getMinutes()}`
      );
      return {
        hours: new Date(stopTime - startTime).getHours() - 1,
        minutes: new Date(stopTime - startTime).getMinutes(),
      };
    };
  }
}

export class Pause {
  constructor(name, index) {
    this.name = name;
    this.index = index;
  }
}

export class Timetable {
  constructor(week = new Week(), periods = [], uDate = "", oldPeriods = [], oDate = "") {
    this.week = week;
    this.periods = periods;
    this.uDate = uDate;
    this.oldPeriods = oldPeriods;
    this.oDate = oDate;

    this.defaultTT = () => {
      return new Timetable(
        new Week(),
        arrayInit("period"),
        new Date().getTime(),
        [],
        new Date().getTime()
      );
    };
  }
}

export class Level {
  constructor(_id, TT, students) {
    this._id = _id; // id of level to program
    this.TT = TT; // TTs of level to program
    this.students = students; // number of students in level to program
  }
}

export class Person {
  constructor(_id, seats = 1) {
    this._id = _id; // person id
    this.seats = seats; // number of seats a person has during an event
  }
}

export class Event {
  // the same event can take place at the same time in diff venues
  constructor(
    name,
    start,
    stop,
    personsInCharge = [],
    participants = [],
    venue, // venue _id
    venueState = "A", // maybe not useful again
    programmedBy = {}
  ) {
    this.name = name; // name of event
    this.start = start; // event start time
    this.stop = stop; // event stop time
    this.personsInCharge = personsInCharge; // [Person:{_id, seats}] -> collection of persons to coordinate the event
    this.participants = participants; // [Person:{_id, seats}] -> collection of persons other than coordinators partaking in event
    this.venue = venue; // venues concerned with event
    this.venueState = venueState; // A -> available, P -> programmed, J -> Joint
    this.programmedBy = programmedBy;

    this.empty = () => {
      this.name = "";
      this.personsInCharge = [];
      this.participants = [];
      this.venue = ""; // venue _id
      this.venueState = "A"; // maybe not useful again
      this.programmedBy = {};
    };
  }
}

export class Avail {
  constructor(state = "A", coordinator = { _id: "", name: "" }) {
    this.state = state;
    this.coordinator = coordinator;
  }
}

export class TTdraft {
  constructor(levelId, periods = []) {
    this.levelId = levelId; // id of level
    this.periods = periods; // periods of level
  }
}

export class Program {
  constructor(week, events = []) {
    this.week = week;
    this.events = events;
  }
}
// export class Venue {}

export function equalPeriods(periodA, periodB) {
  // function to check if two periods are the same (NOT IDENTICAL) in terms of courseName, courseInfo, level, lecturerName, lecturerId, venue, state

  if (periodA.courseName !== periodB.courseName) {
    return false;
  }

  if (periodA.courseInfo !== periodB.courseInfo) {
    return false;
  }

  if (periodA.level !== periodB.level) {
    return false;
  }

  if (periodA.lecturerName !== periodB.lecturerName) {
    return false;
  }

  if (periodA.lecturerId !== periodB.lecturerId) {
    return false;
  }

  if (periodA.venue !== periodB.venue) {
    return false;
  }

  if (periodA.state !== periodB.state) {
    return false;
  }
  return true;
}

export function equalperiodArray(Arr, Arr1) {
  // function to check if two period collections are identical.

  if (Arr.length !== Arr1.length) {
    return false;
  }

  for (let i = 0; i < Arr.length; i++) {
    if (!equalPeriods(Arr[i], Arr1[i])) {
      return false;
    }
  }
  return true;
}

export async function getSysDefaults() {
  // function to get system default configs
  // ******** this should be a method of the student class( the base class of this system) so that
  // ******** this would be a post request so that each user can get only data available for his accountType

  return await (await fetch("/admin/getSysDefaults")).json();
}

export function millisecondsToDays(milliseconds) {
  // function to convert milliseconds into days
  return parseInt(milliseconds / 86400000);
}

export function elementDisabled(id, bool) {
  // function to disable any HTML element by query selected value NOT just id
  document.querySelector(id).disabled = bool;
}

export function setBorderBColor(target, color) {
  // function to set the border bottom of target(html element) to color if the target isn't disabled
  if (!target.disabled) {
    target.style.borderBottom = `2px solid ${color}`;
  }
}

export function findElement(criteria = "_id", value, iterableCollection = [], lastIndex = false) {
  // function to simulate a database query from an iterable collection
  // ***** Extra module `isEquivalent` *****

  // console.log(iterableCollection);

  if (iterableCollection.length === 0) {
    return undefined;
  }

  if (criteria === "week") {
    let index = 0;
    for (let element of iterableCollection) {
      if (element.week.firstDay == value.firstDay) {
        return { element, index };
      }
      index++;
    }
  } else {
    let index = 0;
    for (let element of iterableCollection) {
      if (isEquivalent(element[criteria], value) || element[criteria] === value) {
        return { element, index };
      }
      index++;
    }
  }
  return undefined;
}

export function arrayInit(type = "period") {
  // function to reset a collection of periods
  // this function maybe modified in days ahead to create a default TT depending on all defaults of the system
  // hence maybe it'll become an async function

  let initArray = [];
  let rows = 42; //
  if (type === "period") {
    for (let i = 0; i < rows; i++) {
      initArray[i] = new Period();
    }
  } else if (type === "event") {
    for (let i = 0; i < rows; i++) {
      initArray[i] = new Event();
    }
  } else if (type === "avail") {
    for (let i = 0; i < rows; i++) {
      initArray[i] = new Avail();
    }
  }

  return initArray;
}

// Other stuffs
export function isEquivalent(first, second) {
  // Just make sure the 2 objects do not have the same reference
  // Create array of property names

  // if (first === undefined && second !== undefined) {
  //     return false;
  // } else if (first !== undefined && second === undefined) {
  //     return false;
  // } else if (first === undefined && second === undefined) {
  //     return true;
  // }

  let propsFirst = Object.getOwnPropertyNames(first);
  let propsSecond = Object.getOwnPropertyNames(second);

  // if num of props of 2 objects are different, then the objects can't be equal
  if (propsFirst.length !== propsSecond.length) {
    return false;
  }

  // If values of same property are not equal,
  // objects are not equivalent
  for (let i = 0; i < propsFirst.length; i++) {
    if (first[propsFirst[i]] !== second[propsFirst[i]]) {
      return false;
    }
  }
  return true;
}
