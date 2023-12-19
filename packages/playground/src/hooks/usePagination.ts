import shuffle from "lodash/fp/shuffle.js";
import { computed, ref } from "vue";

function normalizePages(count: number) {
  if (count === 0) {
    return [-1];
  }

  return shuffle(Array.from({ length: count - 1 }, (_, i) => i + 1)).concat([count, -1]);
}

export function usePagination(count = 0) {
  const pages = ref(normalizePages(count));
  const index = ref(0);

  function getPage() {
    return pages.value[Math.min(index.value, pages.value.length - 1)];
  }

  return computed(() => {
    return {
      page: getPage(),
      reset(count: number) {
        index.value = 0;
        pages.value = normalizePages(count);
      },
      next: () => {
        index.value++;
        return getPage();
      },
    };
  });
}
