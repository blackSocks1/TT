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
    await this.lecturerInit();
    this.connectToSocket();
    this.setUserEventListener();
    this.setLectecuerEventListeners();
  };

  /**
   * method to initialize lecturer variables
   */
  lecturerInit = async () => {
    this.sysDefaults = await this.getSysDefaults();
    // console.log(this.sysDefaults);

    this.availTT = new AvailTT("myAvail", "#availTTContainer", this.sysDefaults);
    this.availTT.show();

    this.ownTT = new DisplayTT(
      "myTT",
      "displayTTContainer",
      this.accountType,
      "",
      this.sysDefaults
    );

    this.ownTT.show();

    await this.getMyInfo();
    await this.getTT();
  };

  setLectecuerEventListeners = () => {
    // Adding event listeners to avail TT
    this.availTT.saveBtn.addEventListener("click", this.saveAvailTT);
    this.availTT.untickAll.addEventListener("click", () => {
      this.availTT.multipleticks(false);
      this.showSnackBar("Not available throughout");
    });

    this.availTT.tickAll.addEventListener("click", () => {
      this.availTT.multipleticks(true);
      this.showSnackBar("Now available throughout");
    });
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
    // console.log(this.avail);
  };

  /**
   * method to save availability in db
   */
  saveAvailTT = async () => {
    this.avail.defaultAvail = this.availTT.compile();

    this.avail.weekAvail.forEach((weekAvail) => {
      weekAvail.periods.forEach((availPeriod, index) => {
        availPeriod.state =
          availPeriod.state == "N\\A" && this.avail.defaultAvail[index].state == "A"
            ? "A"
            : availPeriod.state;
      });
    });

    let res = await fx.dataCom.post("/lecturer/saveAvail", {
      _id: this._id,
      accountType: this.accountType,
      avail: this.avail,
    });

    if (res.error) {
      this.showSnackBar(`Availability could not be set because of ${res.error}`);
    } else {
      this.loadAvail(res.data.defaultAvail);
      this.socket.emit("/availUpdated", { _id: this._id, avail: this.avail.defaultAvail });
      this.showSnackBar(`Availability updated with success`);
    }
    // console.log(res);
  };
}
