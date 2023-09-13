/**
 * Error thrown when a download fails.
 */
export class UploadError extends Error {
  constructor(message: string, cause?: Error) {
    super(message, { cause });
    this.name = 'UploadError';
  }
}
