const Airtable = require('airtable');
const logger = require('./logger');

const { AIRTABLE_API_KEY, AIRTABLE_TABLE_ID } = process.env;

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: AIRTABLE_API_KEY,
});
const base = Airtable.base(AIRTABLE_TABLE_ID);

function getUnfinishedJobs() {
  logger.info('Getting unfinishedJobs');
  const jobs = [];
  return new Promise((resolve, reject) => {
    base('jobs')
      .select({ filterByFormula: 'NOT({sent})' })
      .eachPage(
        (records, fetchNextPage) => {
          jobs.push(...records.map(({ id, fields }) => ({ id, ...fields })));
          fetchNextPage();
        },
        (err) => (err ? reject(err) : resolve(jobs))
      );
  });
}

function markJobComplete(id) {
  logger.info(`Marking job ${id} complete`);
  return new Promise((resolve, reject) =>
    base('jobs').update([{ id, fields: { sent: true } }], (err) =>
      err ? reject(err) : resolve()
    )
  );
}

async function cleanup() {
  logger.info(`Cleaning up airtable`);
  const toDestroy = [];
  // Get sent jobs
  await new Promise((resolve, reject) =>
    base('jobs')
      .select({ filterByFormula: 'OR(sent, NOT(AND(md5, email)))' })
      .eachPage(
        (records, fetchNextPage) => {
          toDestroy.push(...records.map(({ id }) => id));
          fetchNextPage();
        },
        (err) => (err ? reject(err) : resolve(toDestroy))
      )
  );
  logger.info(`Destorying records:`, { toDestroy });

  const chunks = [];
  const chunkSize = 10;
  for (let i = 0; i < toDestroy.length; i += chunkSize) {
    await new Promise((resolve, reject) =>
      base('jobs').destroy(toDestroy.slice(i, i + chunkSize), (err) =>
        err ? reject(err) : resolve()
      )
    );
  }

  logger.info(`Destoryed records:`, { count: toDestroy.length });
}

module.exports = { getUnfinishedJobs, markJobComplete, cleanup };
