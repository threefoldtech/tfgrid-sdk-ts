import { ValidationError } from "@threefold/types";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import * as crypto from "crypto";

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

function generateRandomHexSeed(length: number, numbers: number[]) {
  let hexSeed = "";

  // If no given numbers, generate all random
  if (numbers.length == 0) {
    const bytes = crypto.randomBytes(length);
    return bytes.toString("hex");
  }

  let bytes1 = crypto.randomBytes(numbers[0]);
  let bytes2 = crypto.randomBytes(numbers[1]);

  // If length of bytes bigger than desired length
  if (bytes1.length + bytes2.length > length) {
    const diff = bytes1.length + bytes2.length - length;
    if (bytes1.length > bytes2.length) {
      bytes1 = bytes1.slice(0, bytes1.length - diff);
    } else {
      bytes2 = bytes2.slice(0, bytes2.length - diff);
    }

    hexSeed = bytes1.toString("hex") + bytes2.toString("hex");
  }

  if (bytes1.length + bytes2.length < length) {
    const diff = length - (bytes1.length + bytes2.length);
    const bytes3 = crypto.randomBytes(diff);
    hexSeed = bytes1.toString("hex") + bytes2.toString("hex") + bytes3.toString("hex");
  }

  return hexSeed;
}

function validateHexSeed(seed: string, length: number): boolean {
  const hexSeedRegex = new RegExp(`^[0-9A-Fa-f]{${length}}$`);
  if (!hexSeedRegex.test(seed)) {
    throw new ValidationError(`Invalid seed. It should be a ${length}-character hexadecimal string.`);
  }
  return true;
}

export { validateObject, validateInput, generateRandomHexSeed, validateHexSeed };
