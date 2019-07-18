const mongoose = require("mongoose");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const Validator = require("validator");
const Chatkit = require('@pusher/chatkit-server');
const User = require("../models/User");

const chatkit = new Chatkit.default({
  instanceLocator: 'v1:us1:64b7dbdb-3e59-4fad-9823-83add90cba65',
  key: 'aa773122-6f34-44c9-a1ad-904343da9705:/ir9L4tewGuDuRKihCNW55MXOEnzUtyJpl3XYg6xu04=',
});
module.exports = async (req, res) => {
  // Data validation
  const { errors, isValid } = validator(req.body);
  if (!isValid) return res.status(400).json(errors);

  // Duplication protection
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("The email is already registered");

  user = await User.findOne({ username: req.body.username });
  if (user) return res.status(400).send("The username is already registered");

  //Registration and saving to database
  const avatar = gravatar.url(req.body.email, {
    s: "200",
    r: "pg",
    d: "mm"
  });

  user = new User({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
    avatar
  });

  //Generating the hashed password using bcryptjs
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.password, salt);

  await user.save();
  res.json({
    username: user.username,
    name: user.name,
    email: user.email
  });

  chatkit.createUser({
    name: user.username,
    id: user.username
 })
 .then(res => console.log('chatkit user created'))
 .catch(err => console.log(err));
//console.log(chatkit.chatkit);
};

function validator(data) {
  let errors = {};

  data.username = !Validator.isEmpty(data.username) ? data.username : "";
  data.name = !Validator.isEmpty(data.name) ? data.name : "";
  data.email = !Validator.isEmpty(data.email) ? data.email : "";
  data.password = !Validator.isEmpty(data.password) ? data.password : "";
  data.password2 = !Validator.isEmpty(data.password2) ? data.password2 : "";

  if (!Validator.isLength(data.username, { min: 2, max: 30 }))
    errors.username = "username must be between 2 and 30 characters";
  if (!Validator.isLength(data.name, { min: 2, max: 255 }))
    errors.name = "Name must be between 2 and 30 characters";
  if (Validator.isEmpty(data.name)) errors.name = "Name is required.";
  if (!Validator.isEmail(data.email))
    errors.email = "Email must be a valid email.";
  if (Validator.isEmpty(data.email)) errors.email = "Email is required.";
  if (Validator.isAlpha(data.password))
    errors.password = "Password must contain at least one number";
  if (Validator.isNumeric(data.password))
    errors.password = "Password must contain at least one letter";
  if (!Validator.isLength(data.password, { min: 8, max: 255 }))
    errors.password = "Password must be between 8 and 255 characters";
  if (Validator.isEmpty(data.password))
    errors.password = "Password is required.";
  if (Validator.isEmpty(data.password2))
    errors.password2 = "Confirm password is required.";
  if (!Validator.equals(data.password, data.password2))
    errors.password2 = "Passwords do not match";

  return {
    errors,
    isValid:
      errors === undefined ||
      errors === null ||
      (typeof errors === "object" && Object.keys(errors).length === 0)
  };
}
