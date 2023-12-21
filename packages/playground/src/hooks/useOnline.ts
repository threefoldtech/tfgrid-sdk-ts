import { computed, onMounted, onUnmounted, ref } from "vue";

export function useOnline() {
  const online = ref(true);

  function setOnline(value: boolean) {
    return () => {
      online.value = value;
    };
  }

  const isOnline = setOnline(true);
  const isOffline = setOnline(false);

  onMounted(() => {
    window.addEventListener("online", isOnline);
    window.addEventListener("offline", isOffline);
  });

  onUnmounted(() => {
    window.removeEventListener("online", isOnline);
    window.removeEventListener("offline", isOffline);
  });

  return online;
}

export function useOffline() {
  const online = useOnline();

  return computed(() => !online.value);
}
