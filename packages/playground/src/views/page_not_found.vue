<template>
  <img class="centered-img" :src="baseUrl + 'images/404.png'" />
  <p class="text1">Oops! The page you were looking for doesn't exist.</p>
  <p class="text2">You may have mistyped address or the page may have been moved.</p>
  <div style="text-align: center">
    <v-btn color="primary" variant="text" @click="$router.push({ name: 'Twin' })">
      Take me back to the Home page.</v-btn
    >
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";

const baseUrl = import.meta.env.BASE_URL;
const $router = useRouter();
</script>

<script lang="ts">
export default {
  name: "PageNotFound",
};
</script>

<style>
.centered-img {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  max-width: 700px;
}

.text1 {
  font-size: 20px;
  text-align: center;
  font-weight: 400;
  margin-top: 10px;
}

.text2 {
  font-size: 16px;
  text-align: center;
  font-weight: 400;
}

.link-text {
  font-size: 20px;
  text-align: center;
  font-weight: 400;
  color: #3d7ad4;
}
</style>
