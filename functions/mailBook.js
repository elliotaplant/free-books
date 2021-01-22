const mail = require('../utils/mail');
const respondWith = require('../utils/respondWith');

exports.handler = async function () {
  await mail('elliotsstorage@gmail.com', 'licence.txt', 'https://raw.github.com/nodemailer/nodemailer/master/LICENSE');
  return respondWith(200, { hello: 'world' });
};
