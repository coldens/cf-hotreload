import { CloudCompiler } from '@/app/compiler/CloudCompiler';
import {
  Mock,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vitest,
} from 'vitest';
import * as esbuild from 'esbuild';
import { DownloadError } from '@/app/errors/DownloadError';
import { COMPILED_FILE_NAME } from '@/consts/COMPILED_FILE_NAME';
import { UploadError } from '@/app/errors/UploadError';

describe('CloudCompiler', () => {
  let bucket: {
    getFiles: Mock;
    file: Mock;
  };
  let compiler: CloudCompiler;

  beforeEach(() => {
    vitest.mock('node:fs/promises', () => ({
      readFile: vitest.fn().mockResolvedValueOnce(''),
      mkdir: vitest.fn().mockResolvedValueOnce(''),
    }));

    vitest.mock('esbuild', () => ({
      build: vitest
        .fn()
        .mockImplementation(async (settings) => ({ ...settings })),
    }));

    bucket = {
      getFiles: vitest.fn(),
      file: vitest.fn(),
    };

    compiler = new CloudCompiler(bucket as any);
  });

  afterEach(() => {
    vitest.resetAllMocks();
  });

  describe('compile', () => {
    it('should compile the source file', async () => {
      const result = await compiler.compile();
      expect(result).toEqual({
        entryPoints: expect.any(Array),
        bundle: true,
        outfile: expect.stringContaining('.js'),
        platform: 'node',
        target: 'node18',
        format: 'cjs',
        packages: 'external',
        sourcemap: false,
        minify: false,
      });
    });

    it('should throw a CompileError if compilation fails', async () => {
      vitest.mocked(esbuild.build).mockRejectedValueOnce(new Error('Failed'));
      await expect(compiler.compile()).rejects.toThrow('Failed');
    });
  });

  describe('download', () => {
    it('should download the source files from the bucket', async () => {
      bucket.getFiles.mockResolvedValueOnce([[]]);

      await compiler.download();
      expect(bucket.getFiles).toHaveBeenCalledWith({ prefix: 'source/' });
    });

    it('should throw an DownloadError if downloading fails', async () => {
      bucket.getFiles.mockRejectedValueOnce(new Error('Failed to get files'));
      await expect(compiler.download()).rejects.toBeInstanceOf(DownloadError);
    });

    it('should throw an DownloadError if one of the files fails to download', async () => {
      bucket.getFiles.mockResolvedValueOnce([
        [
          {
            name: 'source/index.js',
            download: vitest.fn().mockRejectedValueOnce(new Error('Failed')),
          },
        ],
      ]);

      await expect(compiler.download()).rejects.toBeInstanceOf(DownloadError);
    });
  });

  describe('upload', () => {
    it('should upload the compiled file to the bucket', async () => {
      bucket.file.mockReturnValueOnce({
        save: vitest.fn().mockResolvedValueOnce([[]]),
      });

      await expect(compiler.upload()).resolves.toBeUndefined();
      expect(bucket.file).toHaveBeenCalledWith('out/' + COMPILED_FILE_NAME);
    });

    it('should throw a UploadError if uploading fails', async () => {
      bucket.file.mockReturnValueOnce({
        save: vitest.fn().mockRejectedValueOnce(new Error('Failed')),
      });

      await expect(compiler.upload()).rejects.toBeInstanceOf(UploadError);
    });
  });
});
