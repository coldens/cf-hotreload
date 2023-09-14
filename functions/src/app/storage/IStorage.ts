import { Observable } from 'rxjs';
import { StorageFile } from './StorageFile.js';

export interface IStorage {
  getFile(fileName: string, bucket?: string): Promise<StorageFile>;
  getFile$(fileName: string, bucket?: string): Observable<StorageFile>;
  getFiles(prefix?: string, bucket?: string): Promise<StorageFile[]>;
  getFiles$(prefix?: string, bucket?: string): Observable<StorageFile[]>;
}
