import { DisplayTT, User, color } from "./classes.js";

export class Student extends User {
  // user class from interface management
  constructor(_id, name) {
    super(_id, name);
    this.accountType = "Student";
    this.canTakeAtt = false;
  }

  main = async () => {
    await this.getMyInfo();
    await this.userInit();
    this.connectToSocket();
    this.setUserEventListener();
    // await this.addContact("skksdqcnu-SWE-L2-LOG", "shb bgurgus");
  };
}

// getting user data and constructing student
let props = document.querySelectorAll("output.myData");
let Me = new Student(props[0].value, props[1].value);
Me.main();
