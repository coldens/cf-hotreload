import { DownloadError } from '@/app/errors/DownloadError';
import { CloudStorage } from '@/app/storage/CloudStorage';
import { StorageFile } from '@/app/storage/StorageFile';
import { Storage } from 'firebase-admin/storage';
import { lastValueFrom, of } from 'rxjs';
import { beforeEach, describe, expect, it, vitest } from 'vitest';

describe('CloudStorage', () => {
  const mockBucket = {
    file: vitest.fn(),
    getFiles: vitest.fn(),
  };
  const mockStorage = {
    bucket: vitest.fn().mockReturnValue(mockBucket),
  };
  let cloudStorage: CloudStorage;

  beforeEach(() => {
    cloudStorage = new CloudStorage(mockStorage as unknown as Storage);
  });

  describe('getFile$', () => {
    it('should return a buffer of the file content', async () => {
      const mockDownload = [Buffer.from('test content')];
      const expected = new StorageFile(mockDownload, 'test-file');

      const mockFile = {
        download: vitest.fn().mockResolvedValue([mockDownload]),
      };
      mockBucket.file.mockReturnValue(mockFile);

      const result = await lastValueFrom(cloudStorage.getFile$('test-file'));

      expect(result).toEqual(expected);
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

  describe('getFiles$', () => {
    it('should return an empty array if no files are found', async () => {
      mockBucket.getFiles.mockResolvedValueOnce([[]]);

      const files = await lastValueFrom(cloudStorage.getFiles$());
      expect(files).toEqual([]);
    });

    it('should return an array of StorageFile objects if files are found', async () => {
      const values = [
        {
          download: vitest
            .fn()
            .mockResolvedValueOnce([Buffer.from('fake-file-content')]),
          name: 'fake-file.txt',
        },
        {
          download: vitest
            .fn()
            .mockResolvedValueOnce([Buffer.from('fake-file-content')]),
          name: 'fake-file1.txt',
        },
        {
          download: vitest
            .fn()
            .mockResolvedValueOnce([Buffer.from('fake-file-content')]),
          name: 'fake-file2.txt',
        },
        {
          download: vitest
            .fn()
            .mockResolvedValueOnce([Buffer.from('fake-file-content')]),
          name: 'fake-file3.txt',
        },
      ];
      const expeted = [
        new StorageFile([Buffer.from('fake-file-content')], 'fake-file.txt'),
        new StorageFile([Buffer.from('fake-file-content')], 'fake-file1.txt'),
        new StorageFile([Buffer.from('fake-file-content')], 'fake-file2.txt'),
        new StorageFile([Buffer.from('fake-file-content')], 'fake-file3.txt'),
      ];
      mockBucket.getFiles.mockResolvedValueOnce([values]);

      const files = await lastValueFrom(cloudStorage.getFiles$());
      expect(files).toEqual(expeted);
    });

    it('should throw a DownloadError if there is an error getting the files', async () => {
      mockBucket.getFiles.mockRejectedValue(new Error('fake-error'));

      const operation = () => lastValueFrom(cloudStorage.getFiles$());

      await expect(operation).rejects.toBeInstanceOf(DownloadError);
      await expect(operation).rejects.toThrow(
        'Error getting the files from the GCS bucket',
      );
    });

    it('should throw a DownloadError if there is an error downloading a file', async () => {
      const fakeFile = {
        name: 'fake-file.txt',
        download: () => Promise.reject(new Error('fake-error')),
      };
      mockBucket.getFiles.mockResolvedValueOnce([[fakeFile]]);

      const operation = () => lastValueFrom(cloudStorage.getFiles$());
      await expect(operation).rejects.toBeInstanceOf(DownloadError);
      await expect(operation).rejects.toThrow(
        'Error getting the files from the GCS bucket',
      );
    });
  });

  describe('getFiles', () => {
    it('should return a promise that resolves to an array of StorageFile objects', async () => {
      const values = [
        new StorageFile([Buffer.from('fake-file-content')], 'fake-file.txt'),
        new StorageFile([Buffer.from('fake-file-content')], 'fake-file1.txt'),
        new StorageFile([Buffer.from('fake-file-content')], 'fake-file2.txt'),
        new StorageFile([Buffer.from('fake-file-content')], 'fake-file3.txt'),
      ];

      vitest.spyOn(cloudStorage, 'getFiles$').mockReturnValueOnce(of(values));
      const files = await cloudStorage.getFiles();

      expect(files).toEqual(values);
    });
  });
});
