/**
 * Error thrown when an object does not implement the {@link Executable} interface
 */
export class IsNotExecutableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IsNotExecutableError';
  }
}
