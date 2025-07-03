<template>
  <v-dialog
    v-model="$props.open"
    max-width="800"
    attach="#modals"
    @click:outside="() => $emit('close')"
    @keydown.esc="() => $emit('close')"
  >
    <template #default>
      <v-card>
        <v-toolbar color="primary" class="custom-toolbar">
          <p class="mb-5">
            SSH-Key Details
          </p>
        </v-toolbar>
        <v-card-text>
          <template v-for="[_key, value] of Object.entries(selectedKey).sort()" :key="_key">
            <template v-if="!notNeededFields.includes(_key)">
              <CopyInputWrapper v-if="_key !== 'publicKey'" :data="value" #="{ props: copyInputProps }">
                <v-text-field
                  v-bind="{ ...copyInputProps }"
                  v-model="currentKey[_key as keyof SSHKeyData]"
                  :label="_key"
                  :readonly="_key === 'fingerPrint'"
                  :rules="[(value: string) => !!value || `${_key} is required.`, _key === 'name' ? validateName(currentKey.name): true]"
                />
              </CopyInputWrapper>
              <CopyInputWrapper v-else :data="value" #="{ props: copyInputProps }">
                <v-textarea
                  v-model="currentKey[_key]"
                  :class="value.length ? 'ssh-key' : ''"
                  label="Public SSH Key"
                  no-resize
                  :spellcheck="false"
                  :rules="sshRules()"
                  v-bind="{ ...copyInputProps }"
                />
              </CopyInputWrapper>
            </template>
          </template>

          <v-tooltip text="Key status">
            <template #activator="{ props }">
              <v-chip v-if="selectedKey.isActive" v-bind="props">
                Active
              </v-chip>
              <v-chip v-else v-bind="props" color="anchor">
                Inactive
              </v-chip>
            </template>
          </v-tooltip>

          <v-tooltip text="Created at">
            <template #activator="{ props }">
              <v-chip v-bind="props" class="ma-2">
                {{ selectedKey.createdAt }}
              </v-chip>
            </template>
          </v-tooltip>
          <v-divider />
        </v-card-text>

        <v-card-actions class="justify-end mb-1 mr-2">
          <v-btn color="anchor" text="Close" @click="$emit('close')" />
          <v-btn text="Save" :loading="loading" @click="updateKey" />
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
  emits: ["close", "update"],
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

    function sshRules() {
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
</style>
