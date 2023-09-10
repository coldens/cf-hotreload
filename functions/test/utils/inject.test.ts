import { inject } from '@/utils/inject';
import { describe, expect, it } from 'vitest';

class TestClass {
  constructor(
    public arg1: string,
    public arg2: number,
  ) {}
}

describe('inject', () => {
  it('should create an instance of the given class with no dependencies', () => {
    const result = inject(TestClass);
    expect(result).toBeInstanceOf(TestClass);
  });

  it('should create an instance of the given class with the given dependencies', () => {
    const result = inject(TestClass, 'test', 123);
    expect(result).toBeInstanceOf(TestClass);
    expect(result.arg1).toBe('test');
    expect(result.arg2).toBe(123);
  });

  it('should throw an error if the given class is not a constructor', () => {
    expect(() => inject({} as any)).toThrowError(TypeError);
  });
});
