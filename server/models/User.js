const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // null if using OAuth
    googleId: { type: String }, // only for OAuth
    avatar: { type: String },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      required: true,
    },
    // Store chat room memberships
    groupChats: [{ type: mongoose.Schema.Types.ObjectId, ref: "GroupChat" }],
    directMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: "DMRoom" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
