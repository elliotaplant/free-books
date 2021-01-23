const got = require('got');

module.exports = function convert(sourceUrl, email) {
  return got.post('https://api2.online-convert.com/jobs', {
    headers: {
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      'x-oc-api-key': process.env.ONLINE_CONVERT_API_KEY,
    },
    body: JSON.stringify({
      input: [{
        type: 'remote',
        source: sourceUrl
      }],
      conversion: [{
        category: 'ebook',
        target: 'mobi'
      }],
      callback: `https://825a5e94e0f8.ngrok.io/.netlify/functions/mailConverted?email=${email}`
    })
  });
};
