const mongoose = require("mongoose");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const keys = require("../config/keys");
const User = require("../models/User");

module.exports = async (req, res) => {
  res.send({
    user: req.user,
    authorised: req.authorised,
    ownProfile: req.ownProfile
  });
};
