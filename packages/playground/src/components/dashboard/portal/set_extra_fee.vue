<template>
  <span>
    <v-tooltip text="Set Additional Fees">
      <template #activator="{ props }">
        <v-icon v-bind="props" size="small" :disabled="isAdding" :loading="isAdding" @click="showDialogue = true">
          mdi-code-string
        </v-icon>
      </template>
    </v-tooltip>

    <span v-if="showDialogue">
      <v-dialog v-model="showDialogue" max-width="600">
        <v-card>
          <v-toolbar color="primary" dark class="custom-toolbar">
            <p class="mb-5">Set Additional Fees</p>
          </v-toolbar>
          <v-card-text>
            Additional fees will be added to your node {{ $props.nodeId }} (for the special hardware you’re providing
            e.g. GPUs) while renting.
          </v-card-text>
          <div class="pt-6 px-6">
            <form-validator v-model="valid">
              <input-validator
                :value="fee"
                :rules="[
                  validators.required('Fee is required.'),
                  validators.isNumeric('Fee must be a valid number.'),
                  validators.min('Fee must be a 0 or more.', 0),
                ]"
                #="{ props }"
              >
                <input-tooltip tooltip="Fee is in USD/month">
                  <v-text-field
                    v-model="fee"
                    v-bind:="props"
                    suffix="USD/month"
                    outlined
                    label="Additional Fees"
                    :disabled="isSetting"
                  ></v-text-field>
                </input-tooltip>
              </input-validator>
            </form-validator>
          </div>
          <v-card-actions class="justify-end px-5 pb-5 pt-0">
            <v-btn
              color="primary"
              variant="tonal"
              @click="setExtraFee()"
              :loading="isSetting"
              :disabled="!valid || isSetting || isDisabled"
              >Save</v-btn
            >
            <v-btn @click="showDialogue = false" class="grey lighten-2 black--text">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </span>
  </span>
</template>

<script lang="ts">
import { onMounted, ref, watch } from "vue";

import { useGrid } from "../../../stores";
import { createCustomToast, ToastType } from "../../../utils/custom_toast";

export default {
  name: "SetExtraFee",
  props: {
    nodeId: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const showDialogue = ref(false);
    const isAdding = ref(false);
    const gridStore = useGrid();
    const valid = ref(false);
    const isSetting = ref(false);
    const fee = ref<number>(0);
    const isDisabled = ref(false);

    onMounted(async () => {
      fee.value = (await getExtraFee()) as unknown as number;
    });

    async function getExtraFee() {
      try {
        const extraFee = await gridStore.grid.contracts.getDedicatedNodeExtraFee({ nodeId: props.nodeId });
        return extraFee;
      } catch (error) {
        console.log(error);
      }
    }

    watch(fee, async (value, oldValue) => {
      const currentFee = await getExtraFee();
      if (value == currentFee || value === null) {
        isDisabled.value = true;
      } else {
        isDisabled.value = false;
      }
    });

    async function setExtraFee() {
      try {
        isSetting.value = true;
        await gridStore.grid.contracts.setDedicatedNodeExtraFee({
          nodeId: props.nodeId,
          extraFee: +fee.value,
        });
        createCustomToast("Additional fee is set successfully.", ToastType.success);
        await getExtraFee();
      } catch (error) {
        createCustomToast("Failed to set additional fees!", ToastType.danger);
      } finally {
        isSetting.value = false;
      }
    }

    return {
      showDialogue,
      isAdding,
      valid,
      fee,
      isSetting,
      isDisabled,
      setExtraFee,
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
