const convert = require('../utils/convert');

exports.handler = async function(event) {
  console.log('Starting test convert');
  console.log('event', event);
  console.log('event.body', event.body);
  const url = 'http://31.42.184.140/main/679000/a14c9d8cae18de52972195b593458ba2/Dennis%20J.%20Stanford%2C%20Jane%20Stevenson%20Day%20-%20Ice%20age%20hunters%20of%20the%20Rockies-University%20Press%20of%20Colorado%20%281992%29.epub';
  await convert(url, 'exampleEmail@mindle.com');
  return { statusCode: 200 };
};
