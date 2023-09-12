import { Observable } from 'rxjs';

export interface IExecuteFactory<T> {
  /**
   * Creates an executable object from a file
   */
  create$: (fileName: string, bucket?: string) => Observable<T>;

  /**
   * Wraps create$ in a promise
   */
  create: (fileName: string, bucket?: string) => Promise<T>;
}
