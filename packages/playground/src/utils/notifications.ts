import { createCustomToast, ToastType } from "@/utils/custom_toast";

export function notifyDelaying() {
  createCustomToast("This action will be reflected in a bit", ToastType.info);
}
