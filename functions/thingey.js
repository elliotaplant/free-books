exports.handler = function(event) {
  console.log('THINGKEY');
  console.log('event', event);
  console.log('event.body', event.body);
  return { statusCode: 200 };
};
