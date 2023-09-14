import * as esbuild from 'esbuild';
import { readFile } from 'node:fs/promises';
import path = require('node:path');
import { COMPILED_FILE_NAME } from '../../consts/COMPILED_FILE_NAME';
import { CompileError } from '../errors/CompileError';
import { UploadError } from '../errors/UploadError';
import { IStorage } from '../storage/IStorage';
import { StorageFile } from '../storage/StorageFile';

export class CloudCompiler {
  readonly sourceFile = path.resolve('./hot-reload/source/index.js');
  readonly outFile = path.resolve(`./hot-reload/out/${COMPILED_FILE_NAME}`);

  constructor(private readonly storage: IStorage) {}

  async compile() {
    try {
      const result = await esbuild.build({
        entryPoints: [this.sourceFile],
        bundle: true,
        outfile: this.outFile,
        platform: 'node',
        target: 'node18',
        format: 'cjs',
        sourcemap: 'inline',
        packages: 'external',
        minify: true,
      });

      return result;
    } catch (err) {
      throw new CompileError('Failed to compile', err as Error);
    }
  }

  async upload() {
    try {
      const compiledFile = this.outFile;
      const file = await readFile(compiledFile);
      const storageFile = new StorageFile([file], COMPILED_FILE_NAME);

      await this.storage.upload(storageFile, 'compiled');
    } catch (err) {
      throw new UploadError('Failed to upload', err as Error);
    }
  }
}
