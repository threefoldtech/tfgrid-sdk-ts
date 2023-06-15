<template>
  <view-layout>
    <template #description
      >CapRover is an extremely easy to use app/database deployment & web server manager for your NodeJS, Python, PHP,
      ASP.NET, Ruby, MySQL, MongoDB, Postgres, WordPress (and etc…) applications!<a
        target="_blank"
        href="https://manual.grid.tf/weblets/weblets_caprover.html"
        class="app-link"
      >
        read more about Caprover
      </a></template
    >
    <TfCaprover />

    <template #list>
      <TfDeploymentList :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfCaprover from "../weblets/tf_caprover.vue";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";

export default {
  name: "CaproverView",
  components: {
    TfCaprover,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.Caprover };
  },
};
</script>
