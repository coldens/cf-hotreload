/**
 * Error thrown when the JS parser fails to parse a JS string.
 */
export class JsParserError extends Error {
  constructor(message: string, cause?: Error) {
    super(message, { cause });
    this.name = 'JsParserError';
  }
}
