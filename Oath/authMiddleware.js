const jwt = require("jsonwebtoken");
const checkAuth = (req, res, next) => {
  const token = req.cookie.jwt;

  if (token) {
    jwt.verify(token, "school management", (err, decodedToken) => {
      if (err) {
        res.redirect("/login");
      } else {
        next();
      }
    });
  } else {
    res.redirect("/login");
  }
};

module.exports = checkAuth;
