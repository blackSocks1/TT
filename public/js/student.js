import { DisplayTT, User, color } from "./classes.js";

export class Student extends User {
  // user class from interface management
  constructor(_id, name, group_id) {
    super(_id, name);
    this.group_id = group_id;
    this.accountType = "Student";
  }

  main = async () => {
    await this.userInit();
    this.connectToSocket();
    this.setUserEventListener();
    // await this.addContact("skksdqcnu-SWE-L2-LOG", "shb bgurgus");
  };

  userInit = async () => {
    this.sysDefaults = await this.getSysDefaults();

    this.ownTT = new DisplayTT(
      "self",
      "#displayTTContainer",
      this.accountType,
      "",
      this.sysDefaults
    );

    this.ownTT.show();

    await this.getMyInfo();
  };
}

// getting user data and constructing student
let props = document.querySelectorAll("output.myData");
let Me = new Student(props[0].value, props[1].value, props[2].value);
Me.main();
