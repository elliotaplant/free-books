const mail = require('../utils/mail');

exports.handler = async function (event, _, callback) {
  const email = event.queryStringParameters.email;
  const body = JSON.parse(event.body);
  const { filename, uri } = body.output[0];
  const shortFilename = filename.slice(0 , 10);

  console.log('Received converted', shortFilename, 'with uri', uri, 'for Kindle address', email);
  callback(null, { statusCode: 200 });
  console.log('Mailing converted', shortFilename, 'with uri', uri, 'for Kindle address', email);
  await mail(email, uri, filename);
  console.log('Finished mailing', shortFilename, 'with uri', uri, 'for Kindle address', email);
};
