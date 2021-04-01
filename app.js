// environment variables
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
// const _ = require("lodash");
const express = require("express");
const session = require("express-session"); // check sense
const passport = require("passport");
const flash = require("express-flash");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
// const fs = require("fs");
// const path = require("path");

// routes
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const coordinatorRoutes = require("./routes/coordinatorRoutes");
const lecturerRoutes = require("./routes/lecturerRoutes");
const AttRoutes = require("./routes/AttRoutes");
const socketController = require("./controllers/socketController");

// Options for https server
// const options = {
//   key: fs.readFileSync(path.join(__dirname, "cert", "key.pem")),
//   cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem")),
// };

const app = express();
const http = require("http").Server(app);
// const https = require("https").createServer(options, app);
const io = require("socket.io")(http);

(async () => {
  try {
    let connection = mongoose.connection;

    connection.once("open", async () => {
      connection.db.listCollections().toArray((err, allColNames) => {
        if (err) {
          console.log(err);
        } else {
          allColNames.forEach((col_name) => {
            if (col_name.name == "onlineusers") {
              connection.dropCollection(
                "onlineusers",
                console.log("onlineusers was dropped with success!")
              );
            }
            // console.log(col_name.name);
          });
        }
      });
    });

    await mongoose.connect("mongodb://localhost/TimeTable", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    console.log("Connected to db");

    await http.listen(process.env.PORT || 45000, process.env.HOST || "localhost");
    console.log(
      `HTTP server listening to requests on ${process.env.HOST} via port ${process.env.PORT}`
    );
  } catch (error) {
    console.log("\nError at ", error);
  }

  // connection to db
  // const dbURI = `mongodb+srv://${db.Uname}:${db.pass}@cluster0.xevnc.mongodb.net/${db.name}?retryWrites=true&w=majority`;
  // mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true }).then((result) => {
  //     console.log('Connected to db');
  //     const port = 45000;
  //     const server = app.listen(port, () => {
  //         console.log(`Server listening to requests on port ${port}`);
  //     });
  // }).catch((err) => {
  //     console.log(err);
  // });

  //static files
  app.use(express.static("public"));

  app.use(flash());
  app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));

  app.use(passport.initialize());
  app.use(passport.session());

  // render engine
  app.set("view engine", "ejs");

  // middlewares
  app.use(cors());

  app.use(
    express.urlencoded({
      extended: true,
    })
  );

  app.use(express.json());
  app.use(cookieParser());

  let chat = io.of("/").on("connection", (socket) => {
    socketController.handleChat(chat, socket);
  });

  // routes
  app.get("/", (req, res) => {
    res.render("landing page", { title: "Login Page", login: true });
  });

  // admin routes
  app.use("/admin", adminRoutes);

  // coordinator routes
  app.use("/coord", coordinatorRoutes);

  // lecturer routes
  app.use("/lecturer", lecturerRoutes);

  // user routes
  app.use("/user", userRoutes);

  // Att routes
  app.use("/Att", AttRoutes);

  // auth routes
  app.use(authRoutes);

  app.use((req, res) => {
    res.status(404).render("404");
  });

  app.use(morgan("dev"));
})();
