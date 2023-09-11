import { Observable } from 'rxjs';

export interface IExecuteFactory<T> {
  create$: (fileName: string, bucket?: string) => Observable<T>;
  create: (fileName: string, bucket?: string) => Promise<T>;
}
