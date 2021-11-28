const Airtable = require("airtable");
const validateRequest = require("../utils/validateRequest");
const respondWith = require("../utils/respondWith");

const { AIRTABLE_API_KEY, AIRTABLE_TABLE_ID } = process.env;

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: AIRTABLE_API_KEY,
});
const base = Airtable.base(AIRTABLE_TABLE_ID);

exports.handler = function (event, _, callback) {
  const validationError = validateRequest(event, "email", "md5", "fiction");
  if (validationError) {
    return validationError;
  }

  const { email, md5, fiction } = JSON.parse(event.body);

  base("jobs").create([{ fields: { email, md5, fiction } }], (err) => {
    if (err) {
      callback(err, respondWith(500, { error: "Error creating job" }));
    } else {
      callback(null, respondWith(201, { status: "Job created" }));
    }
  });
};
