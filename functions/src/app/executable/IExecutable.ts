/**
 * This interface is used to ensure that the module object returned by eval implements the main function.
 */
export interface IExecutable {
  main: (data: Record<string, any>) => Promise<unknown>;
}
