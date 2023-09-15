import { afterEach, beforeEach, describe, expect, it, vitest } from 'vitest';
import { CloudCompiler } from '../src/app/compiler/CloudCompiler.js';
import { syncAndCompile } from '../src/compile.js';

describe('syncAndCompile', () => {
  let compiler: CloudCompiler;

  beforeEach(() => {
    compiler = new CloudCompiler({} as any);
  });

  afterEach(() => {
    vitest.restoreAllMocks();
  });

  it('should download, compile, and upload the source code', async () => {
    // Arrange
    const downloadSpy = vitest
      .spyOn(compiler, 'download')
      .mockResolvedValue(undefined);
    const compileSpy = vitest
      .spyOn(compiler, 'compile')
      .mockResolvedValue({} as any);
    const uploadSpy = vitest
      .spyOn(compiler, 'upload')
      .mockResolvedValue(undefined);

    // Act
    await syncAndCompile(compiler);

    // Assert
    expect(downloadSpy).toHaveBeenCalledTimes(1);
    expect(compileSpy).toHaveBeenCalledTimes(1);
    expect(uploadSpy).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if the download fails', async () => {
    // Arrange
    const error = new Error('Download failed');
    vitest.spyOn(compiler, 'download').mockRejectedValue(error);

    // Act and Assert
    await expect(syncAndCompile(compiler)).rejects.toThrow(error);
  });

  it('should throw an error if the compilation fails', async () => {
    // Arrange
    const error = new Error('Compilation failed');
    vitest.spyOn(compiler, 'download').mockResolvedValue(undefined);
    vitest.spyOn(compiler, 'compile').mockRejectedValue(error);

    // Act and Assert
    await expect(syncAndCompile(compiler)).rejects.toThrow(error);
  });

  it('should throw an error if the upload fails', async () => {
    // Arrange
    const error = new Error('Upload failed');
    vitest.spyOn(compiler, 'download').mockResolvedValue(undefined);
    vitest.spyOn(compiler, 'compile').mockResolvedValue({} as any);
    vitest.spyOn(compiler, 'upload').mockRejectedValue(error);

    // Act and Assert
    await expect(syncAndCompile(compiler)).rejects.toThrow(error);
  });
});
