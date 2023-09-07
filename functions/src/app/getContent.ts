import { getStorage } from 'firebase-admin/storage';
import { DownloadError } from './errors/DownloadError';

/**
 * This function gets the content of a file in GCS and returns it as a string
 *
 * @param {string} fileName The name of the file to get the value of
 */
export const getContent = async (fileName: string): Promise<string> => {
  /**
   * Get a reference to the storage service, which is used to create references in your storage bucket
   */
  const bucket = getStorage().bucket();

  /**
   * Get a reference to the file you want to download
   */
  const file = bucket.file(fileName);

  const content = await (async () => {
    try {
      const download = await file.download();
      // Convert the buffer to a string
      return download[0].toString('utf-8');
    } catch (error) {
      throw new DownloadError(
        'Error loading the GCS-Hosted file',
        error as Error,
      );
    }
  })();

  return content;
};
