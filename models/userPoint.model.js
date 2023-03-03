const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userPointSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  points: { type: Number, default: 0 },
});

module.exports = mongoose.model("UserPoint", userPointSchema);
