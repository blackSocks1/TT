import {
  fx,
  DisplayTT,
  AvailTT,
  ProgramTT,
  Period,
  color,
  Program,
  Person,
  Event,
  Week,
} from "./classes.js";

import { Lecturer } from "./Lecturer.js";

export class Coordinator extends Lecturer {
  /**
   * class to model a specialty coordinator
   * @param {String} _id _id of coordinator
   */
  constructor(_id) {
    super(_id);
    this.TT_Defaults; // = [{ week: {}, periods: [] }]
    this.TTdrafts = [];
    this.accountType = "Coordinator";
  }

  main = async () => {
    await this.lecturerInit();
    await this.coordInit();

    this.connectToSocket();
    await this.getDbData();
    this.loadVenues();

    await this.setUserEventListener();
    this.setLectecuerEventListeners();
    this.setCoordEventListeners();

    // console.log(this.Att);
  };

  /**
   * method to initialize coordinator variables
   */
  coordInit = async () => {
    this.courseDb = [];
    this.lecturerDb = [];
    this.venueDb = [];
    this.venueDbClone = [];
    this.groupDb = [];

    // Initialization of other globals
    // ****** groupSelect is a very important global var for validation in several functions on this interface
    this.groupSelect = document.querySelector("#Groups");

    document.querySelector("#separateCampus").addEventListener("change", this.loadVenues);
    this.groupSelect.addEventListener("change", this.useGroup_TT);

    // TT to program groups
    this.program_TT = new ProgramTT("coordTT", "coordinatorTT", this.sysDefaults);

    // TT to see group TT from student perspective
    this.groupDisplay_TT = new DisplayTT(
      "group",
      "coordDisplayTT",
      this.accountType,
      "coordDisplay",
      this.sysDefaults
    );

    this.program_TT.show();

    setInterval(() => {
      this.program_TT.refresh({ group_id: this.groupSelect.value, groupDb: this.groupDb });
    }, 1000);

    this.groupDisplay_TT.show("studProgScreen", "coordDisplay");
  };

  /**
   * method for adding event listeners to elements prior to Coordinator class
   */
  setCoordEventListeners = async () => {
    this.program_TT.validateBtn.addEventListener("click", this.validate_TT);

    this.program_TT.sendBtn.addEventListener("click", this.send_TT);

    this.program_TT.periods.forEach((period) =>
      period
        .querySelectorAll("input[type='text']")
        .forEach((inputField) => inputField.addEventListener("input", this.checkInDb))
    );

    this.groupDisplay_TT.editButton.addEventListener("click", this.loadTTForEditing);
  };

  /**
   * method to get lecturers, courses and venues from db so as to program TT
   * @param {String} group_id _id of group to load and display group data
   */
  getDbData = async (group_id = "") => {
    let dataLecturers = await fx.postFetch("/coord/get-lecturers", { _id: this.coordinator_Ref });

    let dataVenues = await fx.postFetch("/coord/get-venues", { _id: this._id });

    let dataGroups = await fx.postFetch("/coord/get-groups", { _id: this.coordinator_Ref });

    this.lecturerDb = Array.from(dataLecturers).sort((a, b) => {
      // return (a.name === b.name) ? 0 : a.name < b.name ? -1 : 1;
      if (a.name === b.name) {
        return 0;
      } else {
        return a.name < b.name ? -1 : 1;
      }
    });

    // console.log(this.lecturerDb);

    let newLects = [];
    let preLects = "";
    // console.log(this.lecturerDb);

    for (let lecturer of this.lecturerDb) {
      preLects += `<option value="${lecturer.name}">`;
      let newLecturer;

      if (lecturer.accountType === "Lecturer") {
        newLecturer = new Lecturer(lecturer._id);
        newLecturer.lecturer_Ref = lecturer.lecturer_Ref;
      } else {
        newLecturer = new Coordinator(lecturer._id);
        newLecturer.coordinator_Ref = lecturer.coordinator_Ref;
      }

      newLecturer.TT = lecturer.TT;
      newLecturer.name = lecturer.name;
      newLecturer.accountType = lecturer.accountType;
      newLecturer.avail = lecturer.avail;

      newLecturer.availHolder = newLecturer.avail
        ? JSON.parse(JSON.stringify(newLecturer.avail))
        : {};
      newLecturer.accountType = lecturer.accountType;
      newLects.push(newLecturer);
    }

    let lecList = document.querySelector("#Lecturers");
    lecList.innerHTML = "";
    lecList.innerHTML = preLects;
    this.lecturerDb = [...newLects];
    // console.log(this.lecturerDb);

    this.venueDb = Array.from(dataVenues).sort((a, b) => {
      if (a._id === b._id) {
        return 0;
      } else {
        return a._id < b._id ? -1 : 1;
      }
    });

    this.venueDbClone = JSON.parse(JSON.stringify(this.venueDb));
    // console.log(this.venueDb);

    this.groupDb = Array.from(dataGroups).sort((a, b) => {
      if (a._id === b._id) {
        return 0;
      } else {
        return a._id < b._id ? -1 : 1;
      }
    });

    let selectLength = this.groupSelect.length;
    if (selectLength !== this.groupDb.length) {
      let preGroup = "";
      this.groupDb.forEach((group, index) => {
        if (group_id == "") {
          preGroup +=
            index === 0
              ? `<option value="${group._id}" selected>${group._id}</option>`
              : `<option value="${group._id}">${group._id}</option>`;
        } else {
          preGroup +=
            group_id == group._id
              ? `<option value="${group._id}" selected>${group._id}</option>`
              : `<option value="${group._id}">${group._id}</option>`;
        }
      });

      let groupList = this.groupSelect;
      groupList.innerHTML = "";
      groupList.innerHTML = preGroup;
      this.useGroup_TT(groupList);
    }
    // console.log(this.groupDb);

    fx.elementDisabled("#sendGroupTT", true);
    // console.log("Getting Db data fine!");
  };

  /**
   * - method to check if the value of an input field is in coordinator database
   * - useful for validation
   * @param {*} e
   */
  checkInDb = (e) => {
    // check if inputed value is in db

    fx.elementDisabled("#sendGroupTT", true);

    if (e.target.value.trim() !== "") {
      let bbColor;
      let message;

      if (e.target.list.id === "Courses") {
        let course = fx.findElement("name", e.target.value.trim(), this.courseDb);

        if (course) {
          course = course.element;

          if (course.time.left == 0) {
            bbColor = color.Warning;
          } else {
            bbColor = color.Ok;
          }

          message = `${course.name} has ${course.time.left} left.`;
        } else {
          bbColor = color.Danger;
          message = `${e.target.value.trim()} not found in course list!`;
        }

        fx.setBorderBColor(e.target, bbColor);
        fx.setPopupText(e.target, message, false);
      } else if (e.target.list.id === "Lecturers") {
        let lecturer = fx.findElement("name", e.target.value.trim(), this.lecturerDb);

        bbColor = lecturer ? color.Ok : color.Danger;
        message = lecturer ? "" : `${e.target.value.trim()} not found in Lectuer list!`;

        fx.setBorderBColor(e.target, bbColor);
        fx.setPopupText(e.target, message, true);
      } else if (e.target.list.id === "Venues") {
        let venue = fx.findElement("_id", e.target.value.trim(), this.venueDb);

        bbColor = venue ? color.Ok : color.Danger;
        message = venue ? "" : `${e.target.value.trim()} not found in venue list!`;

        fx.setBorderBColor(e.target, bbColor);
        fx.setPopupText(e.target, message, true);
      }
    } else {
      e.target.value = "";
      fx.setBorderBColor(e.target, color.Ok);
      fx.setPopupText(e.target, "");
    }
  };

  /**
   * method to load venues in respective input fields' datalists
   */
  loadVenues = () => {
    if (this.groupDb.length > 0) {
      let separateCampus = document.querySelector("#separateCampus").checked;

      let group = fx.findElement("_id", this.groupSelect.value, this.groupDb).element;
      let preVenues = "";

      if (separateCampus) {
        this.venueDb.forEach((venue) => {
          if (venue.campus === group.campus) {
            preVenues += `<option value="${venue._id}">`;
          }
        });
      } else {
        this.venueDb.forEach((venue) => {
          preVenues += `<option value="${venue._id}">`;
        });
      }

      let venueList = document.querySelector("#Venues");
      venueList.innerHTML = "";
      venueList.innerHTML = preVenues;
    }

    this.program_TT.setWeek();
    // console.log("New venues loaded.");
  };

  useGroup_TT = () => {
    // ****** For the exam TT, select section will be a list with check boxes to select groups to program

    let group = fx.findElement("_id", this.groupSelect.value, this.groupDb).element;
    let courseList = document.querySelector("#Courses");

    let weekToProgram = new Week(new Date(this.program_TT.weekStart.value));

    this.courseDb = fx.findElement("_id", group._id, this.groupDb).element.courses;
    this.courseDbClone = JSON.parse(JSON.stringify(this.courseDb));

    this.courseDb = Array.from(this.courseDb).sort((a, b) => {
      if (a.name === b.name) {
        return 0;
      } else {
        return a.name < b.name ? -1 : 1;
      }
    });

    this.loadVenues();

    let preList = "";
    this.courseDb.forEach((course) => {
      course.time.left = course.time.left; // use the last index of this course.timeLeft for current week for consistency upon changes
      if (course.time.left > 0) {
        preList += `<option value="${course.name}">`;
      }
    });

    courseList.innerHTML = "";
    courseList.innerHTML = preList;

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
  };

  /**
   * method to validate coordiantor's programTT
   */
  validate_TT = () => {
    // function to check if all programmed data is valid or not

    // let groupSelect = this.groupSelect;

    this.TTperiods = [];
    this.TTupdatedCourses = [];
    this.TTupdatedLecturers = [];
    this.TTupdatedVenues = [];
    this.TTprogrammedPeriods = [];
    this.TTdisabledPeriods = [];
    this.TTdateMod = new Date().getTime();

    // resetting data for lecturers and venues at each validation for consistency

    document.querySelectorAll("span.popuptext").forEach((popup) => {
      popup.innerText = "";
      popup.classList.remove("show");
    });

    this.lecturerDb.forEach((lecturer) => lecturer.resetTempTT());
    this.venueDb = fx.clone(this.venueDbClone);
    this.courseDb = fx.clone(this.courseDbClone);

    let valid = "";
    let emptyTable = "";
    let weekToProgram = new Week(new Date(this.program_TT.weekStart.value));
    let group = fx.findElement("_id", this.groupSelect.value, this.groupDb).element;
    let docPeriods = this.program_TT.periods;
    let group_id = "";

    // Iterating through coord TT as per day of week and period
    for (let i = 0; i <= this.sysDefaults.weekDays.length - 1; i++) {
      let counter = 0;
      let initIndex = i;

      while (counter < this.sysDefaults.periods.length) {
        let period = docPeriods[initIndex].querySelectorAll("input");

        let start = Number(docPeriods[initIndex].querySelector("input.start").value);
        let stop = Number(docPeriods[initIndex].querySelector("input.stop").value);
        let courseInput = period[0],
          courseName = courseInput.value.trim(),
          lecturerInput = period[1],
          lecturerName = lecturerInput.value.trim(),
          venueInput = period[2],
          venue_id = venueInput.value.trim(),
          periodState = "A",
          lecturer_id = "",
          courseInfo = "";

        if (courseName === "" && lecturerName === "" && venue_id === "") {
          fx.setBorderBColor(courseInput, color.Ok);
          fx.setBorderBColor(lecturerInput, color.Ok);
          fx.setBorderBColor(venueInput, color.Ok);
          group_id = "";
          periodState = "A"; // N\A for not programmed
        } else {
          group_id = group._id;

          if (courseInput.disabled) {
            let oldPeriod = fx.findElement("week", weekToProgram, group.TT).element.periods[
              initIndex
            ];

            courseName = oldPeriod.courseName;
            courseInfo = oldPeriod.courseInfo;
            lecturerName = oldPeriod.lecturerName;
            venue_id = oldPeriod.venue_id;
            periodState = oldPeriod.state;
            lecturer_id = oldPeriod.lecturer_id;
            this.TTdisabledPeriods[initIndex] = { courseInfo, lecturer_id, venue_id };
          } else {
            this.TTprogrammedPeriods.push(initIndex);

            let joint = period[3].checked,
              course = fx.findElement("name", courseName, this.courseDb),
              lecturer = fx.findElement("name", lecturerName, this.lecturerDb),
              venue = fx.findElement("_id", venue_id, this.venueDb);

            if (joint) {
              periodState = "J"; // J -> joint, A -> Available, N\A -> Not available, P -> Programmed
            } else {
              periodState = "P";
            }

            if (course) {
              course = course.element;

              if (course.time.left == 0) {
                fx.setBorderBColor(courseInput, color.Warning);
                fx.setPopupText(courseInput, `${course.name} has 0 hours left!`);
                // valid += "false";
              } else {
                let refWeek = fx.findElement("week", weekToProgram, course.time.week);

                if (!refWeek) {
                  if (course.time.week.length == 2) {
                    course.time.week.shift();
                  }

                  course.time.week.push({
                    week: weekToProgram,
                    schedule: [],
                    timeStart: 0,
                    timeEnd: 0,
                  });

                  refWeek = {
                    element: course.time.week[course.time.week - 1],
                    index: course.time.week.length - 1,
                  };
                }

                let hoursLeft = course.time.left;

                if (course.time.week[refWeek.index].schedule.length == 0) {
                  course.time.week[refWeek.index].timeStart = hoursLeft;
                }

                if (
                  initIndex != 0 &&
                  course.time.week[refWeek.index].schedule[
                    course.time.week[refWeek.index].schedule.length - 1
                  ]
                ) {
                  hoursLeft =
                    course.time.week[refWeek.index].schedule[
                      course.time.week[refWeek.index].schedule.length - 1
                    ].hoursLeft;

                  hoursLeft -= 2; // ****** actually supposed to be lastTime - periodDuration
                } else {
                  hoursLeft = course.time.allocated - 2;
                }

                let schedule = {
                  index: initIndex,
                  dateStart: start,
                  hoursLeft,
                };
                course.time.week[refWeek.index].schedule.push(schedule);

                courseInfo =
                  periodState === "J"
                    ? `[${periodState}] ${courseName} (${schedule.hoursLeft} / ${course.time.allocated})`
                    : `${courseName} (${schedule.hoursLeft} / ${course.time.allocated})`;

                fx.setBorderBColor(courseInput, color.Ok);
                fx.setPopupText(courseInput, courseInfo);
                emptyTable += "false";
              }
              // console.log(course);
            } else {
              fx.setBorderBColor(courseInput, color.Danger);
              fx.setPopupText(courseInput, `${courseName} was not found!`);
              valid += "false";
            }

            if (lecturer) {
              emptyTable += "false";
              lecturer = lecturer.element;

              let weekProgrammed = fx.findElement("week", weekToProgram, lecturer.avail.weekAvail);
              if (!weekProgrammed) {
                let avail = { week: weekToProgram, periods: [] };

                avail.periods =
                  lecturer.avail.defaultAvail.length == 0
                    ? fx.arrayInit("avail")
                    : lecturer.avail.defaultAvail;

                lecturer.avail.weekAvail.push(avail);

                weekProgrammed = {
                  element: lecturer.avail.weekAvail[lecturer.avail.weekAvail.length - 1],
                  index: lecturer.avail.weekAvail.length - 1,
                };
              }
              // console.log(lecturer.name, lecturer.avail.weekAvail);

              let availState =
                lecturer.avail.weekAvail[weekProgrammed.index].periods[initIndex].state;
              let availCoordinator =
                lecturer.avail.weekAvail[weekProgrammed.index].periods[initIndex].coordinator;

              if (availCoordinator._id === this._id || availCoordinator._id === "") {
                if (periodState === "J") {
                  // lecturer programmed for a class with more than one group at same venue

                  if (availState === "A") {
                    fx.setBorderBColor(lecturerInput, color.Ok);

                    console.log(
                      `Programming ${lecturer._id} for a joint class. ${this.groupSelect.value} is the first group you're programming for this class.`
                    );
                    lecturer.schedule.push(initIndex);
                  } else if (availState === "J") {
                    fx.setBorderBColor(lecturerInput, color.Ok);

                    lecturer.schedule.push(initIndex);
                    lecturer_id = lecturer._id;

                    // console.log(
                    //   `Programming ${lecturer._id} for a joint class. The other groups programmed for this class are: `,
                    //   lecturer.TT[weekProgrammed.index].periods[initIndex]
                    // );
                  } else {
                    fx.setBorderBColor(lecturerInput, color.Danger);
                    fx.setPopupText(
                      lecturerInput,
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
                  if (availState === "A") {
                    // console.log("Available");

                    lecturer.schedule.push(initIndex);
                    lecturer_id = lecturer._id;
                  } else if (availState === "P" || availState === "J") {
                    // lecturer programmed for a class with one group

                    lecturer.schedule.push(initIndex);
                    lecturer_id = lecturer._id;

                    let oldPeriod = fx.findElement("week", weekToProgram, lecturer.TT).element;
                    fx.setPopupText(
                      lecturerInput,
                      `Are you sure you want to override: 
                    ${oldPeriod.periods[initIndex].courseInfo}
                    ?`
                    );

                    fx.setBorderBColor(lecturerInput, color.Warning);
                  } else {
                    fx.setBorderBColor(lecturerInput, color.Danger);

                    fx.setPopupText(
                      lecturerInput,
                      `Can't program ${lecturer.name} for this period because ${
                        lecturer.name
                      }'s avail is (${
                        lecturer.avail.weekAvail[weekProgrammed.index].periods[initIndex].state
                      } ${
                        lecturer.avail.weekAvail[weekProgrammed.index].periods[initIndex]
                          .coordinator.name
                      }).`
                    );

                    valid += "false";
                  }
                }
              } else {
                fx.setBorderBColor(lecturerInput, color.Danger);

                fx.setPopupText(
                  lecturerInput,
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
              // console.log(lecturer.avail.weekAvail[weekProgrammed.index].periods[initIndex]);
            } else {
              fx.setBorderBColor(lecturerInput, color.Danger);
              fx.setPopupText(lecturerInput, `${lecturerName} was not found!`);
              valid += "false";
            }

            if (venue) {
              emptyTable += "false";
              venue = venue.element;

              let weekProgrammed = fx.findElement("week", weekToProgram, venue.programs);

              if (!weekProgrammed) {
                fx.setBorderBColor(venueInput, color.Ok);

                venue.tempProgram = new Program(weekToProgram, fx.arrayInit("event")); // ***** surely to be deleted
                venue.programs.push(new Program(weekToProgram, fx.arrayInit("event")));

                docPeriods.forEach((docPeriod, index) => {
                  venue.programs[venue.programs.length - 1].events[index].start = Number(
                    docPeriod.querySelector("input.start").value
                  );
                  venue.programs[venue.programs.length - 1].events[index].stop = Number(
                    docPeriod.querySelector("input.stop").value
                  );
                });

                weekProgrammed = {
                  element: venue.programs[venue.programs.length - 1],
                  index: venue.programs.length - 1,
                };
              }

              let availState = venue.programs[weekProgrammed.index].events[initIndex].venueState;
              let programmedBy =
                venue.programs[weekProgrammed.index].events[initIndex].programmedBy;

              if (programmedBy._id === this._id || programmedBy._id === "") {
                if (periodState === "J") {
                  if (availState === "A") {
                    // or participants.length === 0
                    fx.setBorderBColor(venueInput, color.Ok);
                    // console.log(
                    //   `Programming ${venue._id} for a joint class. ${
                    //     this.groupSelect.value
                    //   } is the first group you're programming for this class.`
                    // );
                    venue.schedule.push(initIndex);
                  } else if (availState === "J") {
                    // or participants.length > 0
                    fx.setBorderBColor(venueInput, color.Ok);
                    // console.log(
                    //   `Programming ${venue._id} for a joint class. The other groups programmed for this class are: `,
                    //   venue.programs[weekProgrammed.index].events[initIndex].participants
                    // );
                    venue.schedule.push(initIndex);
                  } else {
                    fx.setBorderBColor(venueInput, color.Danger);

                    fx.setPopupText(
                      venueInput,
                      `Can't program ${venue._id} because of: "${
                        venue.programs[weekProgrammed.index].events[initIndex].name
                      }" programmed by "${
                        venue.programs[weekProgrammed.index].events[initIndex].programmedBy.name
                      }"`
                    );

                    // console.log(
                    //   `Can't program ${venue._id} because of: `,
                    //   venue.programs[weekProgrammed.index].events[initIndex]
                    // );
                    valid += "false";
                  }
                } else {
                  if (availState === "A") {
                    fx.setBorderBColor(venueInput, color.Ok);
                    // console.log(
                    //   `Programming ${venue._id}`,
                    //   venue.programs[weekProgrammed.index].events[initIndex]
                    // );
                    venue.schedule.push(initIndex);
                  } else if (availState === "P" || availState === "J") {
                    fx.setBorderBColor(venueInput, color.Warning);
                    fx.setPopupText(
                      venueInput,
                      `Beware! You're trying to program ${venue._id} but this venue has program: "${
                        venue.programs[weekProgrammed.index].events[initIndex].name
                      }" programmed by "${
                        venue.programs[weekProgrammed.index].events[initIndex].programmedBy.name
                      }"`
                    );
                    venue.schedule.push(initIndex);
                  } else {
                    fx.setBorderBColor(venueInput, color.Warning);

                    fx.setPopupText(
                      venueInput,
                      `Can't program ${venue._id} because of: "${
                        venue.programs[weekProgrammed.index].events[initIndex].name
                      }" programmed by "${
                        venue.programs[weekProgrammed.index].events[initIndex].programmedBy.name
                      }"`
                    );
                    valid += "false";
                  }
                }
              } else {
                fx.setBorderBColor(venueInput, color.Danger);

                fx.setPopupText(
                  venueInput,
                  `Can't program ${venue._id} because of: "${
                    venue.programs[weekProgrammed.index].events[initIndex].name
                  }" programmed by "${
                    venue.programs[weekProgrammed.index].events[initIndex].programmedBy.name
                  }"`
                );

                valid += "false";
              }
            } else {
              fx.setBorderBColor(venueInput, color.Danger);
              fx.setPopupText(venueInput, `${venue_id} was not found!`);
              valid += "false";
            }
          }
        }

        this.TTperiods[initIndex] = new Period(
          courseName,
          courseInfo,
          lecturerName,
          group_id,
          venue_id,
          periodState,
          lecturer_id,
          start,
          stop
        );

        counter++;
        initIndex += 7;
      }
    }

    let clearedPeriods = [];
    let oldgroupTT = fx.findElement("week", weekToProgram, group.TT); // get old version of TT for weekToProgram if any
    let lecturersToCheck = [];
    let lecturerSet = new Set();
    let venuesToCheck = [];
    let venueSet = new Set();

    if (emptyTable.includes("false")) {
      // selecting courses to update
      this.courseDb.forEach((course, index) => {
        let cloneCourse = this.courseDbClone[index];
        let refWeek = fx.findElement("week", weekToProgram, course.time.week);

        if (refWeek) {
          if (cloneCourse.time.week[refWeek.index]) {
            if (
              course.time.week[refWeek.index].schedule.length !=
              cloneCourse.time.week[refWeek.index].schedule.length
            ) {
              this.TTupdatedCourses.push(course);
            } else {
              for (let i = 0; i < course.time.week[refWeek.index].schedule.length; i++) {
                if (
                  !fx.isEquivalent(
                    course.time.week[refWeek.index].schedule[i],
                    cloneCourse.time.week[refWeek.index].schedule[i]
                  )
                ) {
                  this.TTupdatedCourses.push(course);
                  break;
                }
              }
            }
          } else {
            this.TTupdatedCourses.push(course);
          }
        }
      });

      this.TTupdatedCourses.forEach((course) => {
        let refWeek = fx.findElement("week", weekToProgram, course.time.week);

        course.time.left =
          course.time.week[refWeek.index].schedule[
            course.time.week[refWeek.index].schedule.length - 1
          ].hoursLeft;
        course.time.week[refWeek.index].timeEnd = course.time.left;
      });
      // console.log(this.TTupdatedCourses);

      // if old TT, get all lecturers and venues programmed in that TT
      if (oldgroupTT) {
        oldgroupTT = oldgroupTT.element;
        oldgroupTT.periods.forEach((period) => {
          if (period.lecturer_id) {
            lecturerSet.add(period.lecturer_id);
          }

          if (period.venue_id) {
            venueSet.add(period.venue_id);
          }
        });
        // console.log(`Old TT of ${group._id}`, oldgroupTT);
      }
      // console.log(lecturerSet);

      // getting all lecturers programmed on current screen into a set to avoid duplicates
      this.lecturerDb.forEach((lecturer) => {
        if (lecturer.schedule.length > 0) {
          lecturerSet.add(lecturer._id);
        }
      });

      // getting all venues programmed on current screen into a set to avoid duplicates
      this.venueDb.forEach((venue) => {
        if (venue.schedule.length > 0) {
          venueSet.add(venue._id);
        }
      });

      // console.log(lecturerSet);

      lecturerSet.forEach((lecturer_id) => {
        lecturersToCheck.push(fx.findElement("_id", lecturer_id, this.lecturerDb).element);
      });

      venueSet.forEach((venue_id) => {
        venuesToCheck.push(fx.findElement("_id", venue_id, this.venueDb).element);
      });

      // console.table(lecturersToCheck);
      // console.table(venuesToCheck);

      // processing of lecturers' data
      lecturersToCheck.forEach((lecturer) => {
        // let lecturerInput = this.program_TT.periods[index].querySelectorAll(
        //   "input[type='text']"
        // )[1];

        let oldTT = fx.findElement("week", weekToProgram, lecturer.TT);

        if (oldTT) {
          oldTT = oldTT.element;
          lecturer.tempTT.periods = [...oldTT.periods];
        }

        // console.log(lecturer.name, lecturer.schedule);
        this.TTperiods.forEach((period, index) => {
          // at every iteration we set start and stop times for lecturers' TT
          if (!oldTT) {
            lecturer.tempTT.periods[index] = period.empty();
          }

          lecturer.tempTT.periods[index].start = Number(
            docPeriods[index].querySelector("input.start").value
          );
          lecturer.tempTT.periods[index].stop = Number(
            docPeriods[index].querySelector("input.stop").value
          );

          let weekProgrammed = fx.findElement("week", weekToProgram, lecturer.avail.weekAvail);

          // computation of periods to update and programmed periods
          if (this.TTdisabledPeriods[index]) {
            // if (disabledPeriods[index].lecturer_id === lecturer._id) {
            //   console.log("Unaffected period", lecturer.name, lecturer.tempTT.periods[index]);
            // }
          } else if (
            lecturer.schedule.includes(index) &&
            this.TTprogrammedPeriods.includes(index)
          ) {
            lecturer.tempTT.periods[index] = period;
            lecturer.avail.weekAvail[weekProgrammed.index].periods[index].state = period.state;
            lecturer.avail.weekAvail[weekProgrammed.index].periods[index].coordinator = {
              _id: this._id,
              name: this.name,
            };
            // console.log(lecturer.name, "Programmed period", index);
          } else if (
            lecturer.tempTT.periods[index].group_id === group._id &&
            !lecturer.schedule.includes(index)
          ) {
            lecturer.tempTT.periods[index] = period.empty();
            lecturer.avail.weekAvail[weekProgrammed.index].periods[index].state = "A";
            lecturer.avail.weekAvail[weekProgrammed.index].periods[index].coordinator = {
              _id: "",
              name: "",
            };
            // console.log(lecturer.name, "Cleared period", index);
            clearedPeriods.push(index);
          }
        });

        if (
          (oldTT && !fx.equalperiodArray(oldTT.periods, lecturer.tempTT.periods)) ||
          lecturer.schedule.length > 0
        ) {
          this.TTupdatedLecturers.push({
            week: weekToProgram,
            _id: lecturer._id,
            avail: lecturer.avail.weekAvail,
            periods: lecturer.tempTT.periods,
            uDate: this.TTdateMod,
            accountType: lecturer.accountType,
            _Ref:
              lecturer.accountType == "Coordinator"
                ? lecturer.coordinator_Ref
                : lecturer.lecturer_Ref,
          });
          // console.log(lecturer.name);
        }
      });
      // console.log(clearedPeriods, this.TTprogrammedPeriods);

      venueSet.clear();

      // processing of venues' data
      venuesToCheck.forEach((venue) => {
        // console.log(venue);

        let weekProgrammed = fx.findElement("week", weekToProgram, venue.programs);

        if (!weekProgrammed) {
          // fx.setBorderBColor(venueInput, color.Ok);

          venue.tempProgram = new Program(weekToProgram, fx.arrayInit("event")); // ***** surely to be deleted
          venue.programs.push(new Program(weekToProgram, fx.arrayInit("event")));

          docPeriods.forEach((docPeriod, index) => {
            venue.programs[venue.programs.length - 1].events[index].start = Number(
              docPeriod.querySelector("input.start").value
            );
            venue.programs[venue.programs.length - 1].events[index].stop = Number(
              docPeriod.querySelector("input.stop").value
            );
          });

          weekProgrammed = {
            element: venue.programs[venue.programs.length - 1],
            index: venue.programs.length - 1,
          };
        }

        this.TTperiods.forEach((period, index) => {
          let venueInput = this.program_TT.periods[index].querySelectorAll("input[type='text']")[2];

          let oldEvent = fx.findElement(
            "start",
            period.start,
            venue.programs[weekProgrammed.index].events
          );

          oldEvent = oldEvent ? oldEvent.element : null;

          if (this.TTdisabledPeriods[index]) {
            // if (disabledPeriods[index].venue_id === venue._id) {
            //   console.log("Unaffected period", venue._id, venue.programs[weekProgrammed.index].events[index]);
            // }
          } else if (venue.schedule.includes(index) && this.TTprogrammedPeriods.includes(index)) {
            // console.log(venue._id);

            if (oldEvent.name === period.name) {
              console.log("Same event");
              let alreadyProgrammed = fx.findElement(
                "_id",
                group._id,
                oldEvent.element.participants
              );

              // append this group if not already programmed
              if (alreadyProgrammed) {
                console.log(
                  `${group._id} has already been programmed for ${venue._id}`,
                  oldEvent.element
                );
              } else {
                oldEvent.element.participants.push(new Person(group._id, group.students));
                venue.programs[weekProgrammed.index].events[oldEvent.index] = oldEvent.element;
                console.log(
                  `Just programmed ${group._id} in ${venue._id} for  ${
                    venue.programs[weekProgrammed.index].events[oldEvent.index].name
                  }`,
                  oldEvent.element
                );
                venueSet.add(venue._id);
              }
              // console.log(venue._id, "Just programmed and event was free", event);
            } else {
              // console.log("Diff event");

              if (venue.programs[weekProgrammed.index].events[index].name === "") {
                // if oldEvent name is "", it means we're the first to program it
                // console.log("Programming an Initially empty event.");
              } else {
                // if they have different names; there might be a problem
                let errorEvent = venue.programs[weekProgrammed.index].events[index];

                fx.setPopupText(
                  venueInput,
                  `Trying to program ${venue._id} for ${period.courseName} on ${new Date(
                    period.start
                  ).toISOString()} but it clashes with ${errorEvent.name} which was programmed by ${
                    errorEvent.programmedBy.name
                  }. Sure you want to override this?`
                );
              }

              venue.programs[weekProgrammed.index].events[index] = new Event(
                period.courseName,
                period.start,
                period.stop,
                [{ _id: period.lecturer_id, name: period.lecturerName }],
                [new Person(group._id, group.students)],
                venue._id,
                period.periodState,
                { _id: this._id, name: this.name },
                new Date().getTime()
              );
              venueSet.add(venue._id);
            }
          } else if (oldEvent.venue_id === venue._id && !venue.schedule.includes(index)) {
            // fx.setPopupText(venueInput, `Are you really sure you want to cancel ${oldEvent.name}?`);
            // fx.setBorderBColor(venueInput, color.Warning);

            if (venue.programs[weekProgrammed.index].events[index].name === "") {
              venue.programs[weekProgrammed.index].events[index] = oldEvent.empty();
              clearedPeriods.push(index);
            }
            venueSet.add(venue._id);
          }
        });
      });

      // getting all venues to update
      venueSet.forEach((venue_id) => {
        this.TTupdatedVenues.push(fx.findElement("_id", venue_id, venuesToCheck).element);
      });
    }

    // Searching for a false in the validation string or if all periods are empty to determine if data is valid to be sent or not
    let empty = emptyTable.includes("false") || clearedPeriods.length > 0; // false --> whole table is empty and true --> not empty

    valid = !valid.includes("false"); // !true --> valid and !false --> invalid
    valid = !(valid && empty); // ideal case valid = !(true && true)
    // preview newly programmed TT only after validating
    fx.elementDisabled("#sendGroupTT", valid); // true --> disable send button and false will enable it.
    // fx.elementDisabled("#sendGroupTT", false);
  };

  /**
   * method to send programmed TTs
   */
  send_TT = async () => {
    if (this.TTupdatedLecturers.length > 0) {
      //Sending period data and time as JSON

      let weekToProgram = new Week(new Date(this.program_TT.weekStart.value));
      let group = fx.findElement("_id", this.groupSelect.value, this.groupDb).element;

      console.log(weekToProgram.toDateString(), group._id);
      console.log("Up Venues: ", this.TTupdatedVenues);
      console.log("Up Lecturers: ", this.TTupdatedLecturers);

      await fx.postFetch("/coord/upGroupTT", {
        group_id: group._id,
        TT: {
          week: weekToProgram,
          periods: this.TTperiods,
          uDate: this.TTdateMod,
        },
      });

      this.TTupdatedCourses.forEach(async (course) => {
        await fx.postFetch("/coord/TT-upCourse", { course });
      });

      await fx.postFetch("/coord/TT-upLecturers", {
        coord_id: this._id,
        lecturers: this.TTupdatedLecturers,
      });

      this.TTupdatedVenues.forEach(async (venue) => {
        await fx.postFetch("/coord/TT-upVenues", {
          week: weekToProgram,
          venue,
        });
      });

      this.groupToUpdate = this.groupSelect.value;

      this.reloadDbData();

      console.log("TT sent!");
    } else {
      console.log("No TT sent!");
    }
  };

  /**
   * method to cause lecturers, students concerned and all coordiantors online to fetch
   * their data since it may have been updated
   */
  reloadDbData = () => {
    this.socket.emit("/coordReload", {
      _id: this._id,
      name: this.name,
      group_id: this.groupToUpdate,
      lecturers: this.TTupdatedLecturers,
    });
  };

  getMyDefaults = async () => {
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

  getCustomClassList = async (group_id = "", columns = "") => {
    return await fx.postFetch("/Att/getCustomClassList", { group_id, columns });
  };

  setMyDefaults = async () => {
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

  getLastSeen = async () => {
    let lastSeen = await fetch("/coord/getLastSeen", {
      method: "post",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        _id: this._id,
      }),
    });
    // console.log("Last seen: ", new Date(this.lastSeen));
    return await lastSeen.json();
  };

  setLastSeen = async () => {
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

  loadTTForEditing = () => {
    let TT = this.groupDisplay_TT.ttOnScreen;
    let week = new Week(TT.week.firstDay);

    // setting the week to program to old TT's programmed week
    document.querySelector("#weekStart").value = week.toSubString().firstDay;
    document.querySelector("#weekEnd").value = week.toSubString().lastDay;

    // filling coord TT with required data
    this.program_TT.periods.forEach((period, index) => {
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

    this.program_TT.refresh();
  };
}

let Me = new Coordinator(document.querySelectorAll("output.myData")[0].value);
Me.main();
// Me.getCustomClassList("SWE-L1-LOG", "_id name level").then((res) => console.log(res));
