const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    avatar: { type: String },
    authProvider: {
      type: String,
      enum: ["google", "local", "both"],
      default: "google",
    },
    // Store chat room memberships
    groupChats: [{ type: mongoose.Schema.Types.ObjectId, ref: "GroupChat" }],
    directMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: "DMRoom" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
