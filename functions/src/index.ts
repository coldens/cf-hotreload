/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
import { initializeApp } from 'firebase-admin/app';
import * as logger from 'firebase-functions/logger';
import { onRequest } from 'firebase-functions/v2/https';
import { executeFromGcs } from './app/executeFromGcs';

initializeApp();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const cfExecute = onRequest(async (request, response) => {
  logger.info('Hello logs!', { structuredData: true });

  const moduleObj = await executeFromGcs();

  // send the response
  response.send(moduleObj.main());
});
