// document.querySelector("#signIn").addEventListener("click", firstDoThis);

// async function firstDoThis(e) {
//   e.preventDefault();
//   let logInForm = document.forms.logInForm;
//   let accountType;

//   if (logInForm._id.value.slice(0, 1) === "L") {
//     accountType = "lecturer";
//   } else if (logInForm._id.value.slice(0, 1) === "s") {
//     accountType = "student";
//   } else if (logInForm._id.value.slice(0, 1) === "c") {
//     accountType = "coordinator";
//   }

//   console.log(accountType);

//   let req = fetch("/logIn", {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json;charset=utf-8'
//     },
//     body: JSON.stringify({
//       _id: logInForm._id.value,
//       platform: "web",
//       accountType
//     })
//   });
// }