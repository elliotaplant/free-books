const validateRequest = require('../utils/validateRequest');
const respondWith = require('../utils/respondWith');
const mail = require('../utils/mail');
const getDownloadLink = require('../utils/getDownloadLink');

exports.handler = async function (event, _, callback) {
  const validationError = validateRequest(event, 'email', 'md5', 'fiction');
  if (validationError) {
    return validationError;
  }

  const { email, md5, fiction } = JSON.parse(event.body);

  try {
    console.log('Getting download link for', md5);
    const downloadLink = await getDownloadLink(md5, fiction);

    console.log('Got download link for', md5, downloadLink);

    const filename = downloadLink.split('/').slice(-1)[0];
    const extension = downloadLink.split('.').slice(-1)[0];

    if (!['epub', 'mobi', 'pdf'].includes(extension)) {
      return respondWith(403, { error: 'Invalid file type' });
    }

    console.log(`${md5} has ${extension} extension, sending it to ${email}`);

    await mail(email, downloadLink, filename);

    console.log('Sent', downloadLink, 'as', filename, 'to', email);

    return respondWith(200);
  } catch (e) {
    console.error(e);
    return respondWith(500, { error: 'Unable to send to kindle' });
  }
};
