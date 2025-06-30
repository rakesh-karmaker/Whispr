const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, required: true },
    roomType: { type: String, enum: ["group", "dm"], required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, required: true }, // GroupChat or DMRoom
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);
