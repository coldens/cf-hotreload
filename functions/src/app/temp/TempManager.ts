/* eslint-disable @typescript-eslint/no-unused-vars */
import path = require('node:path');
import { mkdir, rm, unlink, writeFile } from 'node:fs/promises';
import { IStorage } from '../storage/IStorage';
import * as logger from 'firebase-functions/logger';

type FileParams = {
  fileName: string;
  fileContent?: string;
  bucketName?: string;
};

type WriteParams = FileParams & {
  fileContent: string;
};

export class TempManager {
  readonly tempFolder = path.resolve('./hot-reload');
  readonly sourceFolder = path.join(this.tempFolder, './source');

  constructor(private readonly storage: IStorage) {}

  getFilePath(fileName: string) {
    return path.join(this.sourceFolder, fileName);
  }

  async writeFile({ fileName, fileContent }: WriteParams) {
    const filePath = this.getFilePath(fileName);
    try {
      await writeFile(filePath, fileContent, {
        encoding: 'utf-8',
      });

      logger.info('File written', { fileName });
    } catch (error) {
      logger.error('Error writing file', { fileName, fileContent }, error);
      throw error;
    }
  }

  async deleteFile({ fileName }: FileParams) {
    const filePath = this.getFilePath(fileName);
    await unlink(filePath);
    logger.info('File deleted', { fileName });
  }

  async syncFolder() {
    const files = await this.storage.getFiles('source/');

    // Delete temporal folder if it exists
    await rm(this.tempFolder, { recursive: true, force: true });
    await mkdir(this.tempFolder);
    await mkdir(this.sourceFolder);

    for (const file of files) {
      const fileContent = await file.text();

      if (fileContent && file.fileName) {
        await this.writeFile({ fileName: file.fileName, fileContent });
      }
    }
  }
}
