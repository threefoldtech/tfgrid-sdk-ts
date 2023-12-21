import noop from "lodash/fp/noop.js";
import { onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";

export function useNavigationStatus() {
  const router = useRouter();
  const status = ref<"Loading" | "Success" | "Failed">("Success");

  let unSubscribeBeforeEach = noop;
  let unSubscribeAfterEach = noop;

  let currentToPath: string;

  onMounted(async () => {
    await router.isReady();

    unSubscribeBeforeEach = router.beforeEach((to, _, next) => {
      currentToPath = to.fullPath;
      status.value = "Loading";

      return next();
    });

    unSubscribeAfterEach = router.afterEach((to, _, failure) => {
      if (status.value !== "Loading" || currentToPath !== to.fullPath) {
        return;
      }

      status.value = failure ? "Failed" : "Success";
    });
  });

  onUnmounted(() => {
    unSubscribeBeforeEach();
    unSubscribeAfterEach();
  });

  return status;
}
