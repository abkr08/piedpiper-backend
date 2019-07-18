const jwt = require("jsonwebtoken");
const keys = require("../config/keys");

module.exports = async (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied.");

  try {
    const decoded = jwt.verify(token, keys.secretOrKey);

    const user = await User.findById(decoded._id);
    if (!user) return res.status(404).send("User not found");

    req.authorised = true;
    req.ownProfile = req.params.username === user.username;
    req.user = user;

    next();
  } catch (ex) {
    res.status(400).send("Invalid token");
  }
};
