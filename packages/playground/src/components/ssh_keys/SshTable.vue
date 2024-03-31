<template>
  <v-card class="pt-6 pl-6 pr-6 mb-4">
    <div class="head">
      <h2 class="text-light">
        <v-icon>{{ headerIcon }}</v-icon>
        {{ headerTitle }}
      </h2>
    </div>

    <div class="table mt-3">
      <v-alert type="info">
        Clicking on the <strong>Active</strong> or <strong>Inactive</strong> status will toggle the
        <strong>activation</strong>/<strong>deactivation</strong> of the key.
      </v-alert>

      <v-data-table
        show-select
        :no-data-text="capitalize(`No keys found.`)"
        class="pa-5"
        v-model:selectedKeys="selectedKeys"
        :loading="loading"
        :headers="headers"
        :items="sshKeys"
        loading-text="Loading..."
      >
        <template #loading> </template>
        <!-- :on-click:row="() => {}" -->
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

        <template #[`item.viewing`]="{ item }">
          <v-tooltip :text="`View ${item.raw.name}'s key.`" location="bottom">
            <template #activator="{ props }">
              <v-btn
                @click="$emit('view', item.raw)"
                v-bind="props"
                color="grey-lighten-1"
                variant="text"
                :disabled="loading"
                icon="mdi-eye"
              ></v-btn>
            </template>
          </v-tooltip>
        </template>

        <template #[`item.activation`]="{ item }">
          <v-tooltip
            location="bottom"
            v-if="item.raw.isActive"
            :text="`The '${item.raw.name}' key is currently activated and will be utilized in deployments.`"
          >
            <template #activator="{ props }">
              <v-btn
                :disabled="loading"
                v-bind="props"
                :loading="item.raw.activating"
                color="secondary"
                variant="elevated"
                @click="activateKey(item.raw)"
                prepend-icon="mdi-check"
                width="100"
              >
                Active
              </v-btn>
            </template>
          </v-tooltip>

          <v-tooltip
            location="bottom"
            v-else
            :text="`Click to activate the '${item.raw.name}' for use in deployments.`"
          >
            <template #activator="{ props }">
              <v-btn
                :disabled="loading"
                v-bind="props"
                :loading="item.raw.activating"
                :color="theme.name.value === AppThemeSelection.light ? '' : 'grey-lighten-1'"
                variant="tonal"
                @click="activateKey(item.raw)"
                width="100"
              >
                Inactive
              </v-btn>
            </template>
          </v-tooltip>
        </template>

        <template #[`item.deletion`]="{ item }">
          <v-tooltip location="bottom" :text="`Delete ${item.raw.name}`">
            <template #activator="{ props }">
              <v-btn
                :disabled="loading || item.raw.deleting"
                :loading="item.raw.deleting"
                @click="deleteKey(item.raw)"
                color="grey-lighten-1"
                variant="text"
                v-bind="props"
                class="ml-2"
                icon="mdi-trash-can-outline"
              >
              </v-btn>
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
    headerTitle: {
      type: String,
      required: true,
    },
    headerIcon: {
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

  emits: ["inactive", "active", "delete", "view", "update:keys", "export"],

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
        title: "Creation Datetime",
        key: "createdAt",
      },
      {
        title: "Key Fingerprint",
        key: "fingerPrint",
      },
      {
        title: "Activation",
        key: "activation",
      },
      {
        title: "Viewing",
        key: "viewing",
      },
      {
        title: "Deletion",
        key: "deletion",
      },
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

    const activateKey = (key: SSHKeyData) => {
      if (key.isActive) {
        emit("inactive", key);
      } else {
        emit("active", key);
      }
    };

    return { headers, selectedKeys, capitalize, theme, AppThemeSelection, deleteSelected, deleteKey, activateKey };
  },
});
</script>

<style scoped>
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
</style>
