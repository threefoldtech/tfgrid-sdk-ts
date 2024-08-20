import "reflect-metadata";

const metadataKey = "exposeDecorator";

/**
 * Sets metadata to expose a property, which will expose a property of an object.
 *
 * @param target The target object.
 * @param propertyKey The key of the property to expose.
 * @returns void
 */
function expose(target, propertyKey: string): void {
  Reflect.defineMetadata(metadataKey, true, target, propertyKey);
}

/**
 * Check if a specific property of an object has been exposed using the `expose` decorator.
 *
 * @param instance The object instance to check for exposed property.
 * @param propertyKey The key of the property to check for exposure.
 * @returns A boolean indicating whether the property is exposed or not.
 */
function isExposed<T>(instance: T, propertyKey: string): boolean {
  return Reflect.hasMetadata(metadataKey, instance, propertyKey);
}
export { expose, isExposed };
