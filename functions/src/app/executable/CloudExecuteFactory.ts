import { Observable, lastValueFrom, map } from 'rxjs';
import { IsNotExecutableError } from '../errors/IsNotExecutableError';
import { IStorage } from '../storage/IStorage';
import { IExecutable } from './IExecutable';
import { IExecuteFactory } from './IExecuteFactory';

/**
 * Factory that creates Executable objects from js files hosted in GCS
 */
export class CloudExecuteFactory implements IExecuteFactory<IExecutable> {
  constructor(private readonly storage: IStorage) {}

  /**
   * Creates an Executable object from a js file hosted in GCS
   */
  create$(fileName: string, bucket?: string): Observable<IExecutable> {
    return this.storage.getFile$(fileName, bucket).pipe(
      map((value) => value.toString('utf-8')),
      map((value) => {
        const obj: IExecutable = eval(value);

        if (typeof obj.main !== 'function') {
          throw new IsNotExecutableError(
            'The module does not implement the Executable interface',
          );
        }

        return obj;
      }),
    );
  }

  /**
   * Promise wrapper for create$
   */
  create(fileName: string, bucket?: string): Promise<IExecutable> {
    return lastValueFrom(this.create$(fileName, bucket));
  }
}
