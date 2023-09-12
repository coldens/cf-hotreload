import { Observable } from 'rxjs';
import { StorageFile } from './StorageFile';

export interface IStorage {
  getFile(fileName: string, bucket?: string): Promise<StorageFile>;
  getFile$(fileName: string, bucket?: string): Observable<StorageFile>;
  getFiles(bucket?: string): Promise<StorageFile[]>;
  getFiles$(bucket?: string): Observable<StorageFile[]>;
}
