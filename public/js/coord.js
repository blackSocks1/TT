import {
  Coordinator,
  Period,
  Week,
  Person,
  Event,
  TTdraft,
  Lecturer,
  Program,
  millisecondsToDays,
  findElement,
  elementDisabled,
  setBorderBColor,
  equalperiodArray,
  getSysDefaults,
  hostLink,
  arrayInit,
  isEquivalent,
} from "./functions.js";

// function FirstAndLastDays(date) {
//     return { firstDay: new Date(date.getFullYear(), date.getMonth(), 1), lastDay: new Date(date.getFullYear(), date.getMonth() + 1, 0) };
// }
// console.log(FirstAndLastDays(new Date()));

(async () => {
  // Initialization of very important globals
  let Me = new Coordinator(document.querySelectorAll("output.myData")[0].value);
  Me.connectToSocket(hostLink);

  let courseDb = [];
  let lecturerDb = [];
  let venueDb = [];
  let venueDbClone = [];
  let levelDb = [];
  let sysDefaults = await getSysDefaults();

  // Initialization of other globals
  let docPeriods = document.querySelectorAll(".coordPeriod"), // Array.from(document.forms); // getting all the periods
    periods = [],
    programmedPeriods = [],
    disabledPeriods = [],
    // programmedLect = new Set(),
    // programmedVenues = new Set(),
    colorOk = "gray",
    colorNotOk = "orangered";

  // await iucTemplate("#coordDisplayTT", Me);
  await Me.generateDisplayTT("#coordDisplayTT", "coordDisplay");
  await Me.generateCoordinatorTT("#coordinatorTT");
  // setting default week to program to this week
  document.querySelector("#weekStart").value = new Date(new Week().firstDay)
    .toISOString()
    .substring(0, 10);
  document.querySelector("#weekEnd").value = new Date(new Week().lastDay)
    .toISOString()
    .substring(0, 10);
  coordUIRefresh();
  setInterval(coordUIRefresh, 10000);
  await getDbData();
  setInterval(getDbData, 60000);

  // // Make connection
  // let socket;

  // try {
  //   socket = io.connect(hostLink);
  //   Me.connected = true;
  // } catch (err) {
  //   Me.connected = false;
  //   console.log(err);
  // } finally {
  //   if (Me.connected) {
  //     socket.emit("book-me", Me);
  //   }
  // }

  // // Listen for events
  // socket.on("book-me-res", (data) => {
  //   document.querySelector(".accInfo").innerHTML += `<br><strong>${data.message}</strong>`;
  // });

  // All event Listeners
  document
    .querySelectorAll("td.period")
    .forEach((period) => period.addEventListener("click", Me.showPeriod));
  document.querySelector("#sendButton").addEventListener("click", SendTimeTable);
  document.querySelector("#Validate").addEventListener("click", validate);
  document.querySelector("#preview").addEventListener("click", preview);
  document.querySelector("#editPresentTT").addEventListener("click", loadTTForEditing);

  elementDisabled("#sendButton", true);
  elementDisabled("#preview", true);
  elementDisabled("#editPresentTT", true);

  document.querySelector("#weekStart").addEventListener("input", upWeek);
  // document.querySelector("#weekEnd").addEventListener("change", upWeek);

  document.querySelector("#Levels").addEventListener("input", checkInDb);
  // document.querySelector("#Levels").addEventListener("input", useLevelTT);
  docPeriods.forEach((period) => {
    let inputs = period.querySelectorAll("input");
    inputs[0].addEventListener("input", checkInDb);
    inputs[1].addEventListener("input", checkInDb);
    inputs[2].addEventListener("input", checkInDb);
  });

  // Initialization of globals
  function initGlobals() {
    // function to reinitialize global variables

    elementDisabled("#sendButton", true);
    elementDisabled("#preview", true);
    docPeriods = document.querySelectorAll(".coordPeriod"); // Array.from(document.forms); // getting all the periods
    periods = [];
    programmedPeriods = [];
    disabledPeriods = [];
    // programmedLect = new Set();
    // programmedVenues = new Set();

    setBorderBColor(document.querySelector("#weekStart"), colorOk);
    setBorderBColor(document.querySelector("#weekEnd"), colorOk);
  }

  async function getDbData() {
    let lastSeen = await Me.getLastSeen();
    let today = new Date().getTime();

    if (lastSeen <= today) {
      console.log("System time ok!");
      await Me.setLastSeen();
      let resLecturers = await fetch("/coord/get-lecturers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({ _id: Me._id }),
      });
      let dataLecturers = await resLecturers.json();
      let resVenues = await fetch("/coord/get-venues");
      let dataVenues = await resVenues.json();
      let resLevels = await fetch("/coord/get-levels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({ _id: Me._id }),
      });

      let dataLevels = await resLevels.json();

      lecturerDb = Array.from(dataLecturers).sort((a, b) => {
        // return (a.name === b.name) ? 0 : a.name < b.name ? -1 : 1;
        if (a.name === b.name) {
          return 0;
        } else {
          return a.name < b.name ? -1 : 1;
        }
      });

      let newLects = [];
      let preLects = "";

      for (let lecturer of lecturerDb) {
        preLects += `<option value="${lecturer.name}">`;
        let newLecturer = new Lecturer(lecturer._id, lecturer.name);
        newLecturer.TT = lecturer.TT;
        newLecturer.avail = lecturer.avail;
        // let thisWeek = findElement("week", new Week(), newLecturer.avail.weekAvail);
        // if (!thisWeek) {
        //   newLecturer.avail.weekAvail.push({ week: new Week(), periods: arrayInit("avail") });
        // }
        newLects.push(newLecturer);
      }

      let lecList = document.querySelector("#Lecturers");
      lecList.innerHTML = "";
      lecList.innerHTML = preLects;
      lecturerDb = [...newLects];
      // console.log(lecturerDb);

      venueDb = Array.from(dataVenues).sort((a, b) => {
        if (a._id === b._id) {
          return 0;
        } else {
          return a._id < b._id ? -1 : 1;
        }
      });

      // venueDbClone = Array.from(venueDb);

      // console.log(venueDb);
      let preVenues = "";
      venueDb.forEach((venue) => {
        preVenues += `<option value="${venue._id}">`;
      });
      let venueList = document.querySelector("#Venues");
      venueList.innerHTML = "";
      venueList.innerHTML = preVenues;

      levelDb = Array.from(dataLevels).sort((a, b) => {
        if (a._id === b._id) {
          return 0;
        } else {
          return a._id < b._id ? -1 : 1;
        }
      });

      let selectLength = document.querySelector("#Levels").length;
      if (selectLength !== levelDb.length) {
        let preLevel = "";
        levelDb.forEach((level, index) => {
          preLevel +=
            index === 0
              ? `<option value="${level._id}" selected>${level._id}</option>`
              : `<option value="${level._id}">${level._id}</option>`;
        });
        let levelList = document.querySelector("#Levels");
        levelList.innerHTML = "";
        levelList.innerHTML = preLevel;
        useLevelTT(levelList);
      }

      // document.querySelector("#Levels").addEventListener("input", (e) => {
      //   console.log(e.target.value)
      // });

      // console.log(levelDb);
      initGlobals();
    } else {
      console.log("Invalid system time. Please fix this ASAP!");
    }
    elementDisabled("#sendButton", true);
    // console.log("Getting Db data fine!");

    //console.log(lecturerDb);
  }

  function useLevelTT(e, uE) {
    // if (e) {
    //   e = e.target;
    // } else {
    //   e = Eu;
    // }
    let level = findElement("_id", e.value, levelDb).element;
    let courseList = document.querySelector("#Courses");
    let docPeriods = document.querySelectorAll(".coordPeriod");

    let weekToProgram = new Week(
      document.querySelector("#weekStart").value,
      document.querySelector("#weekEnd").value
    );

    initGlobals();
    // clearCoordTT(docPeriods);

    canModify({
      week: weekToProgram,
      periods: docPeriods,
    });

    courseDb = findElement("_id", level._id, levelDb).element.courses;

    courseDb = Array.from(courseDb).sort((a, b) => {
      if (a.name === b.name) {
        return 0;
      } else {
        return a.name < b.name ? -1 : 1;
      }
    });

    let preList = "";
    courseDb.forEach((course) => {
      course.timeInWeek = course.timeLeft; // use the last index of this course.timeLeft for current week for consistency upon changes
      preList += `<option value="${course.name}">`;
    });
    courseList.innerHTML = "";
    courseList.innerHTML = preList;
    // console.log(courseDb);

    Me.TT = level.TT;
    let ttOfThisWeek = findElement("week", weekToProgram, Me.TT);
    if (ttOfThisWeek) {
      Me.index = ttOfThisWeek.index;
    } else if (Me.TT.length > 0) {
      Me.index = Me.TT.length - 1;
    }
    Me.ttOnScreen = Me.TT[Me.index];
    // console.log(level._id, Me.ttOnScreen);
    Me.displayTT(Me.ttOnScreen);

    if (Me.TT.length > 0) {
      elementDisabled("#editPresentTT", false);
    } else {
      elementDisabled("#editPresentTT", true);
    }
  }

  function canModify(TT) {
    // function to check if a TT is modifiable

    initGlobals();
    setPeriodDefaults();

    let weekToProgram = new Week(
      new Date(document.querySelector("#weekStart").value),
      new Date(document.querySelector("#weekEnd").value)
    );
    let today = new Date().getTime();
    let docPeriods = document.querySelectorAll(".coordPeriod");

    if (TT) {
      if (new Date(weekToProgram.firstDay).getDay() !== 1) {
        console.log(
          "All periods are disabled. You're trying to edit a TT that does not start from Monday"
        );

        weekStart.style.borderBottom = colorNotOk;
        weekEnd.style.borderBottom = colorNotOk;

        docPeriods.forEach((period) => {
          period = period.querySelectorAll("input");

          period[0].disabled = true;
          period[1].disabled = true;
          period[2].disabled = true;
          period[3].disabled = true;
        });
        elementDisabled("#sendButton", true);
      } else if (weekToProgram.has(today)) {
        console.log("This Week");

        // first disable periods not to program again
        docPeriods.forEach((period, index) => {
          period = period.querySelectorAll("input");

          if (new Number(period[4].value) <= today) {
            period[0].disabled = true;
            period[1].disabled = true;
            period[2].disabled = true;
            period[3].disabled = true;
          } else {
            period[0].disabled = false;
            period[1].disabled = false;
            period[2].disabled = false;
            period[3].disabled = false;
          }
        });

        let level;
        let prevTT;
        try {
          level = findElement("_id", document.querySelector("#Levels").value, levelDb).element;

          // search for TT with same week in given collection
          prevTT = findElement("week", weekToProgram, level.TT);
        } catch (err) {}

        if (prevTT) {
          prevTT = prevTT.element;
          docPeriods.forEach((period, index) => {
            period = period.querySelectorAll("input");
            let prevPeriod = prevTT.periods[index];

            if (new Number(period[4].value) <= today) {
              period[0].value = prevPeriod.courseName;
              period[1].value = prevPeriod.lecturerName;
              period[2].value = prevPeriod.venue;
              if (prevPeriod.state === "J") {
                period[3].checked = true;
              } else {
                period[3].checked = false;
              }
            }
          });
        } else {
          docPeriods.forEach((period, index) => {
            period = period.querySelectorAll("input");

            if (new Number(period[4].value) <= today) {
              period[0].value = "";
              period[1].value = "";
              period[2].value = "";
              period[3].checked = false;
            }
          });
        }
      } else if (weekToProgram.isNextWeek()) {
        console.log("Programming Tt for next week");

        docPeriods.forEach((period) => {
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
        docPeriods.forEach((period) => {
          period = period.querySelectorAll("input");

          period[0].disabled = true;
          period[1].disabled = true;
          period[2].disabled = true;
          period[3].disabled = true;
        });
        elementDisabled("#sendButton", true);
      }
    } else {
      clearCoordTT(docPeriods);
    }
  }

  function clearCoordTT(ttPeriods) {
    // functions to clear and reset coordiantor TTs
    Me.resetTT();
    ttPeriods.forEach((period) => {
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
    initGlobals();
  }

  function coordUIRefresh() {
    // function to refresh coord UI after every set of seconds

    let weekStart = document.querySelector("#weekStart");
    let weekEnd = document.querySelector("#weekEnd");
    let weekToProgram;
    let docPeriods = document.querySelectorAll(".coordPeriod");

    if (Date.parse(weekStart.value)) {
      setBorderBColor(weekStart, colorOk);
      setBorderBColor(weekEnd, colorOk);
      weekToProgram = new Week(new Date(weekStart.value));
      setPeriodDefaults();
    } else {
      setBorderBColor(weekStart, colorNotOk);
      setBorderBColor(weekEnd, colorNotOk);
      weekToProgram = new Week();
    }

    let ths = document.querySelectorAll(".dayOfWeek");
    // console.log(weekToProgram.toDateString());

    let today = new Date();

    if (weekToProgram.has(today)) {
      today = today.getDay();

      if (today === 0) {
        today = ths.length;
      }

      ths.forEach((th, index) => {
        index + 1 === today
          ? th.setAttribute("class", "w3-small dayOfWeek today")
          : th.setAttribute("class", "w3-small dayOfWeek");
      });
    } else {
      ths.forEach((th) => th.setAttribute("class", "w3-small dayOfWeek"));
    }

    canModify({
      week: weekToProgram,
      periods: docPeriods,
    });
    // console.log("UI refershed at: ", today);
  }

  function upWeek(e) {
    // function to monitor week adjustment on coord TT

    let date = Date.parse(e.target.value);

    initGlobals();

    if (date) {
      setPeriodDefaults();
      date = new Date(date);
      let weekStart = document.querySelector("#weekStart");
      let weekEnd = document.querySelector("#weekEnd");

      let weekToProgram = new Week(date);
      weekStart.value = new Date(weekToProgram.firstDay).toISOString().substring(0, 10);
      weekEnd.value = new Date(weekToProgram.lastDay).toISOString().substring(0, 10);

      // let today = new Date().getTime();
      if (weekToProgram.lastDay < new Date().getTime()) {
        setBorderBColor(weekEnd, colorNotOk);
        setBorderBColor(weekStart, colorNotOk);
        elementDisabled("#sendButton", true);
      } else {
        setBorderBColor(weekEnd, colorOk);
        setBorderBColor(weekStart, colorOk);
        elementDisabled("#sendButton", false);
      }
    } else {
      e.target.style.borderBottom = colorNotOk;
    }
    coordUIRefresh();
  }

  function setPeriodDefaults() {
    let docPeriods = document.querySelectorAll(".coordPeriod");
    let weekToProgram = new Week(
      document.querySelector("#weekStart").value,
      document.querySelector("#weekEnd").value
    );

    for (let i = 0; i <= 6; i++) {
      let counter = 0;
      let a = 0;
      let initIndex = i;
      let adminTime = document.querySelectorAll("input.adTime");

      while (counter < adminTime.length / 2) {
        let startTime = adminTime[a].value;
        let stopTime = adminTime[a + 1].value;

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

        let period = docPeriods[initIndex];
        period.querySelector("input.start").value = start.getTime();
        period.querySelector("input.stop").value = stop.getTime();

        counter++;
        initIndex += 7;
        a += 2;
      }
    }
  }

  async function loadTTForEditing(e) {
    // function to load a previous TT for editing

    // getting periods of coord TT
    let docPeriods = document.querySelectorAll(".coordPeriod");

    // getting TT to display from TT on screen in display TT of coordinator
    let TT = Me.ttOnScreen;
    let week = TT.week;

    // setting the week to program to old TT's programmed week
    document.querySelector("#weekStart").value = new Date(week.firstDay)
      .toISOString()
      .substring(0, 10);
    document.querySelector("#weekEnd").value = new Date(week.lastDay)
      .toISOString()
      .substring(0, 10);
    coordUIRefresh();

    // filling coord TT with required data
    docPeriods.forEach((period, index) => {
      period = period.querySelectorAll("input");
      let ttPeriods = TT.periods;

      period[0].value = ttPeriods[index].courseName;
      period[1].value = ttPeriods[index].lecturerName;
      period[2].value = ttPeriods[index].venue;
      if (ttPeriods[index].state === "J") {
        period[3].checked = true;
      } else {
        period[3].checked = false;
      }
      period[4].value = ttPeriods[index].start;
    });
    canModify(TT);
  }

  function checkInDb(e) {
    // check if inputed value is in db
    // ****** this function will not include levels when full UI is available
    // ****** but levels will still require an event listener to check the selected level
    // ****** the level select section will surely be a select menu.
    // ****** For the exam TT, select section will be a list with check boxes to select levels to program

    elementDisabled("#sendButton", true);
    elementDisabled("#preview", true);

    if (e.target.value.trim() !== "") {
      if (e.target.id === "Levels") {
        console.log(e.target.value);
        useLevelTT(e.target);
      } else if (e.target.list.id === "Courses") {
        let course = findElement("name", e.target.value.trim(), courseDb);
        if (course) {
          setBorderBColor(e.target, colorOk);
        } else {
          setBorderBColor(e.target, colorNotOk);
        }
      } else if (e.target.list.id === "Lecturers") {
        let lecturer = findElement("name", e.target.value.trim(), lecturerDb);
        if (lecturer) {
          setBorderBColor(e.target, colorOk);
        } else {
          setBorderBColor(e.target, colorNotOk);
        }
      } else if (e.target.list.id === "Venues") {
        let venue = findElement("_id", e.target.value.trim(), venueDb);
        if (venue) {
          setBorderBColor(e.target, colorOk);
        } else {
          setBorderBColor(e.target, colorNotOk);
        }
      }
    } else {
      e.target.value = "";
      setBorderBColor(e.target, colorOk);
    }
  }

  function validate() {
    // function to check if all programmed data is valid or not
    venueDbClone = [];
    venueDb.forEach((venue) => venueDbClone.push(JSON.parse(JSON.stringify(venue))));

    initGlobals();
    setPeriodDefaults();

    if (lecturerDb.length > 0) {
      lecturerDb.forEach((lecturer) => lecturer.resetLocalDefaults());
    }

    let valid = "";
    let emptyTable = "";
    let weekToProgram = new Week(new Date(document.querySelector("#weekStart").value));
    console.log(weekToProgram.toDateString());

    // Iterating through coord TT as per day of week and period
    for (let i = 0; i <= sysDefaults.weekDays - 1; i++) {
      let counter = 0;
      let initIndex = i;

      while (counter < sysDefaults.periods.length) {
        let period = docPeriods[initIndex].querySelectorAll("input");
        // console.log("in");

        let start = "";
        let stop = "";
        let courseInput = period[0],
          courseName = courseInput.value.trim(),
          lecturerInput = period[1],
          lecturerName = lecturerInput.value.trim(),
          venueInput = period[2],
          venueValue = venueInput.value.trim(),
          joint = period[3].checked,
          periodState = "A",
          course = findElement("name", courseName, courseDb),
          lecturer = findElement("name", lecturerName, lecturerDb),
          venue = findElement("_id", venueValue, venueDb),
          lecturerId = "",
          courseInfo = "";

        let levelId = document.querySelector("#Levels").value;
        let level = findElement("_id", levelId, levelDb).element;

        start = Number(docPeriods[initIndex].querySelector("input.start").value);
        stop = Number(docPeriods[initIndex].querySelector("input.stop").value);

        if (courseName === "" && lecturerName === "" && venueValue === "") {
          setBorderBColor(courseInput, colorOk);
          setBorderBColor(lecturerInput, colorOk);
          setBorderBColor(venueInput, colorOk);
          periodState = "A"; // N\A for not programmed
        } else {
          if (courseInput.disabled) {
            // console.log(level.TT);
            let oldPeriod = findElement("week", weekToProgram, level.TT).element.periods[initIndex];
            courseName = oldPeriod.courseName;
            courseInfo = oldPeriod.courseInfo;
            lecturerName = oldPeriod.lecturerName;
            levelId = oldPeriod.level;
            venueValue = oldPeriod.venue;
            periodState = oldPeriod.state;
            lecturerId = oldPeriod.lecturerId;
            disabledPeriods[initIndex] = lecturerId;
          } else {
            programmedPeriods.push(initIndex);
            if (joint) {
              periodState = "J"; // J -> joint, A -> Available, N\A -> Not available, P -> Programmed
            } else {
              periodState = "P";
            }

            if (course) {
              course = course.element;
              // console.log(course);
              if (course.timeInWeek === 0) {
                setBorderBColor(courseInput, colorNotOk);
                valid += "false";
              } else {
                course.timeInWeek -= 2;
                if (course.timeInWeek < 0) {
                  course.timeInWeek = 0;
                }
                courseInfo =
                  periodState === "J"
                    ? `[${periodState}] ${courseName} (${course.timeInWeek} / ${course.timeAlloc})`
                    : `${courseName} (${course.timeInWeek} / ${course.timeAlloc})`; //`[${ state }] ${ courseName } (${ course.timeInWeek } / ${ course.timeAlloc })`;
                setBorderBColor(courseInput, colorOk);
                emptyTable += "false";
              }
              // console.log(course);
            } else {
              setBorderBColor(courseInput, colorNotOk);
              valid += "false";
            }

            if (lecturer) {
              emptyTable += "false";
              lecturer = lecturer.element;

              let weekProgrammed = findElement("week", weekToProgram, lecturer.avail.weekAvail);
              if (!weekProgrammed) {
                lecturer.avail.weekAvail.push({ week: weekToProgram, periods: arrayInit("avail") });
                weekProgrammed = {
                  element: lecturer.avail.weekAvail[lecturer.avail.weekAvail.length - 1],
                  index: lecturer.avail.weekAvail.length - 1,
                };
              }
              console.log(lecturer.name, lecturer.avail.weekAvail);

              let availState =
                lecturer.avail.weekAvail[weekProgrammed.index].periods[initIndex].state;
              let availCoordinator =
                lecturer.avail.weekAvail[weekProgrammed.index].periods[initIndex].coordinator;

              if (availCoordinator._id === Me._id || availCoordinator._id === "") {
                if (availState === "A") {
                  // console.log("Available");

                  lecturer.schedule.push(initIndex);
                  lecturerId = lecturer._id;
                  // programmedLect.add(lecturer);
                } else if (availState === "P") {
                  // lecturer programmed for a class with one level

                  lecturer.schedule.push(initIndex);
                  lecturerId = lecturer._id;
                  // programmedLect.add(lecturer);
                  setBorderBColor(lecturerInput, colorOk);
                } else if (availState === "J") {
                  // lecturer programmed for a class with more than one level at same venue

                  if (periodState === "J") {
                    lecturer.schedule.push(initIndex);
                    lecturerId = lecturer._id;
                    // programmedLect.add(lecturer);
                    setBorderBColor(lecturerInput, "green");
                  } else {
                    setBorderBColor(lecturerInput, colorNotOk);
                    console.log(
                      `Can't program ${lecturer.name} for this period because ${
                        lecturer.name
                      }'s avail is (${
                        lecturer.avail.weekAvail[weekProgrammed.index].periods[initIndex].state
                      } ${
                        lecturer.avail.weekAvail[weekProgrammed.index].periods[initIndex]
                          .coordinator.name
                      }) and the state of this period is ${periodState}.`
                    );
                    valid += "false";
                  }
                } else {
                  setBorderBColor(lecturerInput, colorNotOk);
                  console.log(
                    `Can't program ${lecturer.name} for this period because ${
                      lecturer.name
                    }'s avail is (${
                      lecturer.avail.weekAvail[thisWeek.index].periods[initIndex].state
                    } ${
                      lecturer.avail.weekAvail[thisWeek.index].periods[initIndex].coordinator.name
                    }).`
                  );
                  valid += "false";
                }
              } else {
                setBorderBColor(lecturerInput, colorNotOk);
                console.log(
                  `Can't program ${lecturer.name} for this period because ${
                    lecturer.name
                  }'s avail is (${
                    lecturer.avail.weekAvail[weekProgrammed.index].periods[initIndex].state
                  } by ${
                    lecturer.avail.weekAvail[weekProgrammed.index].periods[initIndex].coordinator
                      .name
                  }).`
                );
                valid += "false";
              }
              console.log(lecturer.avail.weekAvail[weekProgrammed.index].periods[initIndex]);
            } else {
              setBorderBColor(lecturerInput, colorNotOk);
              valid += "false";
            }

            if (venue) {
              let level = findElement("_id", document.querySelector("#Levels").value, levelDb)
                .element;
              let venueClone = venueDbClone[venue.index];
              venue = venue.element;
              let weekProgrammed = findElement("week", weekToProgram, venue.programs);

              // let lectOldTT = findElement("week",weekToProgram,lecturer.TT);
              // if(lectOldTT){
              //   lectOldTT.
              // }

              if (!weekProgrammed) {
                setBorderBColor(venueInput, colorOk);

                venue.programs.push(new Program(weekToProgram, arrayInit("event")));
                venueClone.programs.push(new Program(weekToProgram, arrayInit("event")));

                weekProgrammed = {
                  element: venue.programs[venue.programs.length - 1],
                  index: venue.programs.length - 1,
                };

                venue.programs[weekProgrammed.index].events[initIndex] = new Event(
                  courseInfo,
                  start,
                  stop,
                  [{ _id: lecturer._id, name: lecturer.name }],
                  [new Person(level._id, level.students)],
                  venue._id,
                  periodState,
                  { _id: Me._id, name: Me.name }
                );

                venueClone.programs[weekProgrammed.index].events[initIndex] =
                  venue.programs[weekProgrammed.index].events[initIndex];
              } else {
                let event = venue.programs[weekProgrammed.index].events[initIndex];

                if (event.name) {
                  if (
                    (event.name !== courseInfo && event.programmedBy._id !== Me._id) ||
                    event.programmedBy._id !== Me._id
                  ) {
                    setBorderBColor(venueInput, colorNotOk);
                    valid += "false";
                    console.log(
                      `${event.venue} is already programmend by ${
                        event.programmedBy.name
                      } for ${new Date(event.start).toDateString()} to ${new Date(
                        event.stop
                      ).toDateString()}.`
                    );
                  } else {
                    setBorderBColor(venueInput, colorOk);
                    venue.programs[weekProgrammed.index].events[initIndex] = new Event(
                      courseInfo,
                      start,
                      stop,
                      [{ _id: lecturer._id, name: lecturer.name }],
                      [new Person(level._id, level.students)],
                      venue._id,
                      periodState,
                      { _id: Me._id, name: Me.name }
                    );
                    console.log(`Updating ${event.name} at ${event.venue}`);
                  }
                } else {
                  setBorderBColor(venueInput, colorOk);
                  venue.programs[weekProgrammed.index].events[initIndex] = new Event(
                    courseInfo,
                    start,
                    stop,
                    [{ _id: lecturer._id, name: lecturer.name }],
                    [new Person(level._id, level.students)],
                    venue._id,
                    periodState,
                    { _id: Me._id, name: Me.name }
                  );
                  // venueClone.programs[weekProgrammed.index].events[initIndex] =
                  //   venue.programs[weekProgrammed.index].events[initIndex];
                }
              }

              console.log(venue);
              emptyTable += "false";
            } else {
              setBorderBColor(venueInput, colorNotOk);
              valid += "false";
            }
          }
        }

        periods[initIndex] = new Period(
          courseName,
          courseInfo,
          lecturerName,
          levelId,
          venueValue,
          periodState,
          lecturerId,
          start,
          stop
        );

        counter++;
        initIndex += 7;
      }
    }

    // Searching for a false in the validation string or if all periods are empty to determine if data is valid to be sent or not
    var empty = emptyTable.includes("false"); // false --> whole table is empty and true --> not empty
    valid = !valid.includes("false"); // true --> valid and false --> invalid
    valid = !(valid && empty); // ideal case valid = !(true && true)
    elementDisabled("#preview", false); // preview newly programmed TT only after validating
    elementDisabled("#sendButton", valid); // true --> disable send button and false will enable it.
    // elementDisabled("#sendButton", false);
  }

  async function SendTimeTable() {
    // compilation of correctly programmed lecturers' temp_TT

    // setPeriodDefaults();
    let weekToProgram = new Week(new Date(document.querySelector("#weekStart").value));
    let today = new Date().getTime();
    let level = document.querySelector("#Levels").value;
    let updatedLecturers = [];
    let updatedVenues = [];
    let updatedVenuesSet = new Set();
    let docPeriods = document.querySelectorAll(".coordPeriod");

    for (let lecturer of lecturerDb) {
      let oldTT = findElement("week", weekToProgram, lecturer.TT);

      if (oldTT) {
        oldTT = oldTT.element;
        lecturer.temp_TT.periods = [...oldTT.periods];
        // console.log("Old TT loaded for tempTT", oldTT);
      }

      periods.forEach((period, index) => {
        // at every iteration we set start and stop times for lecturers' TT

        lecturer.temp_TT.periods[index].start = Number(
          docPeriods[index].querySelector("input.start").value
        );
        lecturer.temp_TT.periods[index].stop = Number(
          docPeriods[index].querySelector("input.stop").value
        );

        let thisWeek = findElement("week", weekToProgram, lecturer.avail.weekAvail);

        // computation of periods to update and programmed periods

        if (disabledPeriods[index] === lecturer._id) {
          console.log("Unaffected period", lecturer.name, lecturer.temp_TT.periods[index]);
        } else if (lecturer.schedule.includes(index) && programmedPeriods.includes(index)) {
          lecturer.temp_TT.periods[index] = period;
          lecturer.avail.weekAvail[thisWeek.index].periods[index].state = period.state;
          lecturer.avail.weekAvail[thisWeek.index].periods[index].coordinator = {
            _id: Me._id,
            name: Me.name,
          };
          console.log("Programmed period");
        } else if (
          lecturer.temp_TT.periods[index].level === level &&
          !lecturer.schedule.includes(index)
        ) {
          lecturer.temp_TT.periods[index] = period.empty();
          lecturer.avail.weekAvail[thisWeek.index].periods[index].state = "A";
          lecturer.avail.weekAvail[thisWeek.index].periods[index].coordinator = {
            _id: "",
            name: "",
          };
          console.log("Cleared period");
        }
      });

      if (oldTT) {
        if (
          (weekToProgram.firstDay === oldTT.week.firstDay &&
            !equalperiodArray(oldTT.periods, lecturer.temp_TT.periods)) ||
          (lecturer.schedule.length > 0 &&
            !equalperiodArray(oldTT.periods, lecturer.temp_TT.periods))
        ) {
          updatedLecturers.push({
            week: weekToProgram,
            _id: lecturer._id,
            avail: lecturer.avail.weekAvail,
            periods: lecturer.temp_TT.periods,
            uDate: today,
          });
        }
        console.log(lecturer.name);
      } else if (lecturer.schedule.length > 0) {
        updatedLecturers.push({
          week: weekToProgram,
          _id: lecturer._id,
          avail: lecturer.avail.weekAvail,
          periods: lecturer.temp_TT.periods,
          uDate: today,
        });
        console.log(lecturer.name);
      }
    }

    venueDb.forEach((venue, index) => {
      console.log(venue);
      let newProgram = findElement("week", weekToProgram, venue.programs);
      if (newProgram) {
        for (programmedIndex of programmedPeriods) {
          if (venue.programs[newProgram.index].events[programmedIndex]) {
          }
        }

        for (let i = 0; i < venueDb.length - 1; i++) {
          if (
            !isEquivalent(
              venue.programs[newProgram.index].events[i],
              venueDbClone[index].programs[newProgram.index].events[i]
            )
          ) {
            updatedVenues.push(venue);
            // updatedVenuesSet.add(venue._id);
            break;
          }
        }
      }
    });

    if (updatedLecturers.length > 0) {
      //Sending period data and time as JSON
      console.log("Up Lecturers: ", updatedLecturers);
      console.log("Up Venues: ", updatedVenues);
      // await fetch("/coord/TT-upLevelTT", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json;charset=utf-8",
      //   },
      //   body: JSON.stringify({
      //     level,
      //     TT: {
      //       week: weekToProgram,
      //       periods,
      //       uDate: today,
      //     },
      //   }),
      // });

      // await fetch("/coord/TT-upCourses", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json;charset=utf-8",
      //   },
      //   body: JSON.stringify({ level, courseDb }),
      // });

      // await fetch("/coord/TT-upLecturers", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json;charset=utf-8",
      //   },
      //   body: JSON.stringify(updatedLecturers),
      // });

      await fetch("/coord/TT-upVenues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({ week: weekToProgram, venues: updatedVenues }),
      });
      console.log("TT sent!");
    } else {
      console.log("No TT sent!");
    }

    initGlobals();
    await getDbData();
    level = findElement("_id", level, levelDb).element;
    Me.TT = level.TT;

    let ttOfThisWeek = findElement("week", weekToProgram, Me.TT);
    if (ttOfThisWeek) {
      Me.index = ttOfThisWeek.index;
    } else if (Me.TT.length > 0) {
      Me.index = Me.TT.length - 1;
    }
    Me.ttOnScreen = Me.TT[Me.index];
    Me.displayTT(Me.ttOnScreen);

    if (Me.TT.length > 0) {
      elementDisabled("#editPresentTT", false);
    } else {
      elementDisabled("#editPresentTT", true);
    }

    elementDisabled("#sendButton", true);
    elementDisabled("#preview", true);
  }
})();
