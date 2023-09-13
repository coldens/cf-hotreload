/**
 * Error thrown when a download fails.
 */
export class CompileError extends Error {
  constructor(message: string, cause?: Error) {
    super(message, { cause });
    this.name = 'CompileError';
  }
}
