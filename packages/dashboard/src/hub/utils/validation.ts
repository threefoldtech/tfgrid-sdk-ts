export function inputValidation(value: string, key: string): string {
  // value: Current value of the input.
  // key: Current key of the input, e.g. [nodeId,farmId]..etc

  const numericFields: string[] = ["nodeId", "farmId", "twinId", "freePublicIPs", "farmID"];
  const textualFields: string[] = [
    "countryFullName",
    "farmingPolicyName",
    "certificationType",
    "farm_name",
    "pricingPolicyId",
  ];
  const specialChars = /[ `!@#$%^&*()+\-=[\]{};':"\\|,.<>/?~]/;
  let errorMsg = "";

  if (numericFields.includes(key)) {
    if (isNaN(+value) || specialChars.test(value) || +value < 0 || value.includes("e")) {
      errorMsg = "This field must be a number.";
      return errorMsg;
    }
  } else if (textualFields.includes(key)) {
    if (specialChars.test(value)) {
      errorMsg = "This field does not accept special characters.";
      return errorMsg;
    } else if (value.match(".*\\d.*")) {
      errorMsg = "This field does not accept numbers.";
      return errorMsg;
    }
  }
  errorMsg = "";
  return errorMsg;
}
