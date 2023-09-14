import { IsNotExecutableError } from '@/app/errors/IsNotExecutableError';
import { CloudExecuteFactory } from '@/app/executable/CloudExecuteFactory';
import { IExecutable } from '@/app/executable/IExecutable';
import { StorageFile } from '@/app/storage/StorageFile';
import { lastValueFrom, of } from 'rxjs';
import { beforeEach, describe, expect, it, vitest } from 'vitest';

describe('CloudExecuteFactory', () => {
  const storage = {
    getFile$: vitest.fn(),
    getFile: vitest.fn(),
    getFiles$: vitest.fn(),
    getFiles: vitest.fn(),
  };
  const cache = {
    get: vitest.fn().mockResolvedValue(undefined),
    set: vitest.fn().mockResolvedValue(undefined),
    reset: vitest.fn().mockResolvedValue(undefined),
  };
  let factory: CloudExecuteFactory;

  beforeEach(async () => {
    factory = new CloudExecuteFactory(storage, cache as any);
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

  describe('clearCache', () => {
    it('should clear the cache', async () => {
      const spy = vitest.spyOn(cache, 'reset');
      await factory.clearCache();
      expect(spy).toHaveBeenCalled();
    });
  });
});
