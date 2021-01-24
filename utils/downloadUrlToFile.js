const stream = require('stream');
const { promisify } = require('util');
const fs = require('fs');
const got = require('got');

const pipeline = promisify(stream.pipeline);

const url = 'http://31.42.184.140/main/801000/1a4119020adfe9b9f8dfc249923f29e0/Marcus%20Aurelius%20-%20The%20Meditations-Hackett%20Pub%20Co%20Inc%20%281983%29.epub';

module.exports = function downloadUrl(url, filename) {
  await pipeline(
    got.stream(url),
    fs.createWriteStream('./theAurealist.epub')
  );
};
