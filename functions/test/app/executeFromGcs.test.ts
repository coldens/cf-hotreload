import { describe, expect, it, vitest } from 'vitest';
import { DownloadError } from '@/app/errors/DownloadError';
import { IsNotExecutableError } from '@/app/errors/IsNotExecutableError';
import { JsParserError } from '@/app/errors/JsParserError';
import { executeFromGcs } from '@/app/executeFromGcs';
import * as contentModule from '@/app/getContent';

describe('executeFromGcs', () => {
  it('should execute the script from GCS', async () => {
    vitest
      .spyOn(contentModule, 'getContent')
      .mockResolvedValueOnce(`module.exports = {main: () => 'Hello world!'};`);

    // Act
    const result = await executeFromGcs();

    // Assert
    expect(result).toBeTypeOf('object');
    expect(result.main()).toBe('Hello world!');
  });

  it('should throw a DownloadError if getContent throws an error', async () => {
    vitest
      .spyOn(contentModule, 'getContent')
      .mockRejectedValueOnce(new DownloadError('Error getting content'));

    // Assert
    await expect(executeFromGcs()).rejects.toThrow(DownloadError);
  });

  it('should throw an EvalError if eval throws an error', async () => {
    // Mock the getContent function to return invalid script content
    vitest
      .spyOn(contentModule, 'getContent')
      .mockResolvedValueOnce('invalid script content');

    // Act
    const action = async () => await executeFromGcs();

    // Assert
    await expect(action).rejects.toBeInstanceOf(JsParserError);
  });

  it('should throw an IsNotExecutableError if the module does not implement the Executable interface', async () => {
    // Mock the getContent function to return invalid script content
    vitest
      .spyOn(contentModule, 'getContent')
      .mockResolvedValueOnce(`module.exports = {main: 'invalid'}`);

    // Act
    const action = async () => await executeFromGcs();

    // Assert
    await expect(action).rejects.toBeInstanceOf(IsNotExecutableError);
  });
});
