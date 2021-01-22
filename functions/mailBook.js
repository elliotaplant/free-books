const mail = require('../utils/mail');
const respondWith = require('../utils/respondWith');

exports.handler = async function (event) {
  if (!event.body) {
    console.error('Missing request body');
    return respondWith(400, { error: 'Missing request body' });
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    console.error('Invalid non-JSON body: ' + event.body);
    return respondWith(400, { error: 'Invalid non-JSON body: ' + event.body });
  }

  const { email, filename, url } = body;
  if (!(email && filename && url)) {
    console.error('Missing required fields [email, filename, url]');
    return respondWith(400, { error: 'Missing required fields [email, filename, url]' });
  }

  await mail(email, filename, url);
  return respondWith(200, { hello: 'world' });
};
