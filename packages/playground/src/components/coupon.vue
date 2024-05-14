<template>
  <section class="card">
    <p class="card-info">
      Too expensive? can upgrade to gold package to get discount up to 60% when you fund your wallet with X tft
    </p>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Coupon",
});
</script>

<style scoped>
.card {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f4f4;
  border-radius: 8px;
  height: 100px;
  padding: 25px;
  -webkit-mask-image: radial-gradient(circle at 10px, transparent 10px, red 10.5px),
    radial-gradient(circle at 0px 0px, red 0px, transparent 0.5px);
  -webkit-mask-position: -10px, -0px -0px;
  -webkit-mask-size: 100% 24px, 100%;
  -webkit-mask-composite: source-out, destination-over;
  mask-composite: subtract, add;
  box-shadow: 2px 10px #f00;
}
.card-info {
  line-height: 20px;
  color: #000;
  font-weight: bold;
}
</style>
