const schemas = require("../models/schemas");
const bcrypt = require("bcryptjs");

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt();
  return await bcrypt.hash(password, salt);
};

const authUser = async (user) => {
  let dbUser = await getUserCollection(user);
  return await bcrypt.compare(user.password, dbUser.password);
};

async function getUserCollection(person) {
  let collection = "Student";

  if (person._id[0] === "L" || person._id[0] === "l") {
    person.accountType = collection = "Lecturer";
  } else if (person._id[0] === "s") {
    person.accountType = collection = "Student";
  } else if (person._id[0] === "c") {
    person.accountType = collection = "Coordinator";
  } else if (person._id[0] === "a") {
    person.accountType = collection = "Admin";
  }

  return await schemas[collection].findOne({ _id: person._id });
}

const handleErrors = (err) => {
  // console.log(err.message, err.code);
};

function findElement(attribute = "_id", value, iterableCollection = []) {
  // function to simulate a database query from an iterable collection
  // ***** Extra module `isEquivalent` *****

  if (iterableCollection.length === 0) {
    return undefined;
  }

  if (attribute === "week") {
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
      if (element[attribute] === value) {
        return { element, index };
      }
      index++;
    }
  }
  return undefined;
}

// function findElement(attribute = "_id", value, source) {
//   return _.find(source, (o) => o[attribute] === value);
// }

// npm version but incomplete
// function findElement(attribute = "_id", value, source) {
//   return _.find(source, (o) => {
//     return o[attribute] === value;
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

module.exports = { authUser, getUserCollection, handleErrors, findElement, isEquivalent };
