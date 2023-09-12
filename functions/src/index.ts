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
import { TempManager } from './app/temp/TempManager';
import { TempExecuteFactory } from './app/executable/TempExecuteFactory';

initializeApp();

const storage = new CloudStorage();
const cloudExecute = new CloudExecuteFactory(storage);
const tempManager = new TempManager(storage);
const tempExecute = new TempExecuteFactory(tempManager);

const defaultFileName = process.env.CF_EXTERNAL_FILE_NAME as string;
const defaultBucket = process.env.GCLOUD_BUCKET_NAME as string;

tempManager
  .syncFolder()
  .then(() => {
    logger.info('Folder synced!');
  })
  .catch((error) => {
    logger.error('Error syncing folder', error);
  });

export const cfLocalExecute = onRequest(async (request, response) => {
  logger.info('Executing the function...');
  const fileName = (request.query.fileName as string) || defaultFileName;
  const obj = await tempExecute.create(fileName);
  const result = await obj.main();
  response.send(result);
  logger.info('Function executed!');
});

/**
 * Cloud function that executes a GCS-hosted script
 */
export const cfExecute = onRequest((request, response) => {
  logger.info('Executing the function...');

  const fileName = (request.query.fileName as string) || defaultFileName;
  const bucketName = (request.query.bucket as string) || defaultBucket;

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

export const downloadFile = onObjectFinalized(
  { bucket: defaultBucket },
  async (event) => {
    try {
      await tempManager.writeFile({
        fileName: event.data.name,
        bucketName: event.data.bucket,
      });
    } catch (e) {
      logger.error(`Error downloading file ${event.data.name}`, e);
    }
  },
);

export const deleteFile = onObjectDeleted(
  { bucket: defaultBucket },
  async (event) => {
    try {
      await tempManager.deleteFile({ fileName: event.data.name });
    } catch (e) {
      logger.error(`Error downloading file ${event.data.name}`, e);
    }
  },
);
