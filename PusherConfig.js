const Pusher = require('pusher');

const pusher = new Pusher({
  appId: '697905',
  key: 'f790521ed52ae6aaf77e',
  secret: '47819d68e1ff947fc589',
  cluster: 'eu',
  encrypted: true
});

pusher.trigger('my-channel', 'my-event', {
  "message": "hello world"
}, () => console.log('triggered'));

module.exports = pusher;