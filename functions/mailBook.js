const mail = require('../utils/mail');
const validateRequest = require('../utils/validateRequest');
const respondWith = require('../utils/respondWith');
const getDownloadLink = require('../utils/getDownloadLink');
const convert = require('../utils/convert');

exports.handler = async function (event, _, callback) {
  const validationError = validateRequest(event, 'email', 'md5');
  if (validationError) {
    return validationError;
  }

  const { email, md5 } = JSON.parse(event.body);
  const downloadLink = await getDownloadLink(md5);
  const filename = decodeURI(downloadLink.split('/').slice(-1)[0]);
  const extension = filename.split('.').slice(-1)[0];


  try {
    console.log('Handling', filename);
    // PDFs and MOBIs can go straight to the Kindle
    if (['pdf', 'mobi'].includes(extension)) {
      console.log('Sending', filename, 'directly to the Kindle address', email);
      callback(null, respondWith(200, { status: 'sending_mail' }));
      await mail(email, downloadLink, filename);
    } else {
      // Other types (ie, ePubs) need to first be converted to MOBI and then sent by mailConverted.js to the Kindle
      console.log('Converting', filename, 'before sending to the Kindle address', email);
      callback(null, respondWith(200, { status: 'conversion_initiated' }));
      await convert(downloadLink, email);
    }
  } catch (e) {
    console.error(`Error occurred while processing ${filename}: ${e}`);
  }
};
