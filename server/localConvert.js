const { promisify } = require('util');
const convert = require('ebook-convert');
const fs = require('fs');
const got = require('got');
const stream = require('stream');
const logger = require('./logger');
const { getFilename, changeExtension } = ('../utils/fileStuff');

const pipeline = promisify(stream.pipeline);

module.exports = async function localConvert(url) {
  // Download unconverted file from URL
  const filename = getFilename(url);
  const downloadFilePath = './' + filename;
  logger.info(`Downloading ${url} into ${downloadFilePath}`);
  await pipeline(got.stream(url), fs.createWriteStream(downloadFilePath));
  logger.info(`Downloaded ${url} into ${downloadFilePath}`);
  const outputFilePath = changeExtension(outputFilePath, 'mobi');
  logger.info(`Converting ${downloadFilePath} into ${outputFilePath}`);

  const options = {
    input: downloadFilePath,
    output: outputFilePath
  };

  return new Promise((resolve, reject) => convert(options, err => err ? reject(err) : resolve(outputFilePath)));
};
