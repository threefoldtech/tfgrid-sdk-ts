export type ValidationResult = {
  isValid: boolean;
  errorMessage: string;
};

export function validatePdfUrl(value: string): ValidationResult {
  if (!value || value.trim() === "") {
    return {
      isValid: false,
      errorMessage: "Link is required",
    };
  }

  if (!value.includes(".") || !value.endsWith("pdf")) {
    return {
      isValid: false,
      errorMessage: "Invalid pdf url format",
    };
  }

  return {
    isValid: true,
    errorMessage: "",
  };
}
