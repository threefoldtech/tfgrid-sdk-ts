import { ValidationError } from "@threefold/types";
import { plainToInstance } from "class-transformer";
import { buildMessage, registerDecorator, validateSync, ValidationOptions } from "class-validator";

function validateObject(obj) {
  const errors = validateSync(obj);
  // errors is an array of validation errors
  if (errors.length > 0) {
    console.log("Validation failed. errors:", errors);
    throw new ValidationError(`Validation failed. errors: ${errors}.`);
  }
}
// used as decorator
function validateInput(target, propertyKey: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;
  descriptor.value = function (...args) {
    const types = Reflect.getMetadata("design:paramtypes", target, propertyKey);
    for (let i = 0; i < args.length; i++) {
      const input = plainToInstance(types[i], args[i], { excludeExtraneousValues: true });
      validateObject(input);
    }
    return method.apply(this, args);
  };
}

function validateHexSeed(seed: string, length: number): boolean {
  const hexSeedRegex = new RegExp(`^[0-9A-Fa-f]{${length * 2}}$`);
  if (!hexSeedRegex.test(seed)) {
    throw new ValidationError(`Invalid seed. It should be a ${length}-character hexadecimal string.`);
  }
  return true;
}

function IsAlphanumericExceptUnderscore(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: "IsAlphanumericExceptUnderscore",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [`${propertyName} must contain only letters, numbers, and underscores`],
      validator: {
        validate(value: any) {
          return /^[a-zA-Z0-9_]*$/.test(value);
        },
        defaultMessage: buildMessage(
          eachPrefix => eachPrefix + "$property must contain only letters, numbers, and underscores",
          validationOptions,
        ),
      },
    });
  };
}

export { validateObject, validateInput, validateHexSeed, IsAlphanumericExceptUnderscore };
