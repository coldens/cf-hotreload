import { getStorage } from 'firebase-admin/storage';
import {
  Observable,
  catchError,
  from,
  lastValueFrom,
  map,
  mergeMap,
  toArray,
} from 'rxjs';
import { DownloadError } from '../errors/DownloadError.js';
import { IStorage } from './IStorage.js';
import { StorageFile } from './StorageFile.js';

/**
 * This class is a wrapper around the firebase-admin/storage module
 * to get files from GCS.
 */
export class CloudStorage implements IStorage {
  constructor(private readonly storage = getStorage()) {}

  /**
   * Gets the content of a file in GCS and returns it as a buffer
   */
  getFile$(fileName: string, buckeName?: string): Observable<StorageFile> {
    const bucket = this.getBucket(buckeName);
    const file = bucket.file(fileName);

    return from(file.download()).pipe(
      catchError((error) => {
        throw new DownloadError(
          'Error downloading the GCS-Hosted file',
          error as Error,
        );
      }),
      map((download) => {
        return new StorageFile(download, fileName);
      }),
    );
  }

  /**
   * Gets all the files in a bucket
   *
   * @param {string|undefined} prefix - The prefix or directory to search for files. e.g. 'source/'
   * @param {string|undefined} buckeName - The name of the bucket to search for files. e.g. 'my-bucket'
   */
  getFiles$(prefix?: string, buckeName?: string): Observable<StorageFile[]> {
    const bucket = this.getBucket(buckeName);

    return from(bucket.getFiles({ prefix })).pipe(
      mergeMap((download) => from(download[0])),
      mergeMap(async (file) => {
        const download = await file.download();
        return new StorageFile(download, file.name.split('/').at(-1)!);
      }),
      catchError((error) => {
        throw new DownloadError(
          'Error getting the files from the GCS bucket',
          error as Error,
        );
      }),
      toArray(),
    );
  }

  /**
   * Wraps {@link getFiles$} in a promise
   */
  getFiles(prefix?: string, buckeName?: string): Promise<StorageFile[]> {
    return lastValueFrom(this.getFiles$(prefix, buckeName));
  }

  /**
   * Wraps {@link getFile$} in a promise
   */
  getFile(fileName: string, buckeName?: string): Promise<StorageFile> {
    return lastValueFrom(this.getFile$(fileName, buckeName));
  }

  private getBucket(name?: string) {
    return this.storage.bucket(name);
  }
}
