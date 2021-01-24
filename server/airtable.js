const Airtable = require('airtable');
const logger = require('./logger');

const { AIRTABLE_API_KEY, AIRTABLE_TABLE_ID } = process.env;

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: AIRTABLE_API_KEY
});
const base = Airtable.base(AIRTABLE_TABLE_ID);

function getUnfinishedJobs() {
  logger.info('Getting unfinishedJobs');
  const jobs = [];
  return new Promise((resolve, reject) => {
    base('jobs')
      .select({ fiels: ['md5', 'email'], filterByFormula: 'NOT({sent})' })
      .eachPage(
        (records, fetchNextPage) => {
          jobs.push(...records.map(({ id, fields }) => ({ id, ...fields })));
          fetchNextPage();
        },
        err => (err ? reject(err) : resolve(jobs))
      );
  });
}

function markJobComplete(id) {
  logger.info(`Marking job ${id} complete`);
  return new Promise((resolve, reject) => base('jobs').update(
    [{ id, fields: { sent: true } }],
    err => err ? reject(err) : resolve()
  ));
}

module.exports = { getUnfinishedJobs, markJobComplete };
