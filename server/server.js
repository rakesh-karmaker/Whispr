const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

const googleAuth = require("./auth/google");
app.use("/auth/google", googleAuth);

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
