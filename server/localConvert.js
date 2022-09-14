const { promisify } = require('util');
const convert = require('ebook-convert');
const fs = require('fs');
const got = require('got');
const stream = require('stream');
const logger = require('./logger');
const path = require('path');
const workingDir = require('./workingDir');
const { getFilename, changeExtension } = require('../utils/fileStuff');

const pipeline = promisify(stream.pipeline);

module.exports = async function localConvert(url) {
  // Download unconverted file from URL
  const filename = getFilename(url);
  const downloadFilePath = path.join(workingDir, filename);
  logger.info(`Downloading ${url} into ${downloadFilePath}`);
  await pipeline(got.stream(url), fs.createWriteStream(downloadFilePath));
  logger.info(`Downloaded ${url} into ${downloadFilePath}`);
  const outputFilePath = changeExtension(downloadFilePath, 'mobi');
  logger.info(`Converting ${downloadFilePath} into ${outputFilePath}`);

  const options = {
    input: downloadFilePath,
    output: outputFilePath,
  };

  return new Promise((resolve, reject) =>
    convert(options, (err) => (err ? reject(err) : resolve(outputFilePath)))
  );
};
