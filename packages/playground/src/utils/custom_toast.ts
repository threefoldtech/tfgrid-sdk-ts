import { createToast, type ToastOptions } from "mosha-vue-toastify";

export enum ToastType {
  danger = "danger",
  default = "default",
  info = "info",
  success = "success",
  warning = "warning",
}

const darkModeColors = {
  danger: "#FF5252",
  default: "#313131",
  info: "#2196F3",
  success: "#1AA18F",
  warning: "#3C351D",
};

const lightModeColors = {
  danger: "#FF5252",
  default: "#313131",
  info: "#2196F3",
  success: "#1AA18F",
  warning: "#FEF1E0",
};

export function createCustomToast(content: string, type: ToastType) {
  const theme = localStorage.getItem("APP_CURRENT_THEME");
  const colors = theme === "dark" ? darkModeColors : lightModeColors;

  const toastOptions: ToastOptions = {
    hideProgressBar: true,
    position: "top-right",
    timeout: 5000,
    showIcon: true,
    type,
    toastBackgroundColor: colors[type],
  };

  createToast(content, toastOptions);

  setTimeout(() => {
    document.querySelector(".mosha__icon")?.children[0].classList.add(`mosha__icon__${theme}__${type}`);
    document.querySelector(".mosha__toast__close-icon")?.classList.add(`${theme}__${type}`);
    document.querySelector(".mosha__toast__content")?.classList.add(`${theme}__${type}`);
  }, 1);
}
