const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
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
    enum: ["pending", "sent"],
    default: "pending",
    required: true,
  },

  label: {
    type: String, // a piece of text which may be attached to a non-text message
  },

  audience: [],
});

const notification = mongoose.model("notification", notificationSchema);

module.exports = notification;
