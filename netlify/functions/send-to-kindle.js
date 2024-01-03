const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL);

exports.handler = async function (event) {
  const body = JSON.parse(event.body);
  const { email, url } = body;

  if (!email || !url) {
    console.log('Email or url missing');
    return { statusCode: 400, body: 'Both email and url are required' };
  }

  try {
    console.log('Pushing url and email to redis');
    await redis.rpush(process.env.REDIS_KEY, [url, email].join(','));
    console.log('Pushed url and email to redis');

    return { statusCode: 200, body: 'Book enqueued' };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: `Error: ${error.message}` };
  }
};
