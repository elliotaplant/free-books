const Airtable = require('airtable');

const { AIRTABLE_API_KEY, AIRTABLE_TABLE_ID } = process.env;

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: AIRTABLE_API_KEY
});
const base = Airtable.base(AIRTABLE_TABLE_ID);

function getUnfinishedJobs() {
  const jobs = [];
  return new Promise((resolve, reject) => {
    base('jobs')
      .select({ filterByFormula: 'NOT({sent})' })
      .eachPage(
        (records, fetchNextPage) => {
          jobs.push(...records);
          fetchNextPage();
        },
        err => (err ? reject(err) : resolve(jobs))
      );
  });
}

function markJobComplete(id) {
  return new Promise((resolve, reject) => base('jobs').update(
    [{ id, fields: { sent: true } }],
    err => err ? reject(err) : resolve()
  ));
}

module.exports = { getUnfinishedJobs, markJobComplete };
