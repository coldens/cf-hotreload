import { Observable } from 'rxjs';

export interface IStorage {
  getFile(fileName: string, bucket?: string): Promise<Buffer>;
  getFile$(fileName: string, bucket?: string): Observable<Buffer>;
}
