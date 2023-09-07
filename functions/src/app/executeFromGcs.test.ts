import { DownloadError } from './errors/DownloadError';
import { executeFromGcs } from './executeFromGcs';
import { JsParserError } from './errors/JsParserError';
import { describe, expect, it, vitest } from 'vitest';
import * as contentModule from './getContent';

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
    // Arrange
    const expected = new JsParserError('Error evaluating the GCS-Hosted file');

    // Mock the getContent function to return invalid script content
    vitest
      .spyOn(contentModule, 'getContent')
      .mockResolvedValueOnce('invalid script content');

    // Act
    const action = async () => await executeFromGcs();

    // Assert
    await expect(action).rejects.toThrow(expected);
  });
});
