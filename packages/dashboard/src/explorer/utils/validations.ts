export function inputValidation(value: string, key: string): string {
  // value: Current value of the input.
  // key: Current key of the input, e.g. [nodeId,farmId]..etc

  const numericFields: string[] = [
    "nodeId",
    "farmId",
    "twinId",
    "freePublicIPs",
    "farmID",
    "node_id",
    "free_ips",
    "twin_id",
    "farm_ids",
    "free_mru",
    "free_sru",
    "free_hru",
    "total_sru",
    "total_hru",
    "total_mru",
    "total_cru",
    "pricingPolicyId",
  ];
  const textualFields: string[] = ["farmingPolicyName", "certificationType"];
  const textNumbersFields: string[] = ["farm_name"];

  const countryFields: string[] = ["countryFullName", "country"];
  const specialChars = /[ `!@#$%^&*()+\-=[\]{};':"\\|,.<>/?~]/;
  const countryRegex = /^[A-Za-z][A-Za-z\s]*$/;
  let errorMsg = "";

  if (numericFields.includes(key)) {
    if (isNaN(+value) || specialChars.test(value) || +value < 0 || value.includes("e")) {
      errorMsg = "This field must be a number.";
      return errorMsg;
    }
  } else if (countryFields.includes(key)) {
    if (!countryRegex.test(value)) {
      return (errorMsg = "Country name should not contain special characters or numbers.");
    }
  } else if (textNumbersFields.includes(key)) {
    if (specialChars.test(value)) {
      errorMsg = "This field does not accept special characters.";
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
