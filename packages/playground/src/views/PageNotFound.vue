<template>
  <div
    class="d-flex justify-center align-center text-center"
    :style="{ height: 'calc(100vh - 250px)', minHeight: '700px' }"
  >
    <div>
      <img src="/images/404.png" alt="404" />
      <h2 class="text-h5">Oops. The page you were looking for doesn't exist.</h2>
      <p class="my-3">You may have mistyped address or the page may have moved</p>
      <v-btn color="primary" variant="text" @click="$router.push('/')">Take me back to home page</v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { useRouter } from "vue-router";

export default {
  name: "PageNotFound",
  setup() {
    return { $router: useRouter() };
  },
};
</script>
