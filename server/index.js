const fs = require('fs');
const { getUnfinishedJobs, markJobComplete } = './airtable';
const mail = require('../utils/mail');
const logger = require('simple-node-logger').createSimpleLogger('project.log');
const localConvert = require('./localConvert');

const JOB_RUNNING_FILEPATH = './.jobrunning';

async function main() {
  try {

    if (fs.existsSync(JOB_RUNNING_FILEPATH)) {
      console.log('Exiting early: job already running');
      return;
    }

    fs.writeFileSync(JOB_RUNNING_FILEPATH, new Date().toString());

    const unfinishedJobs = getUnfinishedJobs();
    for (const job of unfinishedJobs) {
      const filename = job.url.split('/').slice(-1)[0];
      const extension = job.url.split('.').slice(-1)[0];
      if (['mobi', 'pdf'].includes(extension)) {
        await mail(job.email, filename, job.url);
      } else {
        const outputFilePath = await localConvert(job.url);
        await mail(job.email, filename, outputFilePath);
      }
      await markJobComplete(job.id);
    }
  } catch (e) {
    logger.error(e);
  } finally {
    fs.unlinkSync(JOB_RUNNING_FILEPATH);
  }
}

main().catch(console.error);
