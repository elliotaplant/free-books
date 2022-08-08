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
  console.log(`Found ${data.length} result(s)`);

  const filteredData = data
    .filter(({ format }) =>
      ['epub', 'mobi', 'pdf'].includes(format.toLowerCase())
    )
    .filter(
      ({ size }) =>
        !(size.toLowerCase().includes('mb') && Number(size.split(' ')[0]) > 24)
    );

  console.log(`Filtered down to ${filteredData.length} result(s)`);

  return respondWith(200, filteredData);
};
