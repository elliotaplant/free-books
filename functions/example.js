const respondWith = require('../utils/respondWith');

exports.handler = function (event, context) {
  const { identity, user } = context.clientContext;
  console.log('user', user);
  console.log('identity', identity);

  return respondWith(200, { identity, user });
};
