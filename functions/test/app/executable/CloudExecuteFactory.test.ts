import { IsNotExecutableError } from '@/app/errors/IsNotExecutableError';
import { CloudExecuteFactory } from '@/app/executable/CloudExecuteFactory';
import { IExecutable } from '@/app/executable/IExecutable';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vitest } from 'vitest';

describe('CloudExecuteFactory', () => {
  const storage = {
    getFile$: vitest.fn(),
    getFile: vitest.fn(),
  };
  const factory = new CloudExecuteFactory(storage);

  beforeEach(() => {});

  describe('create$', () => {
    it('should return an Observable that emits an IExecutable object', () => {
      return new Promise<void>((done) => {
        const fileContents = 'module.exports = { main: () => {} }';
        const expectedExecutable: IExecutable = { main: expect.any(Function) };
        storage.getFile$.mockReturnValueOnce(of(Buffer.from(fileContents)));

        factory.create$('test.js').subscribe((executable) => {
          expect(executable).toEqual(expectedExecutable);
          done();
        });
      });
    });

    it('should throw an IsNotExecutableError if the module does not implement the Executable interface', () => {
      return new Promise<void>((done) => {
        const fileContents = 'module.exports = {}';
        storage.getFile$.mockReturnValueOnce(of(Buffer.from(fileContents)));

        factory.create$('test.js').subscribe({
          error: (err) => {
            expect(err).toBeInstanceOf(IsNotExecutableError);
            done();
          },
        });
      });
    });
  });

  describe('create', () => {
    it('should return a Promise that resolves to an IExecutable object', async () => {
      const fileContents = 'module.exports = { main: () => {} }';
      const expectedExecutable: IExecutable = { main: expect.any(Function) };
      storage.getFile$.mockReturnValueOnce(of(Buffer.from(fileContents)));

      const executable = await factory.create('test.js');
      expect(executable).toEqual(expectedExecutable);
    });
  });
});
