const fs = require('fs');
const { getUnfinishedJobs, markJobComplete } = require('./airtable');
const mail = require('../utils/mail');
const logger = require('./logger');
const localConvert = require('./localConvert');
const { getFilename, getExtension, changeExtension } = require('../utils/fileStuff');
const workingDir = require('./workingDir');
const rmDirSync = require('../utils/rmDirSync');

async function main() {
  logger.warn('Starting free-books server');

  try {
    if (fs.existsSync(workingDir)) {
      logger.warn('Exiting early: job already running');
      return;
    }
  } catch (e) {
    logger.error(e);
  }

  try {

    logger.info('Creating working directory mutex file');
    fs.mkdirSync(workingDir);

    const unfinishedJobs = await getUnfinishedJobs();
    logger.info(`Found ${unfinishedJobs.length} unfinished jobs`);

    for (const job of unfinishedJobs) {
      const filename = getFilename(job.url);
      const extension = getExtension(job.url);
      if (['mobi', 'pdf'].includes(extension)) {
        logger.info(`Job ${job.id} has mobi or pdf extension, sending it to ${job.email}`);
        await mail(job.email, job.url, filename);
      } else {
        logger.info(`Job ${job.id} has non mobi or pdf extension, converting it to mobi`);
        const outputFilePath = await localConvert(job.url);
        logger.info(`Job ${job.id} has been converted, sending it to ${job.email} from path ${outputFilePath}`);
        await mail(job.email, outputFilePath, changeExtension(filename, 'mobi'));
      }
      await markJobComplete(job.id);
    }
    logger.info('All jobs successfully completed');
  } catch (e) {
    logger.error(e);
  } finally {
    logger.info('Deleting working directory');
    rmDirSync(workingDir);
  }

  logger.info('Done with free-books server');
}

main().catch(console.error);
