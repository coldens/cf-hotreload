import { DownloadError } from '@/app/errors/DownloadError';
import { CloudStorage } from '@/app/storage/CloudStorage';
import { StorageFile } from '@/app/storage/StorageFile';
import { Storage } from 'firebase-admin/storage';
import { lastValueFrom } from 'rxjs';
import { describe, expect, it, vitest } from 'vitest';

describe('CloudStorage', () => {
  const mockBucket = {
    file: vitest.fn(),
  };
  const mockStorage = {
    bucket: vitest.fn().mockReturnValue(mockBucket),
  };

  const cloudStorage: CloudStorage = new CloudStorage(
    mockStorage as unknown as Storage,
  );

  describe('getFile$', () => {
    it('should return a buffer of the file content', async () => {
      const mockDownload = new StorageFile(
        [Buffer.from('test content')],
        'test-file',
      );
      const mockFile = {
        download: vitest.fn().mockResolvedValue([mockDownload]),
      };
      mockBucket.file.mockReturnValue(mockFile);

      const result = await lastValueFrom(cloudStorage.getFile$('test-file'));
      expect(result).toEqual(mockDownload);
    });

    it('should throw a DownloadError if the file download fails', async () => {
      const mockError = new Error('test error');
      const mockFile = {
        download: vitest.fn().mockRejectedValue(mockError),
      };
      mockBucket.file.mockReturnValue(mockFile);

      const result = () => lastValueFrom(cloudStorage.getFile$('test-file'));
      await expect(result).rejects.toBeInstanceOf(DownloadError);
    });
  });

  describe('getFile', () => {
    it('should return a promise that resolves to a buffer of the file content', async () => {
      const mockDownload = new StorageFile(
        [Buffer.from('test content')],
        'test-file',
      );
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

      const result = () => cloudStorage.getFile('test-file');
      await expect(result).rejects.toBeInstanceOf(DownloadError);
    });
  });
});
