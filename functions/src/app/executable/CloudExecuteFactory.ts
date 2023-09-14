import { Cache } from 'cache-manager';
import { requireFromString } from 'module-from-string';
import { Observable, from, lastValueFrom, map, of, switchMap, tap } from 'rxjs';
import { IsNotExecutableError } from '../errors/IsNotExecutableError.js';
import { IStorage } from '../storage/IStorage.js';
import { IExecutable } from './IExecutable.js';
import { IExecuteFactory } from './IExecuteFactory.js';

/**
 * Factory that creates Executable objects from js files hosted in GCS
 */
export class CloudExecuteFactory implements IExecuteFactory {
  constructor(
    private readonly storage: IStorage,
    private readonly cache: Cache,
  ) {}

  /**
   * Creates an Executable object from a js file hosted in GCS
   */
  create$(fileName: string, bucket?: string): Observable<IExecutable> {
    const getCached = this.cache.get<string>(`${bucket}-${fileName}`);

    return from(getCached).pipe(
      switchMap((value) => {
        if (value) {
          return of(value);
        }
        return this.storage.getFile$(fileName, bucket).pipe(
          switchMap((file) => file.text()),
          tap((text) => this.cache.set(`${bucket}-${fileName}`, text)),
        );
      }),
      map((value) => {
        const obj = requireFromString(value, {
          useCurrentGlobal: true,
        }) as IExecutable;

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

  async clearCache() {
    await this.cache.reset();
  }
}
