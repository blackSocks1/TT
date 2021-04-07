function navigate() {
  document
    .querySelectorAll(".ownNav")
    .forEach((nav) =>
      nav.querySelectorAll("a.navLink").forEach((link) => link.addEventListener("click", showTab))
    );

  let navLinks = document.querySelectorAll("a.navLink");

  // default selected links at runtime
  navLinks.forEach((link) => {
    if (link.classList.contains("active")) {
      link.click();
    }
  });

  function showTab(e) {
    let navLinks = e.target.parentNode.querySelectorAll(
      `a[data-navset=${e.target.dataset.navset}]`
    );
    let navTabs = document.querySelectorAll(`div[data-navset=${e.target.dataset.navset}]`);

    // default selected links at runtime
    navLinks.forEach((link) => {
      if (link.id == "normalTT-link") {
        link.click();
      } else if (link.id == "Students-link") {
        link.click();
      }
    });

    navLinks.forEach((link) => {
      if (link.id == e.target.id) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    navTabs.forEach((tab) => {
      if (tab.id == e.target.dataset.ref) {
        tab.style.display = "block";
      } else {
        tab.style.display = "none";
      }
    });
  }
}

document.querySelectorAll(".myAccordion").forEach((accBtn) =>
  accBtn.addEventListener("click", (e) => {
    e.target.classList.toggle("AccActive");
    var panel = e.target.nextElementSibling;
    if (panel) {
      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    }
  })
);

document.querySelectorAll("button.inAcc").forEach((btn) =>
  btn.addEventListener("click", (e) => {
    alert(e.target);
  })
);

navigate();
