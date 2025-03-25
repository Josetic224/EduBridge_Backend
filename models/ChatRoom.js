const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatRoomSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
  isEscalated: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("ChatRoom", chatRoomSchema);