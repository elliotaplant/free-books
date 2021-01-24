const { promisify } = require('util');
const convert = require('ebook-convert');
const fs = require('fs');
const got = require('got');
const stream = require('stream');
const { getFilename, changeExtension } = ('../utils/fileStuff');

const pipeline = promisify(stream.pipeline);

module.exports = async function localConvert(url) {
  // Download unconverted file from URL
  const filename = getFilename(url);
  const downloadedFilePath = './' + filename;
  await pipeline(got.stream(url), fs.createWriteStream(downloadedFilePath));
  const outputFilePath = changeExtension(outputFilePath, 'mobi');

  const options = {
    input: downloadedFilePath,
    output: outputFilePath
  };

  return new Promise((resolve, reject) => convert(options, err => err ? reject(err) : resolve(outputFilePath)));
};
