<template>
  <v-container>
    <v-row class="text-center flex justify-center">
      <v-btn
        color="secondary"
        class="text-subtitle-1 px-6 mr-2"
        v-bind:href="'https://bootstrap.grid.tf/'"
        target="blank"
        >Bootstrap Node Image</v-btn
      >

      <v-btn variant="elevated" class="text-subtitle-1 px-6" @click="showDialogue = true" :disabled="isCreating"
        >Create Farm</v-btn
      >
    </v-row>

    <v-container v-if="showDialogue">
      <v-dialog v-model="showDialogue" max-width="600" attach="#modals">
        <v-card>
          <v-card-title class="bg-primary"> Create Farm </v-card-title>
          <v-card-text>
            <form-validator v-model="valid">
              <input-validator
                :value="$props.name"
                :rules="[
                  validators.required('Farm name is required.'),
                  name => validators.isAlpha('Farm name must start with an alphabet char.')(name[0]),
                  validators.minLength('Farm name minimum length is 3 chars.', 3),
                  validators.maxLength('Farm name maximum length is 40 chars.', 40),
                  validators.pattern('Farm name should not contain whitespaces.', {
                    pattern: /^[^\s]+$/,
                  }),
                ]"
                :async-rules="[validateFarmName]"
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
          </v-card-text>
          <v-card-actions class="justify-end my-1 mr-2">
            <v-btn color="anchor" @click="showDialogue = false">Close</v-btn>
            <v-btn @click="createFarm" :loading="isCreating" :disabled="!valid || isCreating">Create</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </v-container>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import { gridProxyClient } from "../../clients";
import { useGrid } from "../../stores";
import { createCustomToast, ToastType } from "../../utils/custom_toast";

const props = defineProps<{
  name: {
    type: string;
    required: true;
  };
}>();
const showDialogue = ref(false);
const isCreating = ref(false);
const gridStore = useGrid();
const valid = ref(false);
const emits = defineEmits(["farm-created"]);
async function createFarm() {
  try {
    isCreating.value = true;
    await gridStore.grid.farms.create({ name: props.name });
    createCustomToast("Farm created successfully.", ToastType.success);
    showDialogue.value = false;
    emits("farm-created");
  } catch (error) {
    console.log(error);
    createCustomToast("Failed to create farm.", ToastType.danger);
  } finally {
    isCreating.value = false;
  }
}
async function validateFarmName(name: string) {
  if (!name.split("").every((c: string) => /[a-zA-Z0-9\-_]/.test(c))) {
    return {
      message: "Farm name can only contain alphabetic letters, numbers, '-' or '_'",
    };
  }

  const farmsWithSameName = await gridProxyClient.farms.listAll({ name: name.toLocaleLowerCase() });
  if (farmsWithSameName.length > 0) {
    return { message: "Farm name already exists!" };
  }
}
</script>
<script lang="ts">
export default {
  name: "CreateFarm",
};
</script>

<style scoped>
.custom-toolbar {
  height: 2.5rem !important;
  padding-left: 10px;
}
</style>
