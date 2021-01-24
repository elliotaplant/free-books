const libgen = require('libgen');
const validateRequest = require('../utils/validateRequest');
const respondWith = require('../utils/respondWith');

exports.handler = async function(event) {
  const mirror = await libgen.mirror();

  const validationError = validateRequest(event, 'query');
  if (validationError) {
    return validationError;
  }

  const options = { mirror, query: JSON.parse(event.body).query };
  const data = await libgen.search(options);
  return respondWith(200, data);
};
