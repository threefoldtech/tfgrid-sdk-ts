export type ValidationResult = {
  isValid: boolean;
  errorMessage: string;
};

export function validateUrl(value: string): ValidationResult {
  if (!value || value.trim() === "") {
    return {
      isValid: false,
      errorMessage: "Link is required",
    };
  }

  if (!value.startsWith("http://") || !value.startsWith("https://") || !value.includes(".")) {
    return {
      isValid: false,
      errorMessage: "Invalid urk format",
    };
  }

  return {
    isValid: true,
    errorMessage: "",
  };
}
