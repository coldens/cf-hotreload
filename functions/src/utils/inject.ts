type ClassConstructor = new (...args: any[]) => any;

/**
 * Creates an instance of the given class with the given dependencies.
 */
export function inject<T extends ClassConstructor>(Target: T): InstanceType<T>;
export function inject<
  T extends ClassConstructor,
  R extends ConstructorParameters<T>,
>(Target: T, ...injections: R): InstanceType<T>;

export function inject<
  T extends ClassConstructor,
  R extends ConstructorParameters<T>,
>(Target: T, ...injections: R): InstanceType<T> {
  return new Target(...injections);
}
