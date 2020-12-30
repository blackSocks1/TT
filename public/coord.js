import {
  Coordinator,
  Cell,
  Week,
  millisecondsToDays,
  findElement,
  elementDisabled,
  iucTemplate,
  generateCoordinatorTT,
  takeColorIfNotDisabled,
  userTTInit,
  host,
  port
} from "./functions.js";

// function FirstAndLastDays(date) {
//     return { firstDay: new Date(date.getFullYear(), date.getMonth(), 1), lastDay: new Date(date.getFullYear(), date.getMonth() + 1, 0) };
// }
// console.log(FirstAndLastDays(new Date()));

(async () => {
  let Me = new Coordinator("coord_1", 'Kamto Eddy', 'coordinator', "web", "#left", "#right");

  let courseDb = [];
  let lecturerDb = [];
  let venueDb = [];
  let levelDb = [];

  await getData();
  await iucTemplate('.student', Me);
  await generateCoordinatorTT("#coordinatorTT");

  // All event Listeners
  document.querySelectorAll("td.display").forEach(cell => cell.addEventListener("click", Me.showCell));
  document.querySelector("#sendButton").addEventListener("click", SendTimeTable);
  document.querySelector("#Validate").addEventListener("click", validate);
  document.querySelector("#preview").addEventListener('click', preview);
  document.querySelector("#editPresentTT").addEventListener('click', loadTTForEditing);

  // TT nav buttons
  document.querySelector('#left').addEventListener('click', Me.nextTT);
  document.querySelector('#right').addEventListener('click', Me.nextTT);

  elementDisabled("#sendButton", true);
  elementDisabled("#preview", true);
  elementDisabled("#editPresentTT", true);

  document.querySelector('#weekS').addEventListener('input', upWeek);
  document.querySelector('#weekE').addEventListener('input', upWeek);

  // Make connection
  let socket;

  try {
    socket = io.connect(`https://${host}:${port}`);
    Me.connected = true;
  } catch (err) {
    Me.connected = false;
    console.log(err);
  } finally {
    if (Me.connected) {
      socket.emit('book-me', Me);
    }
  }

  //Listen for events
  socket.on('book-me-res', (data) => {
    document.querySelector('.accInfo').innerHTML += `<br><strong>${data.message}</strong>`;
  });

  async function getDbData() {
    try {
      let resCourses = await fetch('/get-courses');
      let dataCourses = await resCourses.json();
      let resLecturers = await fetch('/get-lecturers');
      let dataLecturers = await resLecturers.json();
      let resVenues = await fetch('/get-venues');
      let dataVenues = await resVenues.json();
      let resLevels = await fetch('/get-levels');
      let dataLevels = await resLevels.json();

      courseDb = Array.from(dataCourses).sort((a, b) => {
        if (a.name === b.name) {
          return 0;
        } else {
          return a.name < b.name ? -1 : 1;
        }
      });
      //console.log(courseDb);
      let courseList = document.querySelector("#Courses");
      courseList.innerHTML = '';
      courseDb.forEach((course) => {
        course.timeInWeek = course.timeLeft;
        courseList.innerHTML += `<option value="${course.name}">`;
      });

      lecturerDb = Array.from(dataLecturers).sort((a, b) => {
        if (a.name === b.name) {
          return 0;
        } else {
          return a.name < b.name ? -1 : 1;
        }
      });
      //console.log(lecturerDb);
      let lecList = document.querySelector("#Lecturers");
      lecList.innerHTML = '';
      lecturerDb.forEach((lecturer) => {
        lecList.innerHTML += `<option value="${lecturer.name}">`;
      });

      venueDb = Array.from(dataVenues).sort((a, b) => {
        if (a._id === b._id) {
          return 0;
        } else {
          return a._id < b._id ? -1 : 1;
        }
      });
      // console.log(venueDb);
      let venueList = document.querySelector("#Venues");
      venueList.innerHTML = '';
      venueDb.forEach((venue) => {
        venueList.innerHTML += `<option value="${venue._id}">`;
      });

      levelDb = Array.from(dataLevels).sort((a, b) => {
        if (a._id === b._id) {
          return 0;
        } else {
          return a._id < b._id ? -1 : 1;
        }
      });

      let levelNav = document.querySelector(".levelNav");

      let levelList = document.querySelector("#Levels");
      levelList.innerHTML = '';
      levelDb.forEach(level => {
        levelList.innerHTML += `<option value="${level._id}">`;
      });
      // console.log(levelDb);
      elementDisabled("#send_button", true);
    } catch (err) {};
    //console.log(lecturerDb);
  }

  function getData() {
    getDbData();
    setInterval(getDbData, 60000);
  }

  // Initialization of globals
  let weekS = document.querySelector('#weekS');
  weekS.addEventListener('input', upWeek);
  let weekE = document.querySelector('#weekE');
  weekE.addEventListener('input', upWeek);
  let levelInput = document.querySelector('#level');
  let level = levelInput.value;

  let docCells = document.querySelectorAll('.cell'), // Array.from(document.forms); // getting all the cells
    cells = [],
    programmedCells = [],
    valid = '',
    emptyTable = '',
    adminTime = document.querySelectorAll('.adTime'),
    noOfPeriods = adminTime.length,
    programmed_lect = new Set(),
    colorOk = '2px solid gray',
    colorNotOk = '2px solid orangered',
    weekToProgram = new Week(weekS.value, weekE.value);

  // validation on input
  levelInput.addEventListener('input', checkInDb);
  docCells.forEach((cell) => {
    let inputs = cell.querySelectorAll("input");
    inputs[0].addEventListener("input", checkInDb);
    inputs[1].addEventListener("input", checkInDb);
    inputs[2].addEventListener("input", checkInDb);
  });

  let updatedLecturers = [];

  // Initialization of globals
  function initGlobals() {
    elementDisabled("#sendButton", true);
    elementDisabled("#preview", true);
    levelInput = document.querySelector('#level');
    level = levelInput.value;
    docCells = document.querySelectorAll('.cell'); // Array.from(document.forms); // getting all the cells
    cells = [];
    programmedCells = [];
    valid = '';
    emptyTable = '';
    adminTime = document.querySelectorAll('.adTime');
    updatedLecturers = [];
    noOfPeriods = adminTime.length;
    programmed_lect = new Set();
    // adminTime.forEach((time) => time.style.borderBottom = colorOk);
    // adminTime.forEach((timeOutput, index) => {
    //     timeOutput.value = defaultPeriods[index];
    // });
    weekToProgram = new Week(weekS.value, weekE.value);

    weekS.style.borderBottom = colorOk;
    weekE.style.borderBottom = colorOk;

    lecturerDb.forEach((lecturer) => {
      lecturer.schedule = [];
      lecturer.temp_TT = userTTInit(42, {
        courseInfo: '',
        level: '',
        venue: ""
      });
    });
  }

  async function canModify(TT) {

    initGlobals();

    if (TT) {
      let today = new Date().getTime();

      let docCells = document.querySelectorAll('.cell');
      let adminTime = document.querySelectorAll('input.adTime');

      if ((millisecondsToDays(weekToProgram.firstDay - Me.TT_Defaults.week.firstDay) >= 7) && (millisecondsToDays(today - Me.TT_Defaults.week.lastDay) > 0)) {
        // set start and stop time for each cell if on a week ahead of previous default and date of today is also greater than previous default end of week

        // console.log("Different week (for cell start and stop times) => generating data then loadind data to interface");
        Me.TT_Defaults.week = weekToProgram;
        for (let i = 0; i <= 6; i++) {
          let counter = 0;
          let initIndex = i;
          let a = 0;

          while (counter < (noOfPeriods / 2)) {
            let periodStart = '',
              periodStop = '',
              startTime = adminTime[a].value,
              stopTime = adminTime[a + 1].value;

            // end of trouble
            periodStart = new Date(new Date(weekToProgram.firstDay).getFullYear(), new Date(weekToProgram.firstDay).getMonth(), new Date(weekToProgram.firstDay).getDate() + i, 0, 0, 0, 0);
            periodStart.setHours(Number(startTime.slice(0, 2)), Number(startTime.slice(3)), 0, 0);

            periodStop = new Date(new Date(weekToProgram.firstDay).getFullYear(), new Date(weekToProgram.firstDay).getMonth(), new Date(weekToProgram.firstDay).getDate() + i, 0, 0, 0, 0);
            periodStop.setHours(Number(stopTime.slice(0, 2)), Number(stopTime.slice(3)), 0, 0);

            Me.TT_Defaults.periods[initIndex] = {
              periodStart: periodStart.getTime(),
              periodStop: periodStop.getTime()
            };

            counter++;
            initIndex += 7;
            a += 2;
          }
          await Me.setMyDefaults();
          await Me.getMyDefaults();
        }
      } else {
        // console.log("Same week (for cell start and stop times) => loading data to interface");
        for (let i = 0; i <= 6; i++) {
          let counter = 0;
          let initIndex = i;

          while (counter < (noOfPeriods / 2)) {
            let cell = docCells[initIndex];
            cell.querySelector('input.periodStart').value = Me.TT_Defaults.periods[initIndex].periodStart;
            cell.querySelector('input.periodStop').value = Me.TT_Defaults.periods[initIndex].periodStop;
            counter++;
            initIndex += 7;
          }
        }
      }

      let ttCells = TT.cells;
      // console.log(weekToProgram.firstDay, TT.week.firstDay);

      // if (new Date(weekToProgram.firstDay).getDay() !== 1 || weekToProgram.lastDay < today) {
      if (new Date(weekToProgram.firstDay).getDay() !== 1) {
        if (new Date(weekToProgram.firstDay).getDay() !== 1) {
          console.log("All cells are disabled. You're trying to edit a TT that does not start from Monday");
        } else {
          console.log("Trying to program a past week");
        }
        weekE.style.borderBottom = colorNotOk;
        weekS.style.borderBottom = colorNotOk;
        docCells.forEach((cell) => {
          cell = cell.querySelectorAll('input');

          cell[0].disabled = true;
          cell[1].disabled = true;
          cell[2].disabled = true;
          cell[3].disabled = true;
        });
        valid += 'false';
      } else if ((millisecondsToDays(weekToProgram.firstDay - TT.week.firstDay) >= 0 && millisecondsToDays(weekToProgram.firstDay - TT.week.firstDay) <= 5) && (weekToProgram.firstDay <= today && weekToProgram.lastDay >= today)) {

        console.log("This Week");
        // first disable cells not to program again
        docCells.forEach((cell, index) => {
          cell = cell.querySelectorAll('input');

          if (ttCells[index].state === 'J') {
            cell[3].checked = true;
          } else {
            cell[3].checked = false;
          }

          if (new Number(cell[4].value) <= today) {
            cell[0].disabled = true;
            cell[1].disabled = true;
            cell[2].disabled = true;
            cell[3].disabled = true;
          } else {
            cell[0].disabled = false;
            cell[1].disabled = false;
            cell[2].disabled = false;
            cell[3].disabled = false;
          }
        });

        // search for TT with same week in given collection
        let prevTT;
        // initGlobals();
        let i = Me.TT.length - 1;
        while (i >= 0) {
          if (new Date(weekToProgram.firstDay).toDateString() === new Date(Me.TT[i].week.firstDay).toDateString()) {
            prevTT = Me.TT[i];
            break;
          }
          i--;
        }

        if (prevTT) {
          docCells.forEach((cell, index) => {
            cell = cell.querySelectorAll('input');
            let prevCell = prevTT.cells[index];

            if (new Number(cell[4].value) <= today) {
              cell[0].value = prevCell.courseName;
              cell[1].value = prevCell.lecturerName;
              cell[2].value = prevCell.venue;
              if (prevCell.state === 'J') {
                cell[3].checked = true;
              } else {
                cell[3].checked = false;
              }
            }
          });
        }

      } else if (millisecondsToDays(weekToProgram.lastDay - today) > 1) {
        //  && millisecondsToDays(dateNow - weekToProgram.firstDay) >= 0
        console.log("Programming (a) week(s) ahead; We'll surely restrict this feature to a difference of a single week. Why should you program up to 2 weeks or more ahead??");
        docCells.forEach((cell) => {
          cell = cell.querySelectorAll('input');

          cell[0].disabled = false;
          cell[1].disabled = false;
          cell[2].disabled = false;
          cell[3].disabled = false;
        });
      } else {
        console.log("Trying to program a past week. Not Possible!");
        docCells.forEach((cell) => {
          cell = cell.querySelectorAll('input');

          cell[0].disabled = true;
          cell[1].disabled = true;
          cell[2].disabled = true;
          cell[3].disabled = true;
        });
        valid += 'false';
      }
    } else {
      clearCoordTT(docCells);
    }
  }

  function clearCoordTT(cells) {
    Me.resetTT();
    cells.forEach((cell) => {
      cell = cell.querySelectorAll('input');

      cell[0].value = "";
      cell[0].disabled = false;
      cell[1].value = "";
      cell[1].disabled = false;
      cell[2].value = "";
      cell[2].disabled = false;
      cell[3].checked = false;
      cell[3].disabled = false;
    });
    console.log("All cells cleared!")
  }

  async function loadTTForEditing(e) {
    let TT = Me.ttOnScreen;
    let docCells = document.querySelectorAll('.cell');
    let week = TT.week;

    try {
      weekS.value = new Date(week.firstDay).toISOString().substring(0, 10);
      weekE.value = new Date(week.lastDay).toISOString().substring(0, 10);
    } catch (err) {}

    docCells.forEach((cell, index) => {
      cell = cell.querySelectorAll('input');
      let ttCells = TT.cells;

      cell[0].value = ttCells[index].courseName;
      cell[1].value = ttCells[index].lecturerName;
      cell[2].value = ttCells[index].venue;
      if (ttCells[index].state === 'J') {
        cell[3].checked = true;
      } else {
        cell[3].checked = false;
      }
      cell[4].value = ttCells[index].periodStart;
    });
    await canModify(TT);
  }

  function checkInDb(e) {
    elementDisabled("#sendButton", true);
    elementDisabled("#preview", true);

    if (e.target.value.trim() !== "") {

      if (e.target.list.id === "Courses") {
        let course = findElement('name', e.target.value.trim(), courseDb);
        if (course) {
          takeColorIfNotDisabled(e.target, colorOk);
        } else {
          takeColorIfNotDisabled(e.target, colorNotOk);
        }
      } else if (e.target.list.id === "Lecturers") {
        let lecturer = findElement('name', e.target.value.trim(), lecturerDb);
        if (lecturer) {
          takeColorIfNotDisabled(e.target, colorOk);
        } else {
          takeColorIfNotDisabled(e.target, colorNotOk);
        }
      } else if (e.target.list.id === "Venues") {
        let venue = findElement('_id', e.target.value.trim(), venueDb);
        if (venue) {
          takeColorIfNotDisabled(e.target, colorOk);
        } else {
          takeColorIfNotDisabled(e.target, colorNotOk);
        }
      } else if (e.target.list.id === "Levels") {
        let level = findElement('_id', e.target.value.trim(), levelDb);
        if (level) {
          takeColorIfNotDisabled(e.target, colorOk);

          Me.TT = level.TT;
          Me.index = Me.TT.length - 1;
          Me.ttOnScreen = Me.TT[Me.index];

          Me.displayTT(Me.ttOnScreen);

          if (Me.TT.length > 0) {
            elementDisabled("#editPresentTT", false);
          } else {
            elementDisabled("#editPresentTT", true);
          }

        } else {
          e.target.style.borderBottom = colorNotOk;
          Me.resetTT();
          canModify(Me.ttOnScreen);
          Me.displayTT(Me.ttOnScreen)
          elementDisabled("#editPresentTT", true);
        }
        initGlobals();
        canModify({
          week: weekToProgram,
          cells: docCells
        });
      }
    } else {
      e.target.value = "";
      if (e.target.list.id === "Levels" && e.target.value.trim() === "") {
        takeColorIfNotDisabled(e.target, colorNotOk);
        clearCoordTT(docCells);

        Me.TT = [];
        Me.ttOnScreen = undefined;
        Me.displayTT(Me.ttOnScreen)
        elementDisabled("#editPresentTT", true);
      }
    }
  }

  function upWeek(e) {
    let date = Date.parse(e.target.value);
    initGlobals();
    if (date) {
      date = new Date(date);

      if (e.target.id === 'weekS') {
        weekE.value = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7).toISOString().substring(0, 10);
        weekE.style.borderBottom = colorOk;
      } else {
        weekS.value = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 5).toISOString().substring(0, 10);
        weekS.style.borderBottom = colorOk;
      }

      let today = new Date().getTime();
      let week = new Week(weekE.value, weekS.value);

      if (week.lastDay < today) {
        takeColorIfNotDisabled(weekE, colorNotOk);
        takeColorIfNotDisabled(weekS, colorNotOk);
      } else {
        takeColorIfNotDisabled(weekE, colorOk);
        takeColorIfNotDisabled(weekS, colorOk);
      }

      initGlobals();
      canModify({
        week: weekToProgram,
        cells: docCells
      });

    } else {
      e.target.style.borderBottom = colorNotOk;
      canModify(undefined);
    }
  }

  function validate() {
    // Getting the data from admin timetable and validating

    initGlobals(); // without this, the validation and sending won't be smooth. One would need to refresh

    if (Date.parse(weekS.value)) {
      takeColorIfNotDisabled(weekS, colorOk);
      takeColorIfNotDisabled(weekE, colorOk);
      weekToProgram = new Week(weekS.value, weekE.value);
      // weekToProgram = new Week(new Date(weekS.value).setHours(10), new Date(weekE.value).setHours(10));
    } else {
      takeColorIfNotDisabled(weekS, colorNotOk);
      takeColorIfNotDisabled(weekE, colorNotOk);
      valid += 'false';
    }

    // console.log(week);

    // Checking data validity
    for (let i = 0; i <= 6; i++) {
      let counter = 0;
      let initIndex = i;
      let a = 0;

      while (counter < (noOfPeriods / 2)) {
        let cell = docCells[initIndex];

        // cell.querySelector('input.periodStart').value = Me.TT_Defaults.periods[initIndex].periodStart;
        // cell.querySelector('input.periodStop').value = Me.TT_Defaults.periods[initIndex].periodStop;

        let periodStart = '';
        let periodStop = '';
        let courseInput = cell.querySelectorAll('input')[0],
          courseName = courseInput.value.trim(),
          lecturerInput = cell.querySelectorAll('input')[1],
          lecturerName = lecturerInput.value.trim(),
          venueInput = cell.querySelectorAll('input')[2],
          venueValue = venueInput.value.trim(),
          joint = cell.querySelectorAll('input')[3].checked,
          state = 'free',
          course = findElement('name', courseName, courseDb),
          lecturer = findElement('name', lecturerName, lecturerDb),
          venue = findElement('_id', venueValue, venueDb),
          lecturerId = '',
          courseInfo = '',
          start = adminTime[a],
          startTime = start.value,
          stop = adminTime[a + 1],
          stopTime = stop.value,
          date = new Date(),
          initDate = new Date(date.toDateString());

        if (startTime === '') {
          start.style.borderBottom = colorNotOk;
          valid += 'false';
        } else {
          start.style.borderBottom = colorOk;
          let hours = startTime.slice(0, 2);
          let mins = startTime.slice(3);
          date.setHours(Number(hours));
          date.setMinutes(Number(mins));
          startTime = date;
        }

        if (stopTime === '') {
          stop.style.borderBottom = colorNotOk;
          valid += 'false';
        } else {
          stop.style.borderBottom = colorOk;
          let hours = stopTime.slice(0, 2);
          let mins = stopTime.slice(3);
          initDate.setHours(Number(hours));
          initDate.setMinutes(Number(mins));
          stopTime = initDate;
        }
        if ((startTime !== '' && stopTime !== '') && (startTime.getTime() >= stopTime.getTime())) {
          valid += 'false';
          start.style.borderBottom = colorNotOk;
          stop.style.borderBottom = colorNotOk;
        }

        if (startTime !== "" && stopTime !== '') {
          periodStart = Me.TT_Defaults.periods[initIndex].periodStart;
          periodStop = Me.TT_Defaults.periods[initIndex].periodStop;
        }

        // console.log(index + 1, periodStart.toDateString(), 'to', periodStop.toDateString());

        if (level === '') {
          valid += 'false';
          levelInput.style.borderBottom = colorNotOk;
        } else {
          levelInput.style.borderBottom = colorOk;
        }

        if (courseName === '' && lecturerName === '' && venueValue === '') {
          if (!courseInput.disabled) {
            courseInput.style.borderBottom = colorOk;
            lecturerInput.style.borderBottom = colorOk;
            venueInput.style.borderBottom = colorOk;
          }
          state = 'A'; // n/p for not programmed
        } else {
          if (joint) {
            state = 'J'; // J -> joint, A -> Available, N\A -> Not available, P -> Programmed
          } else {
            state = 'P';
          }

          if (course) {
            if (course.timeInWeek === 0) {
              takeColorIfNotDisabled(courseInput, colorNotOk);
              valid += 'false';
            } else {
              course.timeInWeek -= 2;
              if (course.timeInWeek < 0) {
                course.timeInWeek = 0;
              }
              courseInfo = `[${state}] ${courseName} (${course.timeInWeek} / ${course.timeAlloc})`;
              takeColorIfNotDisabled(courseInput, colorOk);
              emptyTable += 'false';
            }
          } else {
            takeColorIfNotDisabled(courseInput, colorNotOk);
            valid += 'false';
          }

          if (lecturer) {
            // if (lecturer.avail_TT[index] === 'A' || (lecturer.avail_TT[index] === 'J' && state === 'J')) { // must include room condition here too
            //     lecturerInput.style.borderBottom = colorOk;
            //     lecturer.schedule.push(initIndex);
            //     programmed_lect.add(lecturer);
            //     lecturerId = lecturer._id;
            // } else {
            //     lecturerInput.style.borderBottom = colorNotOk;
            //     valid += 'false';
            // }

            takeColorIfNotDisabled(lecturerInput, colorOk);
            lecturer.schedule.push(initIndex);
            programmed_lect.add(lecturer);
            lecturerId = lecturer._id;
            emptyTable += 'false';
          } else {
            lecturerId = '';
            takeColorIfNotDisabled(lecturerInput, colorNotOk);
            valid += 'false';
          }

          if (venue) {
            venue.state[initIndex] = state; // J -> joint, A -> Available, N\A -> Not available, P -> Programmed
            takeColorIfNotDisabled(venueInput, colorOk);
            emptyTable += 'false';
          } else {
            takeColorIfNotDisabled(venueInput, colorNotOk);
            valid += 'false';
          }
        }

        cells[initIndex] = new Cell(courseName, courseInfo, lecturerName, venueValue, state, lecturerId, periodStart, periodStop);
        if (state === 'P' || state === 'J') {
          programmedCells.push(initIndex);
        }
        counter++;
        initIndex += 7;
        a += 2;
        // console.log(cells[initIndex].periodStart, cells[initIndex].periodStop)
      }
    }

    // Searching for a false in the validation string or if all cells are empty to determine if data is valid to be sent or not
    var empty = emptyTable.includes('false'); // false --> whole table is empty and true --> not empty
    valid = !valid.includes("false"); // true --> valid and false --> invalid
    valid = !(valid && empty); // ideal case valid = !(true && true)
    elementDisabled("#preview", false); // preview newly programmed TT only after validating
    elementDisabled("#sendButton", valid); // true --> disable send button and false will enable it.
  }

  function isEquivalent(first, second) {
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

  function checkTTCellEquality(first, second) {
    // function to check if cells of 2 TT are equal

    for (let i = 0; i < first.length; i++) {
      if (!isEquivalent(first[i], second[i])) {
        return false;
      }
    }
    return true;
  }

  // function preview() {
  //     // function to enable coordinator to preview newly programmed TT before sending
  //     // Grouping time for sending
  //     let timeArray = [];
  //     adminTime.forEach((time) => {
  //         var tSend = time.value;

  //         if (tSend === '' || tSend === undefined) {
  //             tSend = '00:00';
  //         }
  //         timeArray.push(tSend);
  //     });

  //     jsonData = JSON.stringify([level, { week, cells, time: timeArray }]);
  //     let data = JSON.parse(jsonData); // Decoding JSON data
  //     let objData = data[1].cells; // Receiving cell data
  //     let timeData = data[1].time; // Receiving time
  //     let output = document.querySelector('.displayTT').querySelectorAll('.display');
  //     let studentTime = document.querySelector('.displayTT').querySelectorAll('output.time');

  //     // Receiving and filling cell data
  //     for (let i = 0; i < objData.length; i++) {
  //         output[i].getElementsByTagName('output')[0].value = objData[i].courseInfo;
  //         output[i].getElementsByTagName('output')[1].value = objData[i].lecturerName;
  //         output[i].getElementsByTagName('output')[2].value = objData[i].venue;
  //         console.log(new Date(objData[i].periodStart).toUTCString(), new Date(objData[i].periodStop).toUTCString())
  //     }

  //     studentTime.forEach((time, i) => {
  //         time.value = timeData[i];
  //     });
  //     // elementDisabled("#sendButton", valid); // true --> disable send button and false will enable it.
  // }

  async function SendTimeTable() {

    // compilation of correctly programmed lecturers' temp_TT
    lecturerDb.forEach((lecturer) => {
      let oldTT;

      if (lecturer.TT.length > 0) {
        oldTT = JSON.parse(JSON.stringify(lecturer.TT[lecturer.TT.length - 1])); // getting the old TT from deep copy

        if (isEquivalent(oldTT.week, weekToProgram)) {
          lecturer.temp_TT = JSON.parse(JSON.stringify(oldTT.cells)); // filling temp_TT with old TT before adding new data and comparing
        } else {
          lecturer.temp_TT = userTTInit(42, {
            courseInfo: '',
            level: '',
            venue: ""
          });
        }
      } else {
        oldTT = {
          week: weekToProgram,
          cells: []
        };
      }

      cells.forEach((cell, index) => {
        if (lecturer.schedule.includes(index) && programmedCells.includes(index)) {
          lecturer.temp_TT[index] = {
            courseInfo: cell.courseInfo,
            level,
            venue: cell.venue
          };
          lecturer.avail_TT.currentAvail[index] = cell.state;
        } else if ((lecturer.temp_TT[index].level === level) && !lecturer.schedule.includes(index)) {
          lecturer.temp_TT[index] = {
            courseInfo: '',
            level: '',
            venue: ""
          };
          lecturer.avail_TT.currentAvail[index] = 'A';
        }
        lecturer.temp_TT[index].periodStart = cell.periodStart;
        lecturer.temp_TT[index].periodStop = cell.periodStop;
      });

      if ((lecturer.schedule.length > 0 && !checkTTCellEquality(oldTT.cells, lecturer.temp_TT)) || (isEquivalent(oldTT.week, weekToProgram) && !checkTTCellEquality(oldTT.cells, lecturer.temp_TT))) {

        updatedLecturers.push({
          week: weekToProgram,
          _id: lecturer._id,
          currentAvail: lecturer.avail_TT.currentAvail,
          temp_TT: lecturer.temp_TT
        });
        console.log(lecturer.name);
        console.log("--------------------------------");
      }
    });

    if (updatedLecturers.length > 0) {
      //Sending cell data and time as JSON

      fetch('/TT-upLevelTT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify([level, {
          week: weekToProgram,
          cells
        }])
      }).then((res) => {}).catch(err => {
        console.log(err);
      });

      fetch('/TT-upCourses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify([level, courseDb])
      }).then((res) => {}).catch(err => {
        console.log(err);
      });

      fetch('/TT-upLecturers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(updatedLecturers)
      }).then((res) => {}).catch(err => {
        console.log(err);
      });

      // fetch('/TT-upVenues', {
      //     method: 'POST',
      //     headers: {
      //         'Content-Type': 'application/json;charset=utf-8'
      //     },
      //     body: JSON.stringify(venueDb)
      // }).then((res) => {}).catch(err => {
      //     console.log(err);
      // });
      console.log("TT sent!");
    } else {
      console.log("No TT sent!");
    }

    initGlobals();
    await getDbData();
    let levelOnScreen = findElement("_id", level, levelDb);
    Me.TT = levelOnScreen.TT;
    Me.index = Me.TT.length - 1;
    Me.ttOnScreen = Me.TT[Me.index];

    Me.displayTT(Me.ttOnScreen);

    elementDisabled("#sendButton", true);
    elementDisabled("#preview", true);
  }

})();