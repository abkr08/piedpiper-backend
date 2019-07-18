const mongoose = require("mongoose");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const keys = require("../config/keys");
const User = require("../models/User");

module.exports = async (req, res) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied.");

  try {
    const decoded = jwt.verify(token, keys.secretOrKey);

    const user = await User.findOne({username: req.params.username});

    if (!user) return res.status(404).send("User not found");

    req.authorised = true;
    req.ownProfile = req.params.username === user.username;
    req.user = user;
    res.send({
      name: user.name,
      id: user._id,
      avatar: user.avatar,
      authorised: req.authorised,
      ownProfile: req.ownProfile
    });
  } catch (ex) {
    res.status(400).send("Invalid token");
  }
};