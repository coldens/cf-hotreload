import { Observable, lastValueFrom, map, of } from 'rxjs';
import { IExecutable } from './IExecutable';
import { IExecuteFactory } from './IExecuteFactory';
import { TempManager } from '../temp/TempManager';

export class TempExecuteFactory implements IExecuteFactory {
  constructor(private readonly manager: TempManager) {}

  create$(fileName: string): Observable<IExecutable> {
    return of(this.manager.getFilePath(fileName)).pipe(
      map((filePath) => {
        const obj: IExecutable = require(filePath);
        return obj;
      }),
    );
  }

  create(fileName: string): Promise<IExecutable> {
    return lastValueFrom(this.create$(fileName));
  }
}
