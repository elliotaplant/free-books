exports.handler = function (event, context) {
  const { identity, user } = context.clientContext;
  console.log('user', user);
  console.log('identity', identity);
  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ identity, user }),
  };
};
