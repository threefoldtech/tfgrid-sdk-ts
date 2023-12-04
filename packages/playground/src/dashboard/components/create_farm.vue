<template>
  <v-container>
    <v-row>
      <v-btn
        variant="outlined"
        color="secondary"
        class="ml-auto bold-text"
        @click="showDialogue = true"
        :disabled="isCreating"
        >Create Farm</v-btn
      >
    </v-row>

    <v-container v-if="showDialogue">
      <v-dialog v-model="showDialogue" max-width="600">
        <v-card>
          <v-toolbar color="primary" dark class="custom-toolbar">
            <p class="mb-5">Create Farm</p>
          </v-toolbar>
          <div class="pt-6 px-6">
            <form-validator v-model="valid">
              <input-validator
                :value="$props.name"
                :rules="[
                  validators.required('Farm name is required.'),
                  name => validators.isAlpha('Farm name must start with an alphabet char.')(name[0]),
                  validators.minLength('Farm name minimum length is 2 chars.', 2),
                  validators.maxLength('Farm name maximum length is 15 chars.', 15),
                  validators.pattern('Farm name  should not contain whitespaces.', {
                    pattern: /^[^\s]+$/,
                  }),
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
            <v-btn
              color="primary"
              variant="tonal"
              @click="createFarm"
              :loading="isCreating"
              :disabled="!valid || isCreating"
              >Create</v-btn
            >
            <v-btn @click="showDialogue = false" class="grey lighten-2 black--text">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import { ref } from "vue";

import { useGrid } from "../../stores";
import { createCustomToast, ToastType } from "../../utils/custom_toast";

export default {
  name: "CreateFarm",
  props: {
    name: {
      type: String,
      required: true,
    },
    userFarms: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const showDialogue = ref(false);
    const isCreating = ref(false);
    const gridStore = useGrid();
    const valid = ref(false);
    async function createFarm() {
      try {
        isCreating.value = true;
        await gridStore.grid.farms.create({ name: props.name });
        createCustomToast("Farm created successfully.", ToastType.success);
        createCustomToast("Table may take sometime to update the changes.", ToastType.info);
        await props.userFarms.reloadFarms();
      } catch (error) {
        console.log(error);
        createCustomToast("Failed to create farm.", ToastType.danger);
      } finally {
        isCreating.value = false;
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
  height: 2.5rem !important;
  padding-left: 10px;
}
</style>
