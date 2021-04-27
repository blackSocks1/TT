document.querySelector("#loginTogglePass").addEventListener("click", (e) => {
  let passInput = e.target.parentNode.querySelector("input");

  if (passInput.type == "password") {
    passInput.type = "text";
    e.target.classList.remove("fa-eye");
    e.target.classList.add("fa-eye-slash");
  } else {
    passInput.type = "password";
    e.target.classList.remove("fa-eye-slash");
    e.target.classList.add("fa-eye");
  }
});

document.querySelector("#logInForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  let logInForm = document.querySelector("#logInForm");
  let errorDiv = document.querySelector("div#logInError");
  errorDiv.innerHTML = "";

  let logInResponse = await (
    await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        _id: logInForm.querySelector("#login_id").value,
        password: logInForm.querySelector("#login_password").value,
      }),
    })
  ).json();

  if (logInResponse.error) {
    errorDiv.innerHTML = `<p>${logInResponse.error}</p>`;
  } else if (logInResponse.accountType) {
    logInForm.action = "/userDashboard";
    logInForm.method = "POST";
    logInForm.submit();
  }
});
