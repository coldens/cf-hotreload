import * as logger from 'firebase-functions/logger';
import { TempManager } from './app/temp/TempManager';
import { CloudStorage } from './app/storage/CloudStorage';

export async function syncFolder() {
  const storage = new CloudStorage();
  const tempManager = new TempManager(storage);

  try {
    await tempManager.syncFolder();
    logger.info('Folder synced!');
  } catch (error) {
    logger.error('Error syncing folder', error);
  }
}
