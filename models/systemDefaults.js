const mongoose = require("mongoose");

const systemDefaultSchema = new mongoose.Schema({
  periods: [],
  pauses: [],
  weekDays: [],
});

const SystemDefaults = mongoose.model("system_default", systemDefaultSchema);

module.exports = SystemDefaults;
