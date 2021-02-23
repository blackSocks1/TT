const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema({
  _id: { type: String, required: true },

  messages: [
    {
      type: Schema.Types.String,
      ref: "message",
    },
  ],

  // additional stuffs for group chat
  creator_id: {
    type: String,
  },

  admins: [],

  participants: [], // length must be >= 2 and if > 2, admins must be > 0
});

const chat = mongoose.model("chat", chatSchema);

module.exports = chat;
