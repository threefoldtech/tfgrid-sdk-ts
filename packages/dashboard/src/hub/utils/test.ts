import { snakeToCamelCase } from "./camel";

function assert(expr: boolean, msg?: string) {
  if (!expr) {
    throw new Error(msg);
  }
}

function object_equals(x: any, y: any) {
  if (x === y) return true;
  // if both x and y are null or undefined and exactly the same

  if (!(x instanceof Object) || !(y instanceof Object)) return false;
  // if they are not strictly equal, they both need to be Objects

  if (x.constructor !== y.constructor) return false;
  // they must have the exact same prototype chain, the closest we can do is
  // test there constructor.

  for (const p in x) {
    if (!(p in x)) continue;
    // other properties were tested using x.constructor === y.constructor

    if (!(p in y)) return false;
    // allows to compare x[ p ] and y[ p ] when set to undefined

    if (x[p] === y[p]) continue;
    // if they have the same strict value or identity then they are equal

    if (typeof x[p] !== "object") return false;
    // Numbers, Strings, Functions, Booleans must be strictly equal

    if (!object_equals(x[p], y[p])) return false;
    // Objects and Arrays must be tested recursively
  }

  for (const p in y) if (p in y && !(p in x)) return false;
  // allows x[ p ] to be set to undefined

  return true;
}
const original = [
  {
    first_key: 1,
    second_key_long: [
      {
        first_nested: 3,
        second: 3,
        third_nested_key: 3,
      },
      "another_word",
    ],
    third: {
      first_nested: 3,
      second: 3,
      third_nested_key: 3,
    },
  },
];
const expected = [
  {
    firstKey: 1,
    secondKeyLong: [
      {
        firstNested: 3,
        second: 3,
        thirdNestedKey: 3,
      },
      "another_word",
    ],
    third: {
      firstNested: 3,
      second: 3,
      thirdNestedKey: 3,
    },
  },
];
for (const i in original) {
  snakeToCamelCase(original[i]);
  console.log(original[i]);
  console.log(expected[i]);
  assert(object_equals(expected[i], original[i]));
}
