import { initializeApp } from 'firebase-admin/app';
import * as logger from 'firebase-functions/logger';
import { onRequest } from 'firebase-functions/v2/https';
import { switchMap } from 'rxjs';
import { CloudExecuteFactory } from './app/executable/CloudExecuteFactory';
import { CloudStorage } from './app/storage/CloudStorage';

initializeApp();

const storage = new CloudStorage();
const executableFactory = new CloudExecuteFactory(storage);

const defaultFileName = process.env.CF_EXTERNAL_FILE_NAME as string;
const defaultBucket = process.env.GCLOUD_BUCKET_NAME as string;

/**
 * Cloud function that executes a GCS-hosted script
 */
export const cfExecute = onRequest((request, response) => {
  logger.info('Executing the function...');

  const fileName = (request.query.fileName as string) || defaultFileName;
  const bucketName = (request.query.bucket as string) || defaultBucket;

  executableFactory
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
