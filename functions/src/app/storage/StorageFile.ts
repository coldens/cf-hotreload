import { Blob, Buffer } from 'node:buffer';
import { BinaryLike } from 'node:crypto';

export class StorageFile extends Blob {
  public readonly fileName: string;

  constructor(sources: Array<BinaryLike | Blob | Buffer>, fileName: string) {
    super(sources);
    this.fileName = fileName;
  }
}
