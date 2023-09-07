export class JsParserError extends Error {
  constructor(message: string, cause?: Error) {
    super(message, { cause });
    this.name = 'EvalError';
  }
}
