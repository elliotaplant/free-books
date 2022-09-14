const headers = {
  'Access-Control-Allow-Origin': '*',
  'Content-type': 'application/json',
};

module.exports = (statusCode, body) => ({
  statusCode,
  headers,
  body: JSON.stringify(body),
});
