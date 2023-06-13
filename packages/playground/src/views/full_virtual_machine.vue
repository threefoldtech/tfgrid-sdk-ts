<template>
  <view-layout>
    <template #description>
      <p>
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Aperiam cupiditate, minima quia saepe sit quo! Sequi
        quis quas dolorem veniam harum perferendis quod quisquam consequuntur, unde perspiciatis at, ex saepe, impedit
        deserunt deleniti voluptatem repellat est molestias minima beatae voluptatibus accusantium maiores delectus
        repudiandae. Quisquam quidem officia eos laboriosam autem!
      </p>
      <p class="mt-2">
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Aperiam cupiditate, minima quia saepe sit quo! Sequi
        deserunt deleniti voluptatem repellat est molestias minima beatae voluptatibus accusantium maiores delectus
        repudiandae. Quisquam quidem officia eos laboriosam autem!Quisquam quidem officia eos laboriosam autem!Quisquam
        quidem officia eos laboriosam autem!eos
      </p>
    </template>

    <FullVm />

    <template #list>
      <TfDeploymentList :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import FullVm from "../weblets/full_vm.vue";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";

export default {
  name: "FullVirtualMachine",
  components: {
    FullVm,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.Fullvm };
  },
};
</script>
