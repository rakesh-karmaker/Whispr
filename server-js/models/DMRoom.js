const mongoose = require("mongoose");

const DMRoomSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("DMRoom", DMRoomSchema);
