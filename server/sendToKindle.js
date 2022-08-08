const mail = require('../utils/mail');
const logger = require('./logger');
const { getFilename, getExtension } = require('../utils/fileStuff');
const getDownloadLink = require('../utils/getDownloadLink');

const directSends = ['epub', 'mobi', 'pdf'];

module.exports = async function sendToKindle(email, md5, fiction) {
  const downloadLink = await getDownloadLink(md5, fiction);
  const filename = getFilename(downloadLink);
  const extension = getExtension(downloadLink);

  if (!directSends.includes(extension)) {
    throw new Error(`${md5} has non ${directSends} extension`);
  }

  logger.info(
    `${md5} has ${directSends.join(', ')} extension, sending it to ${email}`
  );

  return await mail(email, downloadLink, filename);
};
