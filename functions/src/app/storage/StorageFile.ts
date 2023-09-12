import { Blob, Buffer } from 'node:buffer';

export class StorageFile extends Blob {
  public readonly fileName: string;

  constructor(sources: Array<Buffer>, fileName: string) {
    super(sources);
    this.fileName = fileName;
  }
}
