<script lang="ts">
import { createToast, type ToastOptions } from "mosha-vue-toastify";

const typeToColor: { [key: string]: string } = {
  success: "#1aa18f",
  danger: "#FF5252",
  info: "#1aa18f",
};

export function createCustomToast(content: string, type: "danger" | "default" | "info" | "success" | "warning") {
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
</style>
