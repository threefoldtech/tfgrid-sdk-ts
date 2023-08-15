type ErrorValidation = {
  errorMessage: string;
  isValid: boolean;
};

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
  "pricingPolicyId",
  "total_cru",
];
const textualFields: string[] = ["farmingPolicyName", "certificationType"];
const textNumbersFields: string[] = ["farm_name", "gpu_device_name", "gpu_vendor_name"];
const resourcesFieldsInBytes = ["free_mru", "free_sru", "free_hru", "total_sru", "total_hru", "total_mru"];

const countryFields: string[] = ["countryFullName", "country"];
const specialChars = /[`!@#$%^&*()+\-=[\]{};':"\\|,.<>/?~]/;
const countryRegex = /^[A-Za-z][A-Za-z\s]*$/;

export function inputValidation(value: string, key: string): string {
  // value: Current value of the input.
  // key: Current key of the input, e.g. [nodeId,farmId]..etc

  const validateIntgerFiled = validateNumberField(value, key);
  const validateCountryField = validateCountryFields(value, key);
  const validateTextNumbersField = validateTextNumbersFields(value, key);
  const validateTextualField = validateTextualFields(value, key);

  if (!validateIntgerFiled.isValid) {
    return validateIntgerFiled.errorMessage;
  }
  if (!validateCountryField.isValid) {
    return validateCountryField.errorMessage;
  }
  if (!validateTextNumbersField.isValid) {
    return validateTextNumbersField.errorMessage;
  }
  if (!validateTextualField.isValid) {
    return validateTextualField.errorMessage;
  }
  return "";
}

function validateTextualFields(value: string, key: string) {
  // Validate validateTextualFields field and return true if valid false if not, also return string as error message.
  const validated = {
    errorMessage: "",
    isValid: true,
  };

  if (textualFields.includes(key)) {
    if (specialChars.test(value)) {
      validated.errorMessage = "This field does not accept special characters.";
      validated.isValid = false;
    } else if (value.match(".*\\d.*")) {
      validated.errorMessage = "This field does not accept numbers.";
      validated.isValid = false;
    }
  }
  return validated;
}

function validateTextNumbersFields(value: string, key: string) {
  // Validate textNumber field and return true if valid false if not, also return string as error message.
  const validated = {
    errorMessage: "",
    isValid: true,
  };

  if (textNumbersFields.includes(key)) {
    if (specialChars.test(value)) {
      validated.errorMessage = "This field does not accept special characters.";
      validated.isValid = false;
    }
  }
  return validated;
}

function validateCountryFields(value: string, key: string) {
  // Validate country field and return true if valid false if not, also return string as error message.
  const validated = {
    errorMessage: "",
    isValid: true,
  };
  if (countryFields.includes(key)) {
    if (!countryRegex.test(value)) {
      validated.errorMessage = "Country name should not contain special characters or numbers.";
      validated.isValid = false;
    }
  }
  return validated;
}

export function validateNumberField(value: string, key: string): ErrorValidation {
  // Validate number field and return true if valid false if not, also return string as error message.
  const validated = {
    errorMessage: "",
    isValid: true,
  };
  if (numericFields.includes(key)) {
    if (isNaN(+value) || specialChars.test(value)) {
      validated.errorMessage = "This Field accepts only a valid number.";
      validated.isValid = false;
    }

    if (+value <= 0) {
      validated.errorMessage = "This field must be a number larger than 0.";
      validated.isValid = false;
    }
  }

  if (resourcesFieldsInBytes.includes(key)) {
    if (isNaN(+value)) {
      validated.errorMessage = "This Field accepts only a valid number.";
      validated.isValid = false;
    }

    if (+value <= 0) {
      validated.errorMessage = "This field must be a number larger than 0.";
      validated.isValid = false;
    }
  }

  return validated;
}
