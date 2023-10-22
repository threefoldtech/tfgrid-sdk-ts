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
    // Change the colors of the icons/contents of all opened toast to be `tonal` as vuetify.
    const leftIcons = document.getElementsByClassName("mosha__icon");
    const closeIcons = document.getElementsByClassName("mosha__toast__close-icon");
    const contents = document.getElementsByClassName("mosha__toast__content");

    if (leftIcons && closeIcons && contents) {
      for (let index = 0; index < leftIcons.length; index++) {
        const svgIcon = leftIcons[index].children[0];
        svgIcon.classList.add(`mosha__icon__${theme}__${type}`);
        closeIcons[index].classList.add(`${theme}__${type}`);
        contents[index].classList.add(`${theme}__${type}`);
      }
    }
  }, 1);
}
