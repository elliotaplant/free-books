const got = require('got');

exports.handler = async (event) => {
  const buffer = await got(event.queryStringParameters.url).buffer();
  return {
    statusCode: 200,
    headers: {
      'Content-type': 'image/jpeg'
    },
    body: buffer.toString('base64'),
    isBase64Encoded: true,
  };
};
