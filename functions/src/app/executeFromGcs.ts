import { JsParserError } from './errors/JsParserError';
import { Executable } from './contracts/Executable';
import { getContent } from './getContent';

/**
 * Function to execute a script from GCS
 */
export const executeFromGcs = async () => {
  /**
   * Create a reference to a local file
   */
  const content = await getContent('hello-from-storage.js');

  try {
    // eval the string to get the module object
    const moduleObj: Executable = eval(content);
    return moduleObj;
  } catch (error) {
    throw new JsParserError(
      'Error evaluating the GCS-Hosted file',
      error as Error,
    );
  }
};
