<template>
  <v-container>
    <v-row>
      <v-btn
        color="blue"
        class="ml-auto bold-text"
        @click="showDialogue = true"
        :disabled="isCreating"
        :loading="isCreating"
        >Create Farm</v-btn
      >
    </v-row>

    <v-container v-if="showDialogue">
      <v-dialog v-model="showDialogue" max-width="600">
        <v-card>
          <v-toolbar color="primary" dark class="custom-toolbar">Create Farm</v-toolbar>
          <div class="pt-6 px-6">
            <form-validator v-model="valid">
              <input-validator
                :value="$props.name"
                :rules="[
                  validators.required('Farm name is required.'),
                  name => validators.isAlpha('Farm name must start with an alphabet char.')(name[0]),
                  validators.minLength('Farm minimum length is 2 chars.', 2),
                  validators.maxLength('Farm maximum length is 15 chars.', 15),
                ]"
                #="{ props }"
              >
                <v-text-field
                  :model-value="$props.name"
                  v-bind:="props"
                  @update:model-value="$emit('update:name', $event)"
                  outlined
                  label="Farm name"
                ></v-text-field>
              </input-validator>
            </form-validator>
          </div>
          <v-card-actions class="justify-end px-5 pb-5 pt-0">
            <v-btn color="primary" variant="tonal" @click="createFarm" :disabled="!valid">Create</v-btn>
            <v-btn @click="showDialogue = false" class="grey lighten-2 black--text">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import { onMounted, ref } from "vue";

import { useGrid } from "../../../stores";
import { createCustomToast, ToastType } from "../../../utils/custom_toast";

export default {
  name: "CreateFarm",
  props: ["name"],
  setup(props) {
    const showDialogue = ref(false);
    const isCreating = ref(false);
    const gridStore = useGrid();
    const valid = ref(false);
    onMounted(() => {});
    async function createFarm() {
      try {
        await gridStore.grid.farms.create({ name: props.name });
        createCustomToast("Farm created successfully.", ToastType.success);
      } catch (error) {
        console.log(error);
        createCustomToast("Failed to create farm.", ToastType.danger);
      }
    }
    return {
      showDialogue,
      isCreating,
      valid,
      createFarm,
    };
  },
};
</script>

<style scoped>
.custom-toolbar {
  font-size: 20px;
  font-weight: bold;
  padding-left: 10px;
}
</style>
