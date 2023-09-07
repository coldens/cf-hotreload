import { it, describe, vitest, expect, beforeEach, afterEach } from 'vitest';
import { getContent } from './getContent';
import { DownloadError } from './errors/DownloadError';

describe('getContent', async () => {
  beforeEach(() => {
    vitest.mock('firebase-admin/storage', () => ({
      getStorage: vitest.fn(() => ({
        bucket: vitest.fn(() => ({
          file: vitest.fn((fileName: string) => ({
            download: vitest.fn(() => {
              const values = {
                'hello-from-storage.js': () => [
                  Buffer.from('module.exports = () => "Hello from Storage!";'),
                ],
                'invalid.js': () => {
                  throw new Error('Invalid file');
                },
              };

              return values[fileName as keyof typeof values]();
            }),
          })),
        })),
      })),
    }));
  });

  afterEach(() => {
    vitest.restoreAllMocks();
  });

  it('should return the content of a file', async () => {
    const content = await getContent('hello-from-storage.js');
    expect(content).toBe(content);
  });

  it('should throw a DownloadError if the file cannot be downloaded', async () => {
    try {
      await getContent('invalid.js');
    } catch (error) {
      expect(error).toBeInstanceOf(DownloadError);
    }
  });
});
