type AssertReturn = void | never;
function panic(message: string): never {
  throw new Error(message);
}

/**
 * @description
 * Assertion
 */
export function assertHasField(fields: any): AssertReturn {
  if (Object.keys(fields).length === 0) panic(`[Object] must contain at least 1 field.`);
  for (const key in fields) {
    if (fields[key] instanceof Object) assertHasField(fields[key]);
    else if (fields[key] !== true) panic(`Expected "${key}" of type [true | string] but got [${typeof fields[key]}]`);
  }
}

export function assertID(value: any): AssertReturn {
  if (value === "" || value === undefined || value === null) {
    panic(`Expected a valid [ID] but got [${value}].`);
  }
}
