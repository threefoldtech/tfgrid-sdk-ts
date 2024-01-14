import { createCustomToast, ToastType } from "@/utils/custom_toast";

export function notifyDelaying() {
  createCustomToast("The actions will be reflected in a bit", ToastType.info);
}
