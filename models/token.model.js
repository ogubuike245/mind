const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TokenSchema = new Schema({
  value: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  expires: { type: Date, default: Date.now, expires: 3600 },
});

const Token = mongoose.model("Token", TokenSchema);

module.exports = Token;
