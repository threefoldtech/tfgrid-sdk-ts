<script lang="ts">
import { createToast, type ToastOptions } from "mosha-vue-toastify";

export enum ToastType {
  danger = "danger",
  default = "default",
  info = "info",
  success = "success",
  warning = "warning",
}

const typeToColor: { [key in ToastType]: string } = {
  [ToastType.danger]: "#FF5252",
  [ToastType.default]: "#313131",
  [ToastType.info]: "#2196F3",
  [ToastType.success]: "#1AA18F",
  [ToastType.warning]: "#FFCC00",
};

export function createCustomToast(content: string, type: ToastType) {
  const toastOptions: ToastOptions = {
    hideProgressBar: true,
    position: "top-right",
    timeout: 5000,
    showIcon: true,
    type,
    toastBackgroundColor: typeToColor[type],
  };

  createToast(content, toastOptions);
}
</script>

<style>
.mosha__toast__content-wrapper {
  margin-bottom: -2px;
}
.mosha__icon {
  margin-right: 6px !important;
}

.mosha__toast__content__text {
  font-size: 14px !important;
}
</style>
