import { Observable, lastValueFrom, map } from 'rxjs';
import { Executable } from '../contracts/Executable';
import { IStorage } from '../contracts/IStorage';
import { IsNotExecutableError } from '../errors/IsNotExecutableError';

/**
 * Factory to create Executable instances from files in GCS
 */
export class ExecutableFactory {
  constructor(private readonly storage: IStorage) {}

  create$(fileName: string, bucket?: string): Observable<Executable> {
    return this.storage.getFile$(fileName, bucket).pipe(
      map((value) => value.toString('utf-8')),
      map((value) => {
        const obj = eval(value);

        if (typeof obj.main !== 'function') {
          throw new IsNotExecutableError(
            'The module does not implement the Executable interface',
          );
        }

        return obj;
      }),
    );
  }

  create(fileName: string, bucket?: string): Promise<Executable> {
    return lastValueFrom(this.create$(fileName, bucket));
  }
}
