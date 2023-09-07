import { JsParserError } from './errors/JsParserError';
import { Executable } from './contracts/Executable';
import { getContent } from './getContent';
import { IsNotExecutableError } from './errors/IsNotExecutableError';

/**
 * This function calls getContent to get a string from a file in GCS,
 * then it evals the string to get the module object and returns it.
 *
 * The module object must implement the {@link Executable} interface.
 */
export const executeFromGcs = async (): Promise<Executable> => {
  /**
   * Create a reference to a local file
   */
  const content = await getContent('hello-from-storage.js');

  try {
    // eval the string to get the module object
    const moduleObj: Executable = eval(content);

    // check if the module object implements the Executable interface
    if (typeof moduleObj.main !== 'function') {
      throw new IsNotExecutableError(
        'The module does not implement the Executable interface',
      );
    }

    return moduleObj;
  } catch (error) {
    if (error instanceof IsNotExecutableError) throw error;

    throw new JsParserError(
      'Error evaluating the GCS-Hosted file',
      error as Error,
    );
  }
};
