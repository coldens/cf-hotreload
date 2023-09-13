import { readFile } from 'node:fs/promises';
import { Observable, lastValueFrom, of, switchMap } from 'rxjs';
import { TempManager } from '../temp/TempManager';
import { IExecutable } from './IExecutable';
import { IExecuteFactory } from './IExecuteFactory';

export class TempExecuteFactory implements IExecuteFactory {
  constructor(private readonly manager: TempManager) {}

  create$(fileName: string): Observable<IExecutable> {
    return of(this.manager.getFilePath(fileName)).pipe(
      switchMap(async (filePath) => {
        const value = await readFile(filePath, 'utf-8');
        const obj: IExecutable = eval(value);
        return obj;
      }),
    );
  }

  create(fileName: string): Promise<IExecutable> {
    return lastValueFrom(this.create$(fileName));
  }
}
