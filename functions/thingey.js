exports.handler = async function(event, _, callback) {
  console.log('THINGKEY');
  console.log('event', event);
  console.log('Calling callback with 200');
  callback(null, { statusCode: 200 });
  // could it be that this returns a promise no matter what? so it ignores the callback??
  await new Promise(r => setTimeout(r, 10000));
  console.log('Finished event body thing');
};
