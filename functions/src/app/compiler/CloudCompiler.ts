import * as esbuild from 'esbuild';
import { mkdir, readFile } from 'node:fs/promises';
import path = require('node:path');
import { COMPILED_FILE_NAME } from '../../consts/COMPILED_FILE_NAME.js';
import { CompileError } from '../errors/CompileError.js';
import { UploadError } from '../errors/UploadError.js';
import { getStorage } from 'firebase-admin/storage';
import { rimraf } from 'rimraf';

export class CloudCompiler {
  readonly parent = path.resolve('./hot-reload');
  readonly destination = path.join(this.parent, '/source');
  readonly sourceFile = path.join(this.destination, '/index.js');
  readonly outFile = path.join(this.parent, '/out/' + COMPILED_FILE_NAME);

  constructor(private readonly bucket = getStorage().bucket()) {}

  async compile() {
    try {
      const result = await esbuild.build({
        entryPoints: [this.sourceFile],
        bundle: true,
        outfile: this.outFile,
        platform: 'node',
        target: 'node18',
        format: 'cjs',
        packages: 'external',
        sourcemap: false,
        minify: false,
      });

      return result;
    } catch (err) {
      throw new CompileError('Failed to compile', err as Error);
    }
  }

  async download() {
    try {
      const files = await this.bucket.getFiles({ prefix: 'source/' });
      await rimraf(this.parent);
      await mkdir(this.destination, { recursive: true });

      for (const file of files[0]) {
        if (file.name.endsWith('.js')) {
          await file.download({
            destination: path.join(this.parent, file.name),
          });
        }
      }
    } catch (err) {
      throw new UploadError('Failed to upload', err as Error);
    }
  }

  async upload() {
    try {
      const compiledFile = this.outFile;
      const fileData = await readFile(compiledFile);
      await this.bucket.file('out/' + COMPILED_FILE_NAME).save(fileData);
    } catch (err) {
      throw new UploadError('Failed to upload', err as Error);
    }
  }
}
