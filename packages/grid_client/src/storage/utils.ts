function cropKey(key: string): string {
  const [x, y] = key.split("grid3_client/");
  return y || x;
}

function crop(target, propertyKey: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;
  descriptor.value = function (...args) {
    args[0] = cropKey(args[0]);
    return method.apply(this, args);
  };
}

export { cropKey, crop };
