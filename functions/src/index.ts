import { initializeApp } from 'firebase-admin/app';
import * as logger from 'firebase-functions/logger';
import { onRequest } from 'firebase-functions/v2/https';
import { CloudExecuteFactory } from './app/executable/CloudExecuteFactory';
import { CloudStorage } from './app/storage/CloudStorage';
import { inject } from './utils/inject';
import { of, switchMap } from 'rxjs';

initializeApp();

const executableFactory = inject(CloudExecuteFactory, new CloudStorage());
const defaultFileName = process.env.CF_EXTERNAL_FILE_NAME as string;

/**
 * Cloud function that executes a GCS-hosted script
 */
export const cfExecute = onRequest((request, response) => {
  logger.info('Executing the function...', { structuredData: true });

  executableFactory
    .create$((request.query.fileName as string) || defaultFileName)
    .pipe(switchMap((obj) => of(obj.main())))
    .subscribe({
      next: (result) => {
        // send the response
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
