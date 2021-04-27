const users = require("../models/users");

module.exports.handleChat = async (endPoint, socket) => {
  // handling disconnections

  socket.on("disconnect", async () => {
    let user = await users.OnlineUser.findOneAndDelete({ network_id: socket.id });

    if (user) {
      endPoint.emit("/online", { message: `${user.name} is now offline` });
      console.log(`${user.name} is now offline`);
    }
  });

  socket.on("/book-me", async (user) => {
    let onlineUser = await users.OnlineUser.findOne({ online_id: user._id, name: user.name });
    let message;

    if (onlineUser) {
      message = `${onlineUser.name}'s network_id changed from ${onlineUser.network_id} to ${socket.id}`;
      onlineUser.network_id = socket.id;
    } else {
      onlineUser = new users.OnlineUser({
        online_id: user._id,
        accountType: user.accountType,
        network_id: socket.id,
        name: user.name,
        group_id: user.group_id,
      });

      message = `${onlineUser.name} is online @${socket.id}`;
    }

    await onlineUser.save();
    console.log(message);

    endPoint.emit("/online", { user_id: onlineUser.online_id, message });
  });

  socket.on("/coordReload", async (updater) => {
    // telling all coords online to fetch new data from db before continue programming
    users.OnlineUser.find({ accountType: "Coordinator" }).then((allCoordsOnline) => {
      if (allCoordsOnline.length > 0) {
        allCoordsOnline.forEach((coord) => {
          endPoint.to(coord.network_id).emit("/reloadDbData", updater);
          if (coord.online_id == updater._id) {
            endPoint.to(coord.network_id).emit("/newTT", updater);
          }
        });
      }
    });

    // telling all students concerned and online to fetch new TT
    users.OnlineUser.find({ accountType: "Student", group_id: updater.group_id }).then(
      (groupStudents) => {
        if (groupStudents.length > 0) {
          groupStudents.forEach((student) => {
            endPoint.to(student.network_id).emit("/newTT", updater);
          });
        }
      }
    );

    // telling all lecturers concerned and online to fetch new TT
    updater.lecturers.forEach((lecturer) => {
      users.OnlineUser.findOne({ online_id: lecturer._id }).then((lecturer) => {
        if (lecturer) {
          endPoint.to(lecturer.network_id).emit("/newTT", updater);
        }
      });
    });

    // console.log(
    //   `Coordinator ${updater.name} with _id: ${updater._id} says all other coords should reload their data because he just updated the TT of ${updater.group_id}`
    // );
  });

  socket.on("/availUpdated", async (lecturer) => {
    let updater = await users.OnlineUser.find({ online_id: lecturer._id });
    if (updater && updater?.accountType == "Coordinator") {
      endPoint.to(updater.network_id).emit("/updateAvail", lecturer);
    } else {
      users.OnlineUser.find({ accountType: "Coordinator" }).then((allCoordsOnline) => {
        allCoordsOnline.forEach((coord) => {
          endPoint.to(coord.network_id).emit("/updateAvail", lecturer);
        });
      });
    }
  });
};
