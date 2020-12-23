import { User, sendMessage, elementDisabled, iucTemplate, host, port } from "./functions.js";

// const host = 'localhost'; // '192.168.1.100'; //
// const port = 45000;

// creating user
let props = document.querySelectorAll('output.myData');
let Me = new User(props[0].value, props[1].value, props[2].value, props[3].value, props[4].value, "#left", "#right");
iucTemplate('#timetable', Me).then(()=>{

    Me.getTT();


    document.querySelector('#send').addEventListener('click', sendMessage);
    document.querySelector("#getTT").addEventListener('click', Me.getTT);
    
    
    // TT nav buttons
    document.querySelector('#left').addEventListener('click', Me.nextTT);
    document.querySelector('#right').addEventListener('click', Me.nextTT);
});

let socket;

try {
    socket = io.connect(`http://${host}:${port}`);
    Me.connected = true;
} catch (err) {
    console.log(err);
} finally {
    if (Me.connected) {
        socket.emit('book-me', Me);
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