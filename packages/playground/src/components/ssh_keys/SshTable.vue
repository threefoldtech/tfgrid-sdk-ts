<template>
  <v-card class="pt-6 pl-6 pr-6 mb-4">
    <div class="head">
      <h3 class="text-light text-subtitle-1">
        <v-icon>mdi-key-chain</v-icon>
        SSH Keys
      </h3>
    </div>

    <div class="table mt-3">
      <v-data-table
        show-select
        :no-data-text="capitalize(`No keys found.`)"
        class="pa-5"
        v-model="selectedKeys"
        :loading="loading"
        :headers="headers"
        :items="sshKeys"
        loading-text="Loading..."
        @click:row="(_: any, { item }: any) => $emit('view', item.raw)"
      >
        <template #loading>
          <div class="w-100 text-center" v-if="loading && loadingMessage">
            <small>{{ loadingMessage }}</small>
          </div>
        </template>
        <template #[`item.createdAt`]="{ item }">
          <v-tooltip location="bottom" :text="`The date when this SSH key was created.`">
            <template #activator="{ props }">
              <v-chip color="primary" v-bind="props">
                {{ item.raw.createdAt }}
              </v-chip>
            </template>
          </v-tooltip>
        </template>

        <template #[`item.name`]="{ item }">
          <v-tooltip
            location="bottom"
            :text="`This name is used to associate between the key and its corresponding system or deployment.`"
          >
            <template #activator="{ props }">
              <p v-bind="props">
                {{ item.raw.name || "-" }}
              </p>
            </template>
          </v-tooltip>
        </template>

        <template #[`item.fingerPrint`]="{ item }">
          <v-tooltip
            location="bottom"
            :text="`The fingerprint of an SSH key is a unique identifier generated from the key's contents. It's displayed as a sequence of hexadecimal characters and serves to verify the key's authenticity.`"
          >
            <template #activator="{ props }">
              <p v-bind="props">
                {{ item.raw.fingerPrint || "-" }}
              </p>
            </template>
          </v-tooltip>
        </template>

        <template #[`item.activation`]="{ item }">
          <v-tooltip
            location="bottom"
            :text="
              item.raw.isActive
                ? `The '${item.raw.name}' key is currently activated and will be utilized in deployments.`
                : `Click to activate the '${item.raw.name}' for use in deployments.`
            "
          >
            <template #activator="{ props }">
              <v-progress-circular
                v-if="item.raw.activating"
                :size="20"
                :width="2"
                color="info"
                indeterminate
              ></v-progress-circular>
              <VCheckboxBtn
                v-else
                class="d-inline"
                v-bind="props"
                color="secondary"
                @click.stop="toggleKeyActivation(item.raw)"
                :model-value="item.raw.isActive"
                :disabled="deleting"
              />
            </template>
          </v-tooltip>
        </template>

        <template #bottom></template>
      </v-data-table>
    </div>

    <div class="bottom mt-3 d-flex justify-end">
      <v-tooltip location="bottom" text="Export all selected keys.">
        <template #activator="{ props }">
          <v-btn
            :disabled="loading || selectedKeys.length === 0 || $props.sshKeys.length === 0 || deleting"
            class="mr-2"
            :loading="loading"
            v-bind="props"
            prepend-icon="mdi-export"
            color="primary"
            variant="tonal"
            @click="() => $emit('export', selectedKeys)"
          >
            Export
          </v-btn>
        </template>
      </v-tooltip>

      <v-tooltip location="bottom" text="Delete all selected keys.">
        <template #activator="{ props }">
          <v-btn
            :disabled="loading || selectedKeys.length === 0 || deleting"
            :loading="deleting"
            v-bind="props"
            variant="tonal"
            prepend-icon="mdi-trash-can-outline"
            color="error"
            @click="deleteSelected"
          >
            Delete
          </v-btn>
        </template>
      </v-tooltip>
    </div>
  </v-card>
</template>

<script lang="ts">
import { capitalize, defineComponent, type PropType, ref } from "vue";
import { useTheme } from "vuetify";

import type { SSHKeyData, VDataTableHeader } from "@/types";
import { AppThemeSelection } from "@/utils/app_theme";

export default defineComponent({
  props: {
    sshKeys: {
      type: Array as PropType<SSHKeyData[]>,
      required: true,
    },
    loadingMessage: {
      type: String,
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    },
    deleting: {
      type: Boolean,
      required: true,
    },
  },

  emits: ["delete", "view", "update:activation", "export"],

  setup(props, { emit }) {
    const selectedKeys = ref<number[]>([]); // IDs
    const theme = useTheme();

    const headers: VDataTableHeader = [
      {
        title: "ID",
        key: "id",
      },
      {
        title: "Name",
        key: "name",
      },
      {
        title: "Created At",
        key: "createdAt",
      },
      {
        title: "Key Fingerprint",
        key: "fingerPrint",
      },

      // TODO: Update the below `Column` to make the user activate/deactivate more than one key.
      // after fixing this issue: https://github.com/threefoldtech/tf-images/issues/231
      // {
      //   title: "Active",
      //   key: "activation",
      //   sortable: false,
      // },
    ];

    const deleteSelected = () => {
      const ids: number[] = [];
      Object.keys(selectedKeys.value).forEach(key => ids.push(selectedKeys.value[key as any]));

      const filteredKeys = props.sshKeys.filter(_key => ids.includes(_key.id));
      emit("delete", filteredKeys);
      selectedKeys.value = [];
    };

    const deleteKey = (key: SSHKeyData) => {
      emit("delete", [key]);
    };

    const toggleKeyActivation = (key: SSHKeyData) => {
      emit("update:activation", key);
    };

    return {
      headers,
      selectedKeys,
      theme,
      AppThemeSelection,
      capitalize,
      deleteSelected,
      deleteKey,
      toggleKeyActivation,
    };
  },
});
</script>

<style>
.head {
  border-bottom: 1px solid #8d848d;
  padding-bottom: 15px;
}

.bottom {
  width: 100%;
  border-top: 1px solid #8d848d;
  padding: 15px;
}
.activation {
  cursor: pointer;
}
.v-data-table-rows-loading td {
  padding: 0 !important;
  margin: 0 !important;
  height: 25px !important;
}
</style>
