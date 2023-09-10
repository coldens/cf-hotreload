import { DownloadError } from '@/app/errors/DownloadError';
import { CloudStorage } from '@/app/storage/CloudStorage';
import { Storage } from 'firebase-admin/storage';
import { describe, expect, it, vitest } from 'vitest';

describe('CloudStorage', () => {
  const mockBucket = {
    file: vitest.fn(),
  };
  const mockStorage = {
    bucket: vitest.fn().mockReturnValue(mockBucket),
  };

  const cloudStorage: CloudStorage = new CloudStorage(
    undefined,
    () => mockStorage as unknown as Storage,
  );

  describe('getFile$', () => {
    it('should return a buffer of the file content', () =>
      new Promise<void>((done) => {
        const mockDownload = Buffer.from('test content');
        const mockFile = {
          download: vitest.fn().mockResolvedValue([mockDownload]),
        };
        mockBucket.file.mockReturnValue(mockFile);

        cloudStorage.getFile$('test-file').subscribe((result) => {
          expect(result).toEqual(mockDownload);
          done();
        });
      }));

    it('should throw a DownloadError if the file download fails', () =>
      new Promise<void>((done) => {
        const mockError = new Error('test error');
        const mockFile = {
          download: vitest.fn().mockRejectedValue(mockError),
        };
        mockBucket.file.mockReturnValue(mockFile);

        cloudStorage.getFile$('test-file').subscribe({
          error: (error) => {
            expect(error).toBeInstanceOf(DownloadError);
            expect(error.cause).toBe(mockError);
            done();
          },
        });
      }));
  });

  describe('getFile', () => {
    it('should return a promise that resolves to a buffer of the file content', async () => {
      const mockDownload = Buffer.from('test content');
      const mockFile = {
        download: vitest.fn().mockResolvedValue([mockDownload]),
      };
      mockBucket.file.mockReturnValue(mockFile);

      const result = await cloudStorage.getFile('test-file');
      expect(result).toEqual(mockDownload);
    });

    it('should reject the promise if the file download fails', async () => {
      const mockError = new Error('test error');
      const mockFile = {
        download: vitest.fn().mockRejectedValue(mockError),
      };
      mockBucket.file.mockReturnValue(mockFile);

      await expect(cloudStorage.getFile('test-file')).rejects.toBeInstanceOf(
        DownloadError,
      );
    });
  });
});
