import { ValidationError } from "@threefold/types";
import { plainToInstance } from "class-transformer";
import { buildMessage, registerDecorator, validateSync } from "class-validator";
import { ValidationOptions as ClassValidatorValidationOptions } from "class-validator";

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
function IsAlphanumericExpectUnderscore(validationOptions?: ClassValidatorValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: "IsAlphanumericExpectUnderscore",
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
interface ValidationOptions {
  props?: boolean | string | string[];
  methods?: boolean | string | string[];
}

/*
 * <script lang="ts">
 * import { isLength, isInt } from "class-validator";
 * // Example 1
 * @ValidateMembers()
 * class User {
 *   @isLength(2) name: string
 *   @isInt() age: number
 *
 * greeting() {
 * // Some logic
 * }
 * }
 * </script> */

/**
 * @description
 * This `ValidateMembers` is a config method which returns back a *classDecrator*
 * Allows to configure which setter/methods should trigger validation for that specific class
 *
 * Example As follow
 * @example
 * ```typescript
 * import { isLength, isInt } from "class-validator";
 *
 * // ⁣@ValidateMembers({ props: false, methods: true }) // - disable validation on set props
 * // ⁣@ValidateMembers({ props: true, methods: false }) // - disable validation on call methods
 * // ⁣@ValidateMembers({ props: 'name', methods: false }) // - validate only on setting 'name' prop
 * // And so on...
 * ⁣@ValidateMembers() // = ⁣@ValidateMembers({ props: true, methods: true })
 * class User {
 *   ⁣@isLength(2) name: string
 *   ⁣⁣@isInt() age: number
 *
 *   greeting() {
 *     // Some logic
 *   }
 * }
 * ```
 *
 *
 *
 * @param options { ValidationOptions | undefined }
 * @returns { ClassDecorator }
 */
function ValidateMembers(options?: ValidationOptions): ClassDecorator {
  const _options = _normalizeValidationOptions(options);
  return (target: any): any => {
    const methods = _getMethods(target, _options);
    for (const method of methods) {
      const fn = target.prototype[method];
      target.prototype[method] = function (...args: any[]): any {
        const errors = validateSync(this);
        if (errors.length) {
          throw errors;
        }
        return fn.apply(this, args);
      };
    }

    return class extends target {
      constructor(...args: any[]) {
        super(...args);

        const props = _getProps(this, _options);
        for (const prop of props) {
          let _value = this[prop];

          Object.defineProperty(this, prop, {
            configurable: false,
            enumerable: true,
            get: () => _value,
            set(value) {
              _value = value;
              const errors = validateSync(this);
              for (const error of errors) {
                if (error.property === prop) {
                  throw error;
                }
              }
            },
          });
        }
      }
    };
  };
}

function _normalizeValidationOptions(options?: ValidationOptions): Required<ValidationOptions> {
  return {
    props: options?.props ?? true,
    methods: options?.methods ?? true,
  };
}

function _getProps(ctor: any, options: Required<ValidationOptions>): string[] {
  /* This env variable should be used while testing to prevent throw error while setting values */
  if (process.env.SKIP_PROPS_VALIDATION) {
    return [];
  }

  if (options.props === true) {
    return Object.getOwnPropertyNames(ctor);
  }

  if (typeof options.props === "string") {
    return [options.props];
  }

  if (Array.isArray(options.props)) {
    return options.props;
  }

  return [];
}

function _getMethods(ctor: any, options: Required<ValidationOptions>): string[] {
  /* This env variable should be used to prevent throw error while calling methods if needed */
  if (process.env.SKIP_METHODS_VALIDATION) {
    return [];
  }

  if (options.methods === true) {
    const methods = Object.getOwnPropertyNames(ctor.prototype);
    const constructorIndex = methods.indexOf("constructor");
    if (constructorIndex !== -1) {
      methods.splice(constructorIndex, 1);
    }
    return methods;
  }

  if (typeof options.methods === "string") {
    return [options.methods];
  }

  if (Array.isArray(options.methods)) {
    return options.methods;
  }

  return [];
}

export {
  validateObject,
  validateInput,
  validateHexSeed,
  type ValidationOptions,
  ValidateMembers,
  IsAlphanumericExpectUnderscore,
};
