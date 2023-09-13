import { Observable, lastValueFrom, map, of, switchMap, tap } from 'rxjs';
import { IsNotExecutableError } from '../errors/IsNotExecutableError';
import { IStorage } from '../storage/IStorage';
import { IExecutable } from './IExecutable';
import { IExecuteFactory } from './IExecuteFactory';
import { DEFAULT_KEY } from '../../consts/DEFAULT_KEY';

type CacheType = Record<string, Record<string, string>>;

/**
 * Factory that creates Executable objects from js files hosted in GCS
 */
export class CloudExecuteFactory implements IExecuteFactory {
  private cache: CacheType = {
    [DEFAULT_KEY]: {},
  };

  constructor(private readonly storage: IStorage) {}

  /**
   * Creates an Executable object from a js file hosted in GCS
   */
  create$(fileName: string, bucket?: string): Observable<IExecutable> {
    return this.getCache$(fileName, bucket).pipe(
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

  clearCache(): void {
    this.cache = {
      [DEFAULT_KEY]: {},
    };
  }

  private setCache(fileName: string, value: string, bucket?: string) {
    const bucketName = bucket || DEFAULT_KEY;

    if (!this.cache[bucketName]) {
      this.cache[bucketName] = {};
    }

    this.cache[bucketName][fileName] = value;
  }

  private getCache$(fileName: string, bucket?: string): Observable<string> {
    const bucketName = bucket || DEFAULT_KEY;

    if (this.cache[bucketName][fileName]) {
      return of(this.cache[bucketName][fileName]);
    }

    return this.storage.getFile$(fileName, bucket).pipe(
      switchMap((value) => value.text()),
      tap((value) => this.setCache(fileName, value, bucket)),
    );
  }
}
