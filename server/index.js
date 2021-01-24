const fs = require('fs');
const { getUnfinishedJobs, markJobComplete } = './airtable';
const mail = require('../utils/mail');
const logger = require('./logger');
const localConvert = require('./localConvert');

const JOB_RUNNING_FILEPATH = './.jobrunning';

async function main() {
  logger.warn('Starting free-books server');

  try {
    if (fs.existsSync(JOB_RUNNING_FILEPATH)) {
      logger.warn('Exiting early: job already running');
      return;
    }

    logger.info('Creating job-running mutex file');
    fs.writeFileSync(JOB_RUNNING_FILEPATH, new Date().toString());

    const unfinishedJobs = getUnfinishedJobs();
    logger.info(`Found ${unfinishedJobs.length} unfinished jobs`);

    for (const job of unfinishedJobs) {
      const filename = job.url.split('/').slice(-1)[0];
      const extension = job.url.split('.').slice(-1)[0];
      if (['mobi', 'pdf'].includes(extension)) {
        logger.info(`Job ${job.id} has mobi or pdf extension, sending it to ${job.email}`);
        await mail(job.email, filename, job.url);
      } else {
        logger.info(`Job ${job.id} has non mobi or pdf extension, converting it to mobi`);
        const outputFilePath = await localConvert(job.url);
        logger.info(`Job ${job.id} has been converted, sending it to ${job.email}`);
        await mail(job.email, filename, outputFilePath);
      }
      await markJobComplete(job.id);
    }
    logger.info('All jobs successfully completed');
  } catch (e) {
    logger.error(e);
  } finally {
    logger.info('Deleting job-running mutex file');
    fs.unlinkSync(JOB_RUNNING_FILEPATH);
  }

  logger.info('Done with free-books server');
}

main().catch(console.error);
