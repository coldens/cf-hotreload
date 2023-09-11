import { initializeApp } from 'firebase-admin/app';
import * as logger from 'firebase-functions/logger';
import { onRequest } from 'firebase-functions/v2/https';
import { from, switchMap } from 'rxjs';
import { CloudExecuteFactory } from './app/executable/CloudExecuteFactory';
import { CloudStorage } from './app/storage/CloudStorage';
import { inject } from './utils/inject';

initializeApp();

const executableFactory = inject(CloudExecuteFactory, new CloudStorage());
const defaultFileName = process.env.CF_EXTERNAL_FILE_NAME as string;
const defaultBucket = process.env.GCLOUD_BUCKET_NAME as string;

/**
 * Cloud function that executes a GCS-hosted script
 */
export const cfExecute = onRequest((request, response) => {
  logger.info('Executing the function...', { structuredData: true });

  const fileName = (request.query.fileName as string) || defaultFileName;
  const bucketName = (request.query.bucket as string) || defaultBucket;

  executableFactory
    .create$(fileName, bucketName)
    .pipe(switchMap((obj) => from(obj.main())))
    .subscribe({
      next: (result) => {
        response.send(result);
      },
      error: (error) => {
        logger.error('Error executing the function', error, {
          structuredData: true,
        });
        response.status(500).send('Error executing the function, see logs.');
      },
      complete: () => {
        logger.info('Function executed!', { structuredData: true });
      },
    });
});
