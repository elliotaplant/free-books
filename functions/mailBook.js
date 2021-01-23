const mail = require('../utils/mail');
const validateRequest = require('../utils/validateRequest');
const respondWith = require('../utils/respondWith');

exports.handler = async function (event) {
  const validationError = validateRequest(event, 'email', 'filename', 'url');
  if (validationError) {
    return validationError;
  }

  const { email, filename, url } = JSON.parse(event.body);
  await mail(email, filename, url);
  return respondWith(200, { status: 'success' });
};
