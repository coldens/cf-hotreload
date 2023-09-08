import { initializeApp } from 'firebase-admin/app';
import * as logger from 'firebase-functions/logger';
import { onRequest } from 'firebase-functions/v2/https';
import { executeFromGcs } from './app/executeFromGcs';

initializeApp();

/**
 * Cloud function that executes a GCS-hosted script
 */
export const cfExecute = onRequest(async (request, response) => {
  logger.info('Executing the function...', { structuredData: true });

  try {
    const moduleObj = await executeFromGcs();
    // send the response
    response.send(moduleObj.main());
  } catch (error) {
    logger.error('Error executing the function', error, {
      structuredData: true,
    });
    response.status(500).send('Error executing the function, see logs.');
  }

  logger.info('Function executed!', { structuredData: true });
});
