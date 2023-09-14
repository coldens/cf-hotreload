import { IsNotExecutableError } from '@/app/errors/IsNotExecutableError';
import { CloudExecuteFactory } from '@/app/executable/CloudExecuteFactory';
import { IExecutable } from '@/app/executable/IExecutable';
import { StorageFile } from '@/app/storage/StorageFile';
import { caching } from 'cache-manager';
import { lastValueFrom, of } from 'rxjs';
import { beforeEach, describe, expect, it, vitest } from 'vitest';

describe('CloudExecuteFactory', () => {
  const storage = {
    getFile$: vitest.fn(),
    getFile: vitest.fn(),
    getFiles$: vitest.fn(),
    getFiles: vitest.fn(),
  };
  let factory: CloudExecuteFactory;

  beforeEach(async () => {
    const cache = await caching('memory');
    factory = new CloudExecuteFactory(storage, cache);
  });

  describe('create$', () => {
    it('should return an Observable that emits an IExecutable object', async () => {
      const fileContents = 'module.exports = { main: () => {} }';
      const expectedExecutable: IExecutable = { main: expect.any(Function) };
      storage.getFile$.mockReturnValueOnce(
        of(new StorageFile([Buffer.from(fileContents)], 'test.js')),
      );

      const result = await lastValueFrom(factory.create$('test.js'));
      expect(result).toEqual(expectedExecutable);
    });

    it('should throw an IsNotExecutableError if the module does not implement the Executable interface', async () => {
      const fileContents = 'module.exports = {}';
      storage.getFile$.mockReturnValueOnce(
        of(new StorageFile([Buffer.from(fileContents)], 'test.js')),
      );

      const result = () => lastValueFrom(factory.create$('test.js'));
      expect(result).rejects.toBeInstanceOf(IsNotExecutableError);
    });
  });

  describe('create', () => {
    it('should return a Promise that resolves to an IExecutable object', async () => {
      const fileContents = 'module.exports = { main: () => {} }';
      const expectedExecutable: IExecutable = { main: expect.any(Function) };
      storage.getFile$.mockReturnValueOnce(
        of(new StorageFile([Buffer.from(fileContents)], 'test.js')),
      );

      const executable = await factory.create('test.js');
      expect(executable).toEqual(expectedExecutable);
    });
  });
});
