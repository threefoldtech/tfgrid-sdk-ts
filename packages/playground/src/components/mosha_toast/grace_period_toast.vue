<template>
  <div class="mosha__toast__content d-block">
    You have
    <button class="text-decoration-underline" :onclick="navigateToContractsList">
      {{ deploymentLen }} {{ deploymentLen > 1 ? "contracts" : "contract" }}
    </button>
    in grace period
  </div>
</template>

<script lang="ts">
import type { PropType } from "vue";

import router from "@/router";
import { DashboardRoutes } from "@/router/routes";

export default {
  props: {
    deploymentLen: {
      type: Number,
      required: true,
    },
    toast: {
      type: Object as PropType<{
        close: () => void;
      }>,
      required: false,
    },
  },

  setup(props) {
    const navigateToContractsList = () => {
      router.push(DashboardRoutes.Deploy.YourContracts);
      if (props.toast) {
        props.toast.close();
      }
    };
    return {
      router,
      navigateToContractsList,
    };
  },
};
</script>

<style>
.link-color {
  color: var(--link-color);
}
.mosha__toast__slot-wrapper {
  line-height: 15px !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  font-size: 16px;
}
</style>
