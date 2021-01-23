const respondWith = require('../utils/respondWith');

module.exports = function validateBody(event, ...requiredFields) {
  if (!event.body) {
    const error = 'Missing request body';
    console.error(error);
    return respondWith(400, { error });
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    const error = 'Invalid non-JSON body: ' + event.body;
    console.error(error);
    return respondWith(400, { error });
  }

  for (const requiredField  of requiredFields) {
    if (!body.hasOwnProperty(requiredField)) {
      const error = `Body missing required field ${requiredField}`;
      console.error(error);
      return respondWith(400, { error });
    }
  }

  return null;
};
