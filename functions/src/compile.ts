import * as logger from 'firebase-functions/logger';
import { catchError, from, lastValueFrom, switchMap } from 'rxjs';
import { CloudCompiler } from './app/compiler/CloudCompiler.js';

/**
 * Syncs the source code from the bucket and compiles it, then uploads it to the bucket
 */
export async function syncAndCompile(compiler = new CloudCompiler()) {
  const observe = from(compiler.download()).pipe(
    switchMap(async () => compiler.compile()),
    switchMap(async () => compiler.upload()),
    catchError((error) => {
      logger.error(`Error syncing and compiling`, error);
      throw error;
    }),
  );

  return lastValueFrom(observe);
}
