import * as logger from 'firebase-functions/logger';
import { CloudCompiler } from './app/compiler/CloudCompiler';
import { CloudStorage } from './app/storage/CloudStorage';

/**
 * compile and upload a file to GCS
 */
export async function compile() {
  const compiler = new CloudCompiler(new CloudStorage());

  try {
    logger.info(`Compiling...`);
    await compiler.compile();
  } catch (error) {
    logger.error(`Error compiling`, error);
  }

  try {
    await compiler.upload();
    logger.info(`Uploaded!`);
  } catch (error) {
    logger.error(`Error uploading`, error);
  }
}
