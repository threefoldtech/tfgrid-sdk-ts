<template>
  <v-dialog
    @click:outside="() => $emit('close')"
    @keydown.esc="() => $emit('close')"
    v-model="$props.open"
    max-width="800"
  >
    <template v-slot:default>
      <v-card>
        <v-toolbar color="primary" class="custom-toolbar">
          <p class="mb-5">SSH-Key Details</p>
        </v-toolbar>
        <v-card-text>
          <template v-for="[_key, value] of Object.entries(selectedKey).sort()" :key="_key">
            <template v-if="!notNeededFields.includes(_key)">
              <CopyInputWrapper v-if="_key !== 'publicKey'" :data="value" #="{ props: copyInputProps }">
                <v-text-field
                  v-bind="{ ...copyInputProps }"
                  :label="_key"
                  v-model="currentKey[_key as keyof SSHKeyData]"
                  :readonly="_key === 'fingerPrint'"
                  :rules="[(value: string) => !!value || `${_key} is required.`, _key === 'name' ? validateName(currentKey.name): true]"
                />
              </CopyInputWrapper>
              <CopyInputWrapper v-else :data="value" #="{ props: copyInputProps }">
                <v-textarea
                  :class="value.length ? 'ssh-key' : ''"
                  v-model="currentKey[_key]"
                  label="Public SSH Key"
                  no-resize
                  :spellcheck="false"
                  :rules="sshRules(currentKey[_key])"
                  v-bind="{ ...copyInputProps }"
                />
              </CopyInputWrapper>
            </template>
          </template>

          <v-tooltip text="Key status">
            <template #activator="{ props }">
              <v-chip v-bind="props" v-if="selectedKey.isActive">Active</v-chip>
              <v-chip v-bind="props" color="anchor" v-else>Inactive</v-chip>
            </template>
          </v-tooltip>

          <v-tooltip text="Created at">
            <template #activator="{ props }">
              <v-chip v-bind="props" class="ml-2">{{ selectedKey.createdAt }}</v-chip>
            </template>
          </v-tooltip>
        </v-card-text>

        <v-card-actions class="mb-3 custom-actions">
          <v-spacer></v-spacer>
          <div class="mt-2">
            <v-btn color="white" text="Close" @click="$emit('close')"></v-btn>
            <v-btn text="Save" @click="updateKey" :loading="loading"></v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script lang="ts">
import { capitalize, defineComponent, type PropType, ref, watch } from "vue";

import type { SSHKeyData } from "@/types";
import SSHKeysManagement from "@/utils/ssh";

export default defineComponent({
  name: "SSHDataDialog",
  emits: ["close", "update"],
  props: {
    open: {
      type: Boolean,
      required: true,
    },
    selectedKey: {
      type: Object as PropType<SSHKeyData>,
      required: true,
    },
    allKeys: {
      type: Object as PropType<SSHKeyData[]>,
      required: true,
    },
  },
  setup(props, ctx) {
    const currentKey = ref<SSHKeyData>(props.selectedKey);
    const loading = ref<boolean>(false);

    watch(
      () => props.open,
      newValue => {
        if (newValue) {
          currentKey.value = { ...props.selectedKey };
          loading.value = false;
        }
      },
    );

    const notNeededFields = ["id", "activating", "deleting", "isActive", "createdAt"];
    const sshKeysManagement = new SSHKeysManagement();
    const updateKey = () => {
      loading.value = true;
      ctx.emit("update", currentKey.value);
    };

    function sshRules(value: any) {
      return [
        (v: string) => !!v || " The SSH key is required.",
        (v: string) =>
          sshKeysManagement.isValidSSHKey(v) ||
          "The SSH key you provided is not valid. Please double-check that it is copied correctly and follows the correct format.",
        (v: string) => {
          if (v === props.selectedKey.publicKey) {
            return true;
          }
          const found = props.allKeys.find(key => key.publicKey === v);
          return found ? "You have another key with the same public key." : true;
        },
      ];
    }

    function validateName(name: string): string | boolean {
      if (name === props.selectedKey.name) {
        return true;
      }
      const found = props.allKeys.find(key => key.name === name);
      return found ? "You have another key with the same name." : true;
    }

    return {
      notNeededFields,
      capitalize,
      updateKey,
      currentKey,
      sshRules,
      loading,
      validateName,
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
