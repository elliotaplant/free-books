const Airtable = require("airtable");
const validateRequest = require("../utils/validateRequest");
const respondWith = require("../utils/respondWith");


exports.handler = async function (event, _, callback) {
  const validationError = validateRequest(event, "email", "md5", "fiction");
  if (validationError) {
    return validationError;
  }

  const { email, md5, fiction } = JSON.parse(event.body);

  try {
    await sendToKindle(email, md5, fiction);
  } catch (e) {
    return respondWith(500, { error: 'Unable to send to kindle' });
  }
  return respondWith(200);
};
