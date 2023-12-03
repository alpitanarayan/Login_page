const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const express = require("express");
const app = express();

// mongoose.connect("mongodb://127.0.0.1:27017/USER_LOGIN_INFO");
mongoose
  .connect("mongodb://127.0.0.1:27017/USER_LOGIN_INFO", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Connection failed:", error));

const userSchema = new mongoose.Schema(
  {
    // id:String,
    name: String,
    email: String,
    password: String,
  },
  { versionKey: false }
);

const User = mongoose.model("User", userSchema, "user_info");
app.use(bodyParser.urlencoded({ extended: true }));

module.exports = User;
