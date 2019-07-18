const User = require('../models/User');
const pusher = require('../PusherConfig');

module.exports = async (req, res) => {
   
    const socketId = req.body.socket_id;
    const channel = req.body.channel_name;
    var presenceData = {
    user_id: req.body.user
    };
    const auth = pusher.authenticate(socketId, channel, presenceData);
    res.send(auth);
}