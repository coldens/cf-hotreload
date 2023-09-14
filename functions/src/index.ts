import { initializeApp } from 'firebase-admin/app';
import * as logger from 'firebase-functions/logger';
import { onRequest } from 'firebase-functions/v2/https';
import {
  onObjectDeleted,
  onObjectFinalized,
} from 'firebase-functions/v2/storage';
import { switchMap } from 'rxjs';
import { CloudExecuteFactory } from './app/executable/CloudExecuteFactory.js';
import { CloudStorage } from './app/storage/CloudStorage.js';
import { syncAndCompile } from './compile.js';
import { COMPILED_FILE_NAME } from './consts/COMPILED_FILE_NAME.js';
import { DEFAULT_BUCKET_NAME } from './consts/DEFAULT_BUCKET.js';

initializeApp();

const cloudExecute = new CloudExecuteFactory(new CloudStorage());

/**
 * Cloud function that executes a GCS-hosted script
 */
export const cfExecute = onRequest((request, response) => {
  logger.info('Executing the function...');

  const fileName =
    <string>request.query.fileName || `out/${COMPILED_FILE_NAME}`;
  const bucketName = <string>request.query.bucket || DEFAULT_BUCKET_NAME;

  cloudExecute
    .create$(fileName, bucketName)
    .pipe(switchMap(async (obj) => obj.main()))
    .subscribe({
      next: (result) => {
        response.send(result);
      },
      error: (error) => {
        logger.error('Error executing the function', error);
        response.status(500).send('Error executing the function, see logs.');
      },
      complete: () => {
        logger.info('Function executed!');
      },
    });
});

export const objectFinalizedListener = onObjectFinalized(
  { bucket: DEFAULT_BUCKET_NAME },
  () => refreshCache(),
);

export const objectDeletedListener = onObjectDeleted(
  { bucket: DEFAULT_BUCKET_NAME },
  () => refreshCache(),
);

export const runSyncAndCompile = onRequest(async (req, res) => {
  try {
    await refreshCache();
    res.send({ success: true });
  } catch (error) {
    logger.error('Error syncing and compiling', error);
    res.status(500).send('Error syncing and compiling, see logs.');
  }
});

async function refreshCache() {
  await syncAndCompile();
  cloudExecute.clearCache();
}
