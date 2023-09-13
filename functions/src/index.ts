import { initializeApp } from 'firebase-admin/app';
import * as logger from 'firebase-functions/logger';
import { onRequest } from 'firebase-functions/v2/https';
import {
  onObjectDeleted,
  onObjectFinalized,
} from 'firebase-functions/v2/storage';
import { switchMap } from 'rxjs';
import { CloudExecuteFactory } from './app/executable/CloudExecuteFactory';
import { CloudStorage } from './app/storage/CloudStorage';
import { DEFAULT_BUCKET_NAME } from './consts/DEFAULT_BUCKET';
import { DEFAULT_FILE_NAME } from './consts/DEFAULT_FILE_NAME';
import { syncFolder } from './syncFolder';

initializeApp();

/**
 * Cloud function that executes a GCS-hosted script
 */
export const cfExecute = onRequest((request, response) => {
  const cloudExecute = new CloudExecuteFactory(new CloudStorage());

  logger.info('Executing the function...');

  const fileName = (request.query.fileName as string) || DEFAULT_FILE_NAME;
  const bucketName = (request.query.bucket as string) || DEFAULT_BUCKET_NAME;

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
  () => syncFolder(),
);

export const objectDeletedListener = onObjectDeleted(
  { bucket: DEFAULT_BUCKET_NAME },
  () => syncFolder(),
);
