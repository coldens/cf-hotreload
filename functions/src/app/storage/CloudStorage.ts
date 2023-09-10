import { App } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { Observable, catchError, from, lastValueFrom, map } from 'rxjs';
import { DownloadError } from '../errors/DownloadError';
import { IStorage } from './IStorage';

/**
 * This class is a wrapper around the firebase-admin/storage module
 * to get files from GCS.
 */
export class CloudStorage implements IStorage {
  private readonly storage: ReturnType<typeof getStorage>;

  constructor(app?: App, getStorageFn = getStorage) {
    this.storage = getStorageFn(app);
  }

  /**
   * This function gets the content of a file in GCS and returns it as a buffer
   */
  getFile$(fileName: string, buckeName?: string): Observable<Buffer> {
    const bucket = this.getBucket(buckeName);
    const file = bucket.file(fileName);

    return from(file.download()).pipe(
      catchError((error) => {
        throw new DownloadError(
          'Error downloading the GCS-Hosted file',
          error as Error,
        );
      }),
      map((download) => download[0]),
    );
  }

  /**
   * This function gets the content of a file in GCS and returns it as a buffer
   */
  getFile(fileName: string, buckeName?: string): Promise<Buffer> {
    return lastValueFrom(this.getFile$(fileName, buckeName));
  }

  private getBucket(name?: string) {
    return this.storage.bucket(name);
  }
}
