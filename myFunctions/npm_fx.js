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

// function extendSchema (Schema, definition, options){
//     return new mongoose.Schema(
//         Object.assign({},Schema.obj,definition),
//         options
//         );
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

module.exports = { findElement, isEquivalent };
