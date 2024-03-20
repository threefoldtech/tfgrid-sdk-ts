<template>
  <v-dialog @keydown.esc="$emit('close')" v-model="$props.open" max-width="750">
    <template v-slot:default>
      <v-card>
        <v-toolbar color="primary" class="custom-toolbar">
          <p class="mb-5">{{ capitalize(selectedKey.name || "") }} Detials</p>
        </v-toolbar>

        <v-card-text>
          <template v-for="[_key, value] of Object.entries(selectedKey).sort()" :key="_key">
            <template v-if="!notNeededFields.includes(_key)">
              <v-text-field v-if="_key !== 'key'" :label="_key" :model-value="value" :readonly="true" />
              <CopyInputWrapper v-else :data="value" #="{ props: copyInputProps }">
                <v-textarea
                  :class="value.length ? 'ssh-key' : ''"
                  :model-value="value"
                  :readonly="true"
                  label="Public SSH Key"
                  no-resize
                  :spellcheck="false"
                  v-bind="{ ...copyInputProps }"
                />
              </CopyInputWrapper>
            </template>
          </template>

          <v-tooltip text="Key status">
            <template #activator="{ props }">
              <v-chip v-bind="props" color="primary" v-if="selectedKey.isActive">Active</v-chip>
              <v-chip v-bind="props" color="grey-lighten-1" v-else>Inactive</v-chip>
            </template>
          </v-tooltip>

          <v-tooltip text="Created at">
            <template #activator="{ props }">
              <v-chip v-bind="props" class="ml-2" color="primary">{{ selectedKey.createdAt }}</v-chip>
            </template>
          </v-tooltip>
        </v-card-text>

        <v-card-actions class="mb-3 custom-actions">
          <v-spacer></v-spacer>
          <div class="mr-4">
            <v-btn color="white" variant="outlined" text="Close" @click="$emit('close')"></v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script lang="ts">
import { capitalize, defineComponent, PropType } from "vue";

import { SSHKeyData } from "@/types";

export default defineComponent({
  name: "SSHDataDialog",
  props: {
    open: {
      type: Boolean,
      required: true,
    },
    selectedKey: {
      type: Object as PropType<SSHKeyData>,
      required: true,
    },
  },
  setup() {
    const notNeededFields = ["id", "activating", "deleting", "isActive", "createdAt"];
    return {
      notNeededFields,
      capitalize,
    };
  },
});
</script>

<style>
.custom-toolbar {
  height: 2.5rem !important;
  padding-left: 10px;
}
.ssh-key .v-field__input {
  height: 230px !important;
}
.custom-actions {
  border-top: 1px solid rgb(101 99 99);
  display: flex;
  justify-content: center;
  margin-right: 15px;
  margin-left: 15px;
  margin-top: 15px;
}
</style>
