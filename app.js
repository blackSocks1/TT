const mongoose = require("mongoose");
const _ = require("lodash");
const express = require("express");
const cors = require("cors");
const https = require("https");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

// environment variables
require("dotenv").config();

// routes
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const coordinatorRoutes = require("./routes/coordinatorRoutes");
const lecturerRoutes = require("./routes/lecturerRoutes");
const socketController = require("./controllers/socketController");

const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

let chat = io.of("/").on("connection", (socket) => {
  socketController.handleChat(chat, socket);
});

(async () => {
  // Creating https server
  // const options = {
  //   key: fs.readFileSync(path.join(__dirname, "cert", "key.pem")),
  //   cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem")),
  // };

  // const server = https.createServer(options, app);
  // mongoose
  //   .connect("mongodb://localhost/TimeTable", {
  //     useNewUrlParser: true,
  //     useUnifiedTopology: true,
  //     useFindAndModify: false,
  //   })
  //   .then(() => {
  //     console.log("Connected to db");
  //   })
  //   .catch("error", (error) => console.log("\nError at ", error));

  // server.listen(process.env.PORT || 45000, process.env.HOST || "localhost", () =>
  //   console.log(
  //     `HTTPS server listening to requests on ${process.env.HOST} via port ${process.env.PORT}`
  //   )
  // );

  try {
    await mongoose.connect("mongodb://localhost/TimeTable", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    console.log("Connected to db");

    // creating http server
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

  // render engine
  app.set("view engine", "ejs");

  // middleware

  app.use(cors());

  app.use(
    express.urlencoded({
      extended: true,
    })
  );

  app.use(express.json());
  app.use(cookieParser());

  // routes

  app.get("/setCookie", (req, res) => {
    res.cookie("isEmploye", true);
    res.end();
  });

  app.get("/", (req, res) => {
    res.render("home", { title: "Home" });
  });

  // admin routes
  app.use("/admin", adminRoutes);

  // coordinator routes
  app.use("/coord", coordinatorRoutes);

  // lecturer routes
  app.use("/lecturer", lecturerRoutes);

  // userRoutes
  app.use("/user", userRoutes);

  // auth routes
  app.use(authRoutes);

  app.use((req, res) => {
    res.status(404).render("404");
  });

  app.use(morgan("dev"));
})();
