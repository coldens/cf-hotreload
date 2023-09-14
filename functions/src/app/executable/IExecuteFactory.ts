import { Observable } from 'rxjs';
import { IExecutable } from './IExecutable.js';

export interface IExecuteFactory {
  /**
   * Creates an executable object from a file
   */
  create$(fileName: string, bucket?: string): Observable<IExecutable>;

  /**
   * Wraps create$ in a promise
   */
  create(fileName: string, bucket?: string): Promise<IExecutable>;

  clearCache(): Promise<void>;
}
