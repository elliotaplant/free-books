const libgen = require('libgen');
const validateRequest = require('../utils/validateRequest');
const respondWith = require('../utils/respondWith');
const MIRROR = 'http://libgen.is';

exports.handler = async function(event) {
  const validationError = validateRequest(event, 'query');
  if (validationError) {
    return validationError;
  }

  const options = {
    mirror: MIRROR,
    query: JSON.parse(event.body).query,
  };
  const data = await libgen.search(options);
  console.log('data', data);
  return respondWith(200, data);
};
