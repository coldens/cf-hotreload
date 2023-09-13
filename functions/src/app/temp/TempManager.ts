import path = require('node:path');
import { existsSync } from 'node:fs';
import { mkdir, rm, unlink, writeFile } from 'node:fs/promises';
import { IStorage } from '../storage/IStorage';
import { tmpdir } from 'node:os';
import * as logger from 'firebase-functions/logger';

type FileParams = {
  fileName: string;
  fileContent?: string;
  bucketName?: string;
};

export class TempManager {
  readonly tempFolder = path.join(tmpdir(), '/hot-reload');

  constructor(private readonly storage: IStorage) {}

  getFilePath(fileName: string) {
    return path.join(this.tempFolder, fileName);
  }

  async writeFile({ fileName, bucketName, fileContent }: FileParams) {
    const file = await this.storage.getFile(fileName, bucketName);
    const filePath = this.getFilePath(fileName);

    // validate if directory exists
    if (!existsSync(this.tempFolder)) {
      await mkdir(this.tempFolder);
    }

    await writeFile(filePath, fileContent ?? file.stream());
    logger.info('File written', { fileName });
  }

  async deleteFile({ fileName }: FileParams) {
    const filePath = this.getFilePath(fileName);
    await unlink(filePath);
    logger.info('File deleted', { fileName });
  }

  async syncFolder() {
    const files = await this.storage.getFiles();
    await rm(this.tempFolder, { recursive: true, force: true });

    for (const file of files) {
      const fileContent = await file.text();
      await this.writeFile({ fileName: file.fileName, fileContent });
    }
  }
}
