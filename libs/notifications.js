const events = require('events');
const eventEmitter = new events.EventEmitter();

eventEmitter.on('welcome', (user) => {
    console.log(`Welcome notification sent to ${user.email}`);
});

eventEmitter.on('passwordChange', (user) => {
    console.log(`Password change notification sent to ${user.email}`);
});

module.exports = eventEmitter;