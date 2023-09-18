import validator from "validator";

// Check if the value has length then validate it.
// This function is implemented to be used for number field validation.
export function filterInputIntValidationWraper(msg: string, options?: validator.IsIntOptions | undefined) {
  return (value: string) => {
    if (value.length) {
      if (!validator.isInt(value, options) || value.includes("e") || value.includes("+") || value.includes("-")) {
        return { message: msg, isInt: options || true };
      }
    }
  };
}
