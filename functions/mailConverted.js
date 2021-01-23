const mail = require('../utils/mail');

exports.handler = async function (event, _, callback) {
  const email = event.queryStringParameters.email;
  const body = JSON.parse(event.body);
  const { filename, uri } = body.output[0];

  console.log('Received converted', filename, 'with uri', uri, 'for Kindle address', email);
  callback(null, { statusCode: 200 });
  await mail(email, uri, filename);
};
