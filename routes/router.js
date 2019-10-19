const passport = require("passport");
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const register = require("./register.js");
const login = require("./login");
const profile = require("./profile");
const search = require("./search");
const auth = require("../middleware/auth");
const pusherAuth = require("./pusherAuth");


// router.get("/", (req, res) => {
//   // To do list:
//   // Authenticate and check for jwt.
//   // If authentication secured, redirect to profile
//   // Else, redirect to login/register page

//   res.send("Hello!");
// });

router.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

router.post("/login", (req, res) => login(req, res));

router.post("/register", (req, res) =>  register(req, res));

router.get("/profile/:username", auth, (req, res) => profile(req, res));

router.post("/pusher/auth", (req, res) => pusherAuth(req, res));

router.get("/search/:username", (req, res) => search(req, res));

module.exports = router;
