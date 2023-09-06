/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import * as logger from 'firebase-functions/logger';
import { getStorage } from 'firebase-admin/storage';

initializeApp();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = onRequest(async (request, response) => {
  logger.info('Hello logs!', { structuredData: true });

  /**
   * Get a reference to the storage service, which is used to create references in your storage bucket
   */
  const bucket = getStorage().bucket();

  /**
   * Get a reference to the file you want to download
   */
  const file = bucket.file('hello-from-storage.js');

  /**
   * Create a reference to a local file
   */
  const content = await file.download().catch((error) => {
    logger.error(error);
  });

  if (content === undefined) {
    response.send('Error loading the GCS-Hosted file');
    return;
  }

  // Convert the buffer to a string
  const value = content[0].toString('utf-8');

  // eval the string to get the module object
  const moduleObj = eval(value);

  logger.info(moduleObj, { structuredData: true });

  // send the response
  response.send(moduleObj.main());
});
