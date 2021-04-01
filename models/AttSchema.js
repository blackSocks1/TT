const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AttSchema = new Schema({
  data: [], // {name, presence, remark}

  description: String,

  type: String,

  group_id: {
    type: Schema.Types.String,
    ref: "group",
    required: true,
  },

  date: {
    type: String, // dateString
    required: true,
  },

  time: {
    type: String,
    required: true,
  },

  takenBy: {
    user_id: String,
    accountType: String,
  },

  owner_id: {
    type: String, // lecturer id, group id
    required: true,
  },
});

const Attendance = mongoose.model("attendance", AttSchema);

module.exports = Attendance;
