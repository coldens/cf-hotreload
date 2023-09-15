import { caching } from 'cache-manager';
import { initializeApp } from 'firebase-admin/app';
import * as logger from 'firebase-functions/logger';
import { onRequest } from 'firebase-functions/v2/https';
import { onObjectFinalized } from 'firebase-functions/v2/storage';
import { CloudExecuteFactory } from './app/executable/CloudExecuteFactory.js';
import { CloudStorage } from './app/storage/CloudStorage.js';
import { syncAndCompile } from './compile.js';
import { COMPILED_FILE_NAME } from './consts/COMPILED_FILE_NAME.js';
import { DEFAULT_BUCKET_NAME } from './consts/DEFAULT_BUCKET.js';

initializeApp();

let cloudExecute: CloudExecuteFactory;

/**
 * Initializes the CloudExecuteFactory
 */
const init = async () => {
  const storage = new CloudStorage();
  const memoryCache = await caching('memory', {
    max: 100,
    ttl: 60_000, // milliseconds
  });

  cloudExecute = new CloudExecuteFactory(storage, memoryCache);
};

/**
 * Cloud function that executes a GCS-hosted script
 */
export const cfExecute = onRequest(async (request, response) => {
  logger.info('Executing the function...');

  if (!cloudExecute) {
    await init();
  }

  const fileName =
    <string>request.query.fileName || `out/${COMPILED_FILE_NAME}`;
  const bucketName = <string>request.query.bucket || DEFAULT_BUCKET_NAME;

  try {
    const obj = await cloudExecute.create(fileName, bucketName);
    const main = async () => obj.main(request.body);
    response.send(await main());
  } catch (error) {
    logger.error('Error executing the function', error);
    response.status(500).send('Error executing the function, see logs.');
  }

  logger.info('Function executed!');
});

/**
 * Cloud function that syncs and compiles the source code manually
 */
export const runSyncAndCompile = onRequest(async (req, res) => {
  try {
    await syncAndCompile();
    res.send({ success: true });
  } catch (error) {
    logger.error('Error syncing and compiling', error);
    res.status(500).send('Error syncing and compiling, see logs.');
  }
});

/**
 * Cloud function that syncs and compiles the source code
 */
export const objectFinalizedListener = onObjectFinalized(
  { bucket: DEFAULT_BUCKET_NAME },
  async (event) => {
    if (event.data.name.includes('source')) {
      try {
        await syncAndCompile();

        if (cloudExecute) {
          await cloudExecute.clearCache();
        }
      } catch (error) {
        logger.error('Error syncing and compiling', error);
      }
    }
  },
);
