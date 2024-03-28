import { ref } from "vue";

export function useStorage(api: Window["localStorage"] | Window["sessionStorage"]) {
  return (key: string, defaultValue?: string) => {
    const storedValue = api.getItem(key);

    const data = ref(storedValue ? storedValue : defaultValue);

    function setStorage(value?: string) {
      if (typeof value === "string") {
        return api.setItem(key, value);
      }

      api.removeItem(key);
    }

    return {
      get value(): string | undefined {
        return data.value;
      },
      set value(value: string | undefined) {
        if (data.value !== value) {
          data.value = value;
        }

        setStorage(value);
      },
      remove() {
        data.value = undefined;
        setStorage(undefined);
      },
    };
  };
}

export const useLocalStorage = useStorage(localStorage);
export const useSessionStorage = useStorage(sessionStorage);
