import { Lecturer } from "./Lecturer.js";

// getting user data and constructing lecturer
let props = document.querySelectorAll("output.myData");
let Me = new Lecturer(props[0].value, props[1].value);
Me.main();
