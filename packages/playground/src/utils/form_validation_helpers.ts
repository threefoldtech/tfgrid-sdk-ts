import type { InputValidatorService } from "@/hooks/input_validator";

/**
 * Enhanced DOM element resolution for form validation error highlighting and scrolling.
 * Supports multiple strategies to find the correct element to highlight.
 */
export interface ValidationTargetOptions {
  $el?: any;
  validationTarget?: string;
  targetSelector?: string;
}

/**
 * Resolves the best DOM element for validation error highlighting and scrolling.
 * Uses multiple fallback strategies to ensure reliable element targeting.
 */
export function resolveValidationTarget(options: ValidationTargetOptions): HTMLElement | null {
  const { $el, validationTarget, targetSelector } = options;

  if (validationTarget) {
    const targetElement = document.querySelector(`[data-validation-target="${validationTarget}"]`) as HTMLElement;
    if (targetElement) {
      return targetElement;
    }
  }

  if (targetSelector) {
    const targetElement = document.querySelector(targetSelector) as HTMLElement;
    if (targetElement) {
      return targetElement;
    }
  }

  let element: HTMLElement | null = null;

  if ($el) {
    if (typeof $el === "object" && "value" in $el && $el.value instanceof HTMLElement) {
      element = $el.value;
    } else if ($el instanceof HTMLElement) {
      element = $el;
    } else if ($el && typeof $el === "object" && "$el" in $el && $el.$el instanceof HTMLElement) {
      element = $el.$el;
    }
  }

  return element;
}

/**
 * Finds the actual input element within a container for focusing and scrolling.
 * Looks for various input types and Vue component patterns.
 */
export function findFocusableInput(container: HTMLElement): HTMLElement {
  const input =
    container.querySelector("textarea") || container.querySelector("input") || container.querySelector("select");

  if (input instanceof HTMLElement) {
    return input;
  }

  const vField =
    container.querySelector(".v-field") ||
    container.querySelector(".v-select") ||
    container.querySelector(".v-text-field");

  if (vField instanceof HTMLElement) {
    const nestedInput = vField.querySelector("input") || vField.querySelector("textarea");
    if (nestedInput instanceof HTMLElement) {
      return nestedInput;
    }
    return vField;
  }

  return container;
}

/**
 * Enhanced validation target resolution for InputValidatorService.
 * Combines the service properties with additional validation targeting options.
 */
export function resolveValidationTargetFromService(service: InputValidatorService): HTMLElement | null {
  return resolveValidationTarget({
    $el: service.$el,
    validationTarget: service.validationTarget,
    targetSelector: service.targetSelector,
  });
}

/**
 * Applies error highlighting to an element with the standard weblet layout styles.
 */
export function applyErrorHighlight(element: HTMLElement): void {
  element.classList.add("weblet-layout-error-transition");
  requestAnimationFrame(() => {
    element.classList.add("weblet-layout-error");
  });
}

/**
 * Removes error highlighting from an element.
 */
export function removeErrorHighlight(element: HTMLElement): void {
  element.classList.remove("weblet-layout-error");
  setTimeout(() => element.classList.remove("weblet-layout-error-transition"), 152);
}
