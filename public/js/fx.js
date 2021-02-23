import { Period, Avail, Event, color } from "./classes.js";

export async function postFetch(url, body = {}, contentType = "application/json;charset=utf-8") {
  return await (
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
      },
      body: JSON.stringify(body),
    })
  ).json();
}

export function equalPeriods(periodA, periodB) {
  // function to check if two periods are the same (NOT IDENTICAL) in terms of courseName, courseInfo, group, lecturerName, lecturer_id, venue, state

  if (periodA.courseName !== periodB.courseName) {
    return false;
  }

  if (periodA.courseInfo !== periodB.courseInfo) {
    return false;
  }

  if (periodA.group !== periodB.group) {
    return false;
  }

  if (periodA.lecturerName !== periodB.lecturerName) {
    return false;
  }

  if (periodA.lecturer_id !== periodB.lecturer_id) {
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
    // if (target.style.borderBottom == `2px solid ${color}`) {
    //   target.style.borderBottom = `2px solid ${color}`;
    // }
  }
}

export function setPopupText(element, value, show = false) {
  let popup = element.parentNode.querySelector("span.popuptext");

  if (value) {
    popup.innerText = value;
    if (show) {
      popup.classList.add("show");
    }
  } else {
    popup.innerText = "";
    popup.classList.remove("show");
  }

  return popup;
}

export function findElement(attribute = "_id", value, iterableCollection = []) {
  /**
   * function to simulate a database query from an iterable collection
   */
  // ***** Extra module `isEquivalent` *****

  // console.log(iterableCollection);

  if (iterableCollection.length === 0) {
    return undefined;
  }

  if (attribute === "week") {
    let index = 0;
    for (let element of iterableCollection) {
      if (element.week.firstDay === value.firstDay) {
        return { element, index };
      }
      index++;
    }
  } else {
    let index = 0;
    for (let element of iterableCollection) {
      // if(typeof element[attribute] === 'object'){
      //   if(isEquivalent(element[attribute], value)) {
      //     return { element, index };
      //   }
      // }else{
      if (element[attribute] === value) {
        return { element, index };
      }
      // }

      index++;
    }
  }
  return undefined;
}

export function getDuration(peroid) {
  let startTime = new Date(
    "",
    "",
    "",
    new Date(peroid.start).getHours(),
    new Date(peroid.start).getMinutes(),
    0,
    0
  ).getTime();

  let stopTime = new Date(
    "",
    "",
    "",
    new Date(peroid.stop).getHours(),
    new Date(peroid.stop).getMinutes(),
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
}

export function sumOf(attribute, iterableCollection = []) {
  let sum = 0;
  for (let object of iterableCollection) {
    sum += object[attribute] ? Number(object[attribute]) : 0;
  }
  return sum;
}

export function arrayInit(type = "period") {
  // function to reset a collection of periods
  // this function maybe modified in days ahead to create a default TT depending on all defaults of the system
  // hence maybe it'll become an async function

  type = type.toLowerCase();

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
