const moment = require('moment');

function formatMessage(username, text,reciever) {
  return {
    username,
    text,
    time: moment().format('h:mm a'),
    reciever
  };
}

module.exports = formatMessage;
