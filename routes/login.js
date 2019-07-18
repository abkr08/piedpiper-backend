const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Validator = require("validator");

const User = require("../models/User");
const keys = require("../config/keys");

module.exports = async (req, res) => {
  // This is the main function called when user gets "/login"
  const { errors, isValid } = validator(req.body);
  if (!isValid) return res.status(400).send(errors);

  const email = req.body.email;
  const password = req.body.password;

  const user = await User.findOne({ email });
  if (!user) {
    errors.authError = "Incorrect email or password."; // Email is incorrect since we couldn't find a user
    return res.status(400).send(errors);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    errors.authError = "Incorrect email or password."; // Password is incorrect
    return res.status(400).send(errors);
  }

  const payload = { _id: user._id }; //Creating jwt payload
 
  const token = jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 });

  // Here we'll change the res.json() to something such that react works.
  res
    .header("x-auth-token", token)
    .json({ success: true, token: token, userId: user.username, expiresIn: 3600  });
};

function validator(data) {
  let errors = {};

  data.email = !Validator.isEmpty(data.email) ? data.email : "";
  data.password = !Validator.isEmpty(data.password) ? data.password : "";

  if (Validator.isEmpty(data.email)) errors.email = "Email is required.";
  if (Validator.isEmpty(data.password))
    errors.password = "Password is required.";

  return {
    errors,
    isValid:
      errors === undefined ||
      errors === null ||
      (typeof errors === "object" && Object.keys(errors).length === 0)
  };
}
