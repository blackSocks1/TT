import { fx, Program, Person, Event } from "./classes.js";

onmessage = function (e) {
  let request = e.data;
  let response = { task: request.task, data: {} };

  if (request.task == "validate timetable") {
    let {
      coord,
      lecturerDb,
      courseDb,
      venueDb,
      TTperiods,
      TTperiodStartStops,
      TTprogrammedPeriods,
      TTdisabledPeriods,
      group,
      weekToProgram,
    } = { ...request.data };

    let modPeriods = [],
      courseDbClone = fx.clone(courseDb),
      oldgroupTT = fx.findElement("week", weekToProgram, group.TT), // get old version of TT for weekToProgram if any
      lecturersToCheck = [],
      lecturerSet = new Set(),
      venuesToCheck = [],
      venueSet = new Set(),
      TTupdatedCourses = [],
      TTupdatedLecturers = [],
      TTupdatedVenues = [],
      TTdateMod = new Date().getTime();

    // selecting courses to update
    courseDb.forEach((course, index) => {
      let clonedCourse = courseDbClone[index],
        refWeek = fx.findElement("week", weekToProgram, course.time.week);

      if (refWeek) {
        if (clonedCourse.time.week[refWeek.index]) {
          if (
            course.time.week[refWeek.index].schedule.length !=
            clonedCourse.time.week[refWeek.index].schedule.length
          ) {
            TTupdatedCourses.push(course);
          } else {
            for (let i = 0; i < course.time.week[refWeek.index].schedule.length; i++) {
              if (
                !fx.isEquivalent(
                  course.time.week[refWeek.index].schedule[i],
                  clonedCourse.time.week[refWeek.index].schedule[i]
                )
              ) {
                TTupdatedCourses.push(course);
                break;
              }
            }
          }
        } else {
          TTupdatedCourses.push(course);
        }
      }
    });

    TTupdatedCourses.forEach((course) => {
      let refWeek = fx.findElement("week", weekToProgram, course.time.week);

      course.time.left =
        course.time.week[refWeek.index].schedule[
          course.time.week[refWeek.index].schedule.length - 1
        ].hoursLeft;
      course.time.week[refWeek.index].timeEnd = course.time.left;
    });
    // console.log(TTupdatedCourses);

    // if old TT, get all lecturers and venues programmed in that TT
    if (oldgroupTT) {
      oldgroupTT = oldgroupTT.element;
      oldgroupTT.periods.forEach((period, index) => {
        if (period.courseName != TTperiods[index].courseName) {
          modPeriods.push(index);
        }

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
    lecturerDb.forEach((lecturer) => {
      if (lecturer.schedule.length > 0) {
        lecturerSet.add(lecturer._id);
      }
    });

    // getting all venues programmed on current screen into a set to avoid duplicates
    venueDb.forEach((venue) => {
      if (venue.schedule.length > 0) {
        venueSet.add(venue._id);
      }
    });

    // console.log(lecturerSet);

    lecturerSet.forEach((lecturer_id) => {
      lecturersToCheck.push(fx.findElement("_id", lecturer_id, lecturerDb).element);
    });

    venueSet.forEach((venue_id) => {
      venuesToCheck.push(fx.findElement("_id", venue_id, venueDb).element);
    });

    // console.table(lecturersToCheck);
    // console.table(venuesToCheck);

    // processing of lecturers' data
    lecturersToCheck.forEach((lecturer) => {
      let oldTT = fx.findElement("week", weekToProgram, lecturer.TT);

      if (oldTT) {
        oldTT = oldTT.element;
        lecturer.tempTT.periods = [...oldTT.periods];
      }

      // console.log(lecturer.name, lecturer.schedule);
      TTperiods.forEach((period, index) => {
        // at every iteration we set start and stop times for lecturers' TT
        if (!oldTT) {
          lecturer.tempTT.periods[index] = fx.emptyPeriod(period);
        }

        lecturer.tempTT.periods[index].start = TTperiodStartStops[index].start;
        lecturer.tempTT.periods[index].stop = TTperiodStartStops[index].stop;

        let weekProgrammed = fx.findElement("week", weekToProgram, lecturer.avail.weekAvail);

        // computation of periods to update and programmed periods
        if (TTdisabledPeriods[index]) {
          // if (disabledPeriods[index].lecturer_id === lecturer._id) {
          //   console.log("Unaffected period", lecturer.name, lecturer.tempTT.periods[index]);
          // }
        } else if (lecturer.schedule.includes(index) && TTprogrammedPeriods.includes(index)) {
          lecturer.tempTT.periods[index] = period;
          lecturer.avail.weekAvail[weekProgrammed.index].periods[index].state = period.state;
          lecturer.avail.weekAvail[weekProgrammed.index].periods[index].coordinator = {
            _id: coord._id,
            name: coord.name,
          };
          // console.log(lecturer.name, "Programmed period", index);
        } else if (
          lecturer.tempTT.periods[index].group_id === group._id &&
          !lecturer.schedule.includes(index)
        ) {
          lecturer.tempTT.periods[index] = fx.emptyPeriod(period);
          lecturer.avail.weekAvail[weekProgrammed.index].periods[index].state = "A";
          lecturer.avail.weekAvail[weekProgrammed.index].periods[index].coordinator = {
            _id: "",
            name: "",
          };
        }
      });

      if (
        (oldTT && !fx.equalperiodArray(oldTT.periods, lecturer.tempTT.periods)) ||
        lecturer.schedule.length > 0
      ) {
        TTupdatedLecturers.push({
          week: weekToProgram,
          _id: lecturer._id,
          avail: lecturer.avail.weekAvail,
          periods: lecturer.tempTT.periods,
          uDate: TTdateMod,
          accountType: lecturer.accountType,
          _Ref:
            lecturer.accountType == "Coordinator"
              ? lecturer.coordinator_Ref
              : lecturer.lecturer_Ref,
        });
        // console.log(lecturer.name);
      }
    });
    // console.log(clearedPeriods, TTprogrammedPeriods);

    venueSet.clear();

    // processing of venues' data
    venuesToCheck.forEach((venue) => {
      // console.log(venue);

      let weekProgrammed = fx.findElement("week", weekToProgram, venue.programs);

      if (!weekProgrammed) {
        // fx.setBorderBColor(venueInput, color.Ok);

        venue.tempProgram = new Program(weekToProgram, fx.arrayInit("event")); // ***** surely to be deleted
        venue.programs.push(new Program(weekToProgram, fx.arrayInit("event")));

        TTperiodStartStops.forEach((period, index) => {
          venue.programs[venue.programs.length - 1].events[index].start = period.start;
          venue.programs[venue.programs.length - 1].events[index].stop = period.stop;
        });

        weekProgrammed = {
          element: venue.programs[venue.programs.length - 1],
          index: venue.programs.length - 1,
        };
      }

      TTperiods.forEach((period, index) => {
        // let venueInput = program_TT.periods[index].querySelectorAll("input[type='text']")[2];

        let oldEvent = fx.findElement(
          "start",
          period.start,
          venue.programs[weekProgrammed.index].events
        );

        oldEvent = oldEvent ? oldEvent.element : null;

        if (TTdisabledPeriods[index]) {
          // if (disabledPeriods[index].venue_id === venue._id) {
          //   console.log("Unaffected period", venue._id, venue.programs[weekProgrammed.index].events[index]);
          // }
        } else if (venue.schedule.includes(index) && TTprogrammedPeriods.includes(index)) {
          // console.log(venue._id);

          if (oldEvent.name === period.name) {
            console.log("Same event");
            let alreadyProgrammed = fx.findElement("_id", group._id, oldEvent.element.participants);

            // append group if not already programmed
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

              // fx.setPopupText(
              //   venueInput,
              //   `Trying to program ${venue._id} for ${period.courseName} on ${new Date(
              //     period.start
              //   ).toISOString()} but it clashes with ${errorEvent.name} which was programmed by ${
              //     errorEvent.programmedBy.name
              //   }. Sure you want to override `
              // );
            }

            venue.programs[weekProgrammed.index].events[index] = new Event(
              period.courseName,
              period.start,
              period.stop,
              [{ _id: period.lecturer_id, name: period.lecturerName }],
              [new Person(group._id, group.students)],
              venue._id,
              period.periodState,
              { _id: coord._id, name: coord.name },
              new Date().getTime()
            );
            venueSet.add(venue._id);
          }
        } else if (oldEvent.venue_id === venue._id && !venue.schedule.includes(index)) {
          // fx.setPopupText(venueInput, `Are you really sure you want to cancel ${oldEvent.name}?`);
          // fx.setBorderBColor(venueInput, color.Warning);

          if (venue.programs[weekProgrammed.index].events[index].name === "") {
            venue.programs[weekProgrammed.index].events[index] = fx.emptyPeriod(oldEvent);
            modPeriods.push(index);
          }
          venueSet.add(venue._id);
        }
      });
    });

    // getting all venues to update
    venueSet.forEach((venue_id) => {
      TTupdatedVenues.push(fx.findElement("_id", venue_id, venuesToCheck).element);
    });

    console.log(TTupdatedCourses);

    response.data = fx.clone({ TTupdatedCourses, TTupdatedLecturers, TTupdatedVenues, modPeriods });
  }

  postMessage(response);
};
