import { initializeApp } from 'firebase-admin/app';
import * as logger from 'firebase-functions/logger';
import { onRequest } from 'firebase-functions/v2/https';
import { ExecutableFactory } from './app/factory/ExecutableFactory';
import { CloudStorage } from './app/storage/CloudStorage';
import { inject } from './utils/inject';

initializeApp();

const executableFactory = inject(ExecutableFactory, new CloudStorage());
const defaultFileName = process.env.CF_EXTERNAL_FILE_NAME as string;

/**
 * Cloud function that executes a GCS-hosted script
 */
export const cfExecute = onRequest((request, response) => {
  logger.info('Executing the function...', { structuredData: true });

  executableFactory
    .create$((request.query.fileName as string) || defaultFileName)
    .subscribe({
      next: async (moduleObj) => {
        // send the response
        response.send(await moduleObj.main());
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
