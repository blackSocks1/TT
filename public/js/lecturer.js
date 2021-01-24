import { Lecturer, elementDisabled, hostLink } from "./functions.js";

// creating user
(async () => {
  // getting user data and constructing user
  let props = document.querySelectorAll("output.myData");
  let Me = new Lecturer(props[0].value, props[1].value);

  // generating display TT
  await Me.generateDisplayTT("#displayTTContainer");
  await Me.generateAvailTT("#AvailTTContainer");
  Me.connectToSocket(hostLink);
  // console.log(Me);

  // Adding event listeners to display TT
  document
    .querySelectorAll("td.period")
    .forEach((cell) => cell.addEventListener("click", Me.showPeriod));
  // document.querySelector('#send').addEventListener('click', sendMessage);
  document.querySelector("#reset").addEventListener("click", Me.resetAvailTT);
  document.querySelector("#getTT").addEventListener("click", Me.getTT);

  // fetch lecturer TTs
  await Me.getTT();

  // Making socket connection
  // let socket;
  // try {
  //   socket = io.connect(hostLink);
  //   Me.socket = socket;
  //   Me.connected = true;
  // } catch (err) {
  //   console.log(err);
  // } finally {
  //   if (Me.connected) {
  //     Me.socket.emit("book-me", Me);
  //   }
  // }

  // //Listen for events
  // socket.on("book-me-res", (res) => {
  //   let accountInfo = document.querySelector(".accInfo");
  //   accountInfo.innerHTML += `<strong>${res.message}</strong>`;
  // });

  // socket.on("message", (msg) => {
  //   document.querySelector("#messageIn").innerHTML += `${msg.sender}: ${msg.message}<br>`;
  // });
})();
