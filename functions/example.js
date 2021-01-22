exports.handler = function () {
  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ hello: 'world' }),
  };
};
