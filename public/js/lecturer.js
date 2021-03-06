import { fx, AvailTT, DisplayTT, User, Week, color } from "./classes.js";

export class Lecturer extends User {
  constructor(_id, name) {
    super(_id, name);
    this.avail = {};
    this.availHolder = {};
    this.tempTT = { week: new Week(), periods: [], uDate: "" };
    this.schedule = [];
    this.accountType = "Lecturer";
  }

  main = async () => {
    await this.userInit();
    this.connectToSocket();
    this.setUserEventListener();
    this.setLectecuerEventListeners();
  };

  /**
   * method to initialize lecturer variables
   */
  userInit = async () => {
    this.sysDefaults = await this.getSysDefaults();

    this.ownTT = new DisplayTT(
      "myTT",
      "#displayTTContainer",
      this.accountType,
      "",
      this.sysDefaults
    );

    this.ownTT.show();

    await this.getTT();

    this.availTT = new AvailTT("myAvail", "#availTTContainer", this.sysDefaults);
    this.availTT.show();
    await this.getMyInfo();
  };

  setLectecuerEventListeners = () => {
    // Adding event listeners to avail TT
    document
      .querySelector(`#${this.availTT.nav_id}`)
      .querySelector("#saveAvailOnScreen")
      .addEventListener("click", this.saveAvailTT);
  };

  /**
   * method to reset lecturer's attributes when he's being programmed by a coordinator
   */
  resetTempTT = () => {
    this.schedule = [];
    this.avail = JSON.parse(JSON.stringify(this.availHolder));
    this.tempTT = {
      week: new Week(),
      periods: fx.arrayInit("period"),
      uDate: "",
    };
  };

  /**
   * method to load lecturer's default availability to availTT
   * @param {*} avail
   */
  loadAvail = (avail) => {
    this.availTT.periods.forEach((period, index) => {
      if (avail[index] && avail[index].state === "A") {
        period.checked = true;
      } else {
        period.checked = false;
      }
    });
  };

  /**
   * method to save availability in db
   */
  saveAvailTT = async () => {
    let avail = this.availTT.compile();
    let res = await fx.postFetch("/lecturer/saveAvail", {
      _id: this._id,
      accountType: this.accountType,
      avail,
    });

    if (res.error) {
      this.showSnackBar(`Availability could not be set because of ${res.error}`);
    } else {
      this.loadAvail(res.data);
      this.showSnackBar(`Availability set with success`);
    }
    // console.log(res);
  };
}
