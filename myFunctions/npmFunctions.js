const _ = require("lodash");

//models
const schemas = require("../models/schemas");

async function Oath(person) {
  let user;

  if (person._id.slice(0, 1) === "L") {
    person.accountType = "lecturer";
    user = await schemas.Lecturer.findOne({ _id: person._id });
  } else if (person._id.slice(0, 1) === "s") {
    person.accountType = "student";
    user = await schemas.Student.findOne({ _id: person._id });
  } else if (person._id.slice(0, 1) === "c") {
    person.accountType = "coordinator";
    user = await schemas.Coordinator.findOne({ _id: person._id });
  }
  return user;
}

function millisecondsToDays(milliseconds) {
  // function to convert milliseconds into days
  return parseInt(milliseconds / 86400000);
}

function findElement(criteria = "_id", value, iterableCollection = [], lastIndex = false) {
  // function to simulate a database query from an iterable collection
  // ***** Extra module `isEquivalent` *****

  if (iterableCollection.length === 0) {
    console.log("Empty");
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

// function findElement(criteria = "_id", value, source) {
//   return _.find(source, (o) => o[criteria] === value);
// }

// npm version but incomplete
// function findElement(criteria = "_id", value, source) {
//   return _.find(source, (o) => {
//     return o[criteria] === value;
//   });
// }

// Other stuffs
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

module.exports = {
  Oath,
  millisecondsToDays,
  findElement,
  isEquivalent,
};
