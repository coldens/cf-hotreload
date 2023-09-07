export class DownloadError extends Error {
  constructor(message: string, cause?: Error) {
    super(message, { cause });
    this.name = 'DownloadError';
  }
}
