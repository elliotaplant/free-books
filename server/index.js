const fs = require('fs');
const { getUnfinishedJobs, markJobComplete, cleanup } = require('./airtable');
const mail = require('../utils/mail');
const logger = require('./logger');
const { getFilename, getExtension } = require('../utils/fileStuff');
const getDownloadLink = require('../utils/getDownloadLink');

async function main() {
  logger.info('Starting free-books server');

  try {
    const unfinishedJobs = await getUnfinishedJobs();
    logger.info(`Found ${unfinishedJobs.length} unfinished jobs`);

    for (const job of unfinishedJobs) {
      try {
        if (!(job.md5 && job.email)) {
          logger.error(
            `Unable to process job with no md5 or no email: ${JSON.stringify(
              job
            )}`
          );
          continue;
        }
        const downloadLink = await getDownloadLink(job.md5, job.fiction);
        const filename = getFilename(downloadLink);
        const extension = getExtension(downloadLink);
        if (['epub', 'mobi', 'pdf'].includes(extension)) {
          logger.info(
            `Job ${job.id} has epub, mobi or pdf extension, sending it to ${job.email}`
          );
          await mail(job.email, downloadLink, filename);
        } else {
          logger.warn(`Job ${job.id} has non epub, mobi or pdf extension`);
        }
        await markJobComplete(job.id);
      } catch (e) {
        logger.error(e);
      }
    }
    logger.info('All jobs completed');

    await cleanup();
  } catch (e) {
    logger.error(e);
  }

  logger.info('Done with free-books server');
}

main().catch(console.error);
