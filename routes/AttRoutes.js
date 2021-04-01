let Router = require("express").Router();
let AttController = require("../controllers/AttController");

Router.post("/get-students", AttController.getStudents);

Router.post("/save", AttController.saveAtt);

Router.post("/get", AttController.getAtt);

Router.post("/getCustomClassList", AttController.getCustomClassList);

Router.post("/getGroupDetails", AttController.getGroupDetails);

module.exports = Router;
