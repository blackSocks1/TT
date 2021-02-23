const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatMessage = new Schema({
  _id: {
    type: String, // concat (sender_id, chat_id, timeStamp(in milliseconds))
    required: true,
  },

  sender_id: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    enum: ["text", "audio", "video", "other"],
    default: text,
    required: true,
  },

  content: {
    type: String, // in case it's not a text message, it should be the path to the file
    minlength: 1,
    maxlength: 10000, // just like whatsApp
    required: true,
  },

  sentDate: {
    type: Number, // date sent in millisecs
    required: true,
  },

  status: {
    type: String, // instantaneous status of message
    enum: ["pending", "sent", "received", "read"],
    default: "pending",
    required: true,
  },

  label: {
    type: String, // a piece of text which may be attached to a non-text message
  },

  ref: {
    type: String, // _id of another message it is refering to
  },

  participants: [], // {_id, accountType, received: bool, read: bool}
});

const chatMessage = mongoose.model("chatMessage", ChatMessage);

module.exports = chatMessage;
