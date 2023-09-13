import * as esbuild from 'esbuild';
import path = require('node:path');
import { IStorage } from '../storage/IStorage';
import { readFile } from 'node:fs/promises';
import { StorageFile } from '../storage/StorageFile';
import { UploadError } from '../errors/UploadError';

export class CloudCompiler {
  readonly tempFolder = path.resolve('./hot-reload');

  constructor(private readonly storage: IStorage) {}

  async compile(fileName: string) {
    const sourceFile = path.join(this.tempFolder, './source', fileName);
    const outFile = path.join(this.tempFolder, './out', fileName);

    const result = await esbuild.build({
      entryPoints: [sourceFile],
      bundle: true,
      outfile: outFile,
      platform: 'node',
      target: 'node18',
      format: 'cjs',
      sourcemap: 'inline',
      packages: 'external',
      minify: true,
    });

    return result;
  }

  async upload(fileName: string) {
    try {
      const compiledFile = path.join(this.tempFolder, './out', fileName);
      const file = await readFile(compiledFile);
      const storageFile = new StorageFile([file], fileName);

      await this.storage.upload(storageFile, 'compiled');
    } catch (err) {
      throw new UploadError(`Failed to upload ${fileName}`, err as Error);
    }
  }
}
