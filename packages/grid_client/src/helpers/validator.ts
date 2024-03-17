import { ValidationError } from "@threefold/types";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

async function validateObject(obj) {
  const errors = await validate(obj);
  // errors is an array of validation errors
  if (errors.length > 0) {
    console.log("Validation failed. errors:", errors);
    throw new ValidationError(`Validation failed. errors: ${errors}.`);
  }
}
// used as decorator
function validateInput(target, propertyKey: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;
  descriptor.value = async function (...args) {
    const types = Reflect.getMetadata("design:paramtypes", target, propertyKey);
    for (let i = 0; i < args.length; i++) {
      const input = plainToInstance(types[i], args[i], { excludeExtraneousValues: true });
      await validateObject(input);
    }
    return await method.apply(this, args);
  };
}

function validateHexSeed(seed: string, length: number): boolean {
  const hexSeedRegex = new RegExp(`^[0-9A-Fa-f]{${length * 2}}$`);
  if (!hexSeedRegex.test(seed)) {
    throw new ValidationError(`Invalid seed. It should be a ${length}-character hexadecimal string.`);
  }
  return true;
}

export { validateObject, validateInput, validateHexSeed };
