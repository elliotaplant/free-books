const libgen = require('libgen');
const validateRequest = require('../utils/validateRequest');
const respondWith = require('../utils/respondWith');

exports.handler = async function(event) {
  const mirror = await libgen.mirror();
  console.log('Using mirror', mirror);

  const validationError = validateRequest(event, 'query');
  if (validationError) {
    return validationError;
  }

  const { query } = JSON.parse(event.body);
  console.log(`Querying for "${query}"`);
  const data = await libgen.search({ mirror, query });
  console.log(`Found ${data.length || 0} result${data.length === 1 ? '' : 's'}`);
  return respondWith(200, data);
};
