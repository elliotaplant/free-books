const validateRequest = require('../utils/validateRequest');
const respondWith = require('../utils/respondWith');
const queryLibgen = require('../utils/queryLibgen');

exports.handler = async function (event) {
  const validationError = validateRequest(event, 'query');
  if (validationError) {
    return validationError;
  }

  const { query } = JSON.parse(event.body);
  console.log(`Querying for "${query}"`);
  const data = await queryLibgen(query);
  console.log(
    `Found ${data.length || 0} result${data.length === 1 ? '' : 's'}`
  );
  return respondWith(200, data);
};
