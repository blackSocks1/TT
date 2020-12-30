import {
  Lecturer,
  sendMessage,
  elementDisabled,
  iucTemplate,
  host,
  port
} from "./functions.js";

// creating user
(async () => {

  // getting user data and constructing user
  let props = document.querySelectorAll('output.myData');
  let Me = new Lecturer(props[0].value, props[1].value, props[2].value, props[3].value, "#left", "#right");

  // generating display TT
  await iucTemplate('#TT', Me);

  // Adding event listeners to display TT
  document.querySelectorAll("td.display").forEach(cell => cell.addEventListener("click", Me.showCell));
  document.querySelector('#send').addEventListener('click', sendMessage);
  document.querySelector('#reset').addEventListener('click', Me.resetAvailTT);
  document.querySelector("#getTT").addEventListener('click', Me.getTT);

  // fetch lecturer TTs
  await Me.getTT();

  // TT nav buttons
  document.querySelector('#left').addEventListener('click', Me.nextTT);
  document.querySelector('#right').addEventListener('click', Me.nextTT);

  // Making socket connection
  let socket;
  try {
    socket = io.connect(`https://${host}:${port}`);
    Me.socket = socket;
    Me.connected = true;
  } catch (err) {
    console.log(err);
  } finally {
    if (Me.connected) {
      Me.socket.emit('book-me', Me);
    }
  }

  //Listen for events
  socket.on('book-me-res', (res) => {
    let accountInfo = document.querySelector('.accInfo');
    accountInfo.innerHTML += `<strong>${res.message}</strong>`;
  });

  socket.on('message', (msg) => {
    document.querySelector('#messageIn').innerHTML += `${msg.sender}: ${msg.message}<br>`;
  });
})();