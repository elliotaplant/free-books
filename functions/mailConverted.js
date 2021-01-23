const mail = require('../utils/mail');
const respondWith = require('../utils/respondWith');

exports.handler = async function (event, _, callback) {
  const email = event.queryStringParameters.email;
  const body = JSON.parse(event.body);
  const { filename, uri } = body.output[0];

  console.log('Received converted', filename, 'with uri', uri, 'for Kindle address', email);
  callback(null, respondWith(200, { status: 'sending_mail' }));
  await mail(email, uri, filename);
};