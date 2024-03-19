<template>
  <v-card class="pt-6 pl-6 pr-6 mb-4">
    <div class="head">
      <h2 class="text-info">
        <v-icon> {{ headerIcon }} </v-icon>
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
        :deleting="deleting"
        v-model="selectedKeys"
        :loading="loading"
        :headers="headers"
        :items="sshKeys"
      >
        <template #[`item.createdAt`]="{ item }">
          <v-tooltip location="top" :text="`The date when this SSH key was created.`">
            <template #activator="{ props }">
              <v-chip color="primary" v-bind="props">
                {{ item.raw.createdAt }}
              </v-chip>
            </template>
          </v-tooltip>
        </template>

        <template #[`item.fingerPrint`]="{ item }">
          <v-tooltip
            location="top"
            :text="`The fingerprint of an SSH key is a unique identifier generated from the key's contents. It's displayed as a sequence of hexadecimal characters and serves to verify the key's authenticity.`"
          >
            <template #activator="{ props }">
              <p v-bind="props">
                {{ item.raw.fingerPrint }}
              </p>
            </template>
          </v-tooltip>
        </template>

        <template #[`item.activation`]="{ item }">
          <v-tooltip
            v-if="item.raw.isActive"
            :text="`The '${item.raw.name}' key is currently activated and will be utilized in deployments.`"
          >
            <template #activator="{ props }">
              <v-btn
                :disabled="loading"
                v-bind="props"
                :loading="item.raw.activating"
                color="green"
                variant="outlined"
                @click="activateKey(item.raw)"
                prepend-icon="mdi-check"
              >
                Active
              </v-btn>
            </template>
          </v-tooltip>

          <v-tooltip v-else :text="`Click to activate the '${item.raw.name}' for use in deployments.`">
            <template #activator="{ props }">
              <v-btn
                :disabled="loading"
                v-bind="props"
                :loading="item.raw.activating"
                :color="theme.name.value === AppThemeSelection.light ? '' : 'grey-lighten-1'"
                variant="outlined"
                @click="activateKey(item.raw)"
              >
                Inactive
              </v-btn>
            </template>
          </v-tooltip>
        </template>

        <template #[`item.deletion`]="{ item }">
          <v-tooltip :text="`Delete ${item.raw.name}`">
            <template #activator="{ props }">
              <v-btn
                :disabled="loading || item.raw.deleting"
                :loading="item.raw.deleting"
                color="error"
                @click="deleteKey(item.raw)"
                variant="outlined"
                v-bind="props"
                class="ml-2"
              >
                <v-icon class="pt-1">mdi-trash-can-outline</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </template>
        <template #bottom></template>
      </v-data-table>
    </div>

    <div class="bottom mt-3">
      <v-tooltip location="bottom" text="Export all selected keys.">
        <template #activator="{ props }">
          <v-btn
            :disabled="loading || selectedKeys.length === 0"
            class="mr-2"
            v-bind="props"
            prepend-icon="mdi-export"
            color="primary"
            variant="tonal"
          >
            Export
          </v-btn>
        </template>
      </v-tooltip>

      <v-tooltip location="bottom" text="Delete all selected keys.">
        <template #activator="{ props }">
          <v-btn
            :disabled="loading || selectedKeys.length === 0"
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
import { capitalize, defineComponent, PropType, ref } from "vue";
import { useTheme } from "vuetify";

import { SSHKeyData, VDataTableHeader } from "@/types";
import { AppThemeSelection } from "@/utils/app_theme";
import { createCustomToast, ToastType } from "@/utils/custom_toast";

export default defineComponent({
  props: {
    sshKeys: {
      type: Object as PropType<SSHKeyData[]>,
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
  },

  components: {},

  emits: ["inactive", "active", "delete", "update:keys"],

  methods: {
    deleteSelected() {
      const filteredKeys = this.$props.sshKeys.filter(key => !this.selectedKeys.includes(key.id));
      console.log("filteredKeys, ", filteredKeys);

      this.$emit("update:keys", filteredKeys);
      this.selectedKeys = [];
    },

    deleteKey(key: SSHKeyData) {
      key.deleting = true;
      setTimeout(() => {
        this.$emit("delete", key);
        key.deleting = false;
        createCustomToast(`${key.name} key has been successfully removed.`, ToastType.success);
      }, 3000);
    },

    activateKey(key: SSHKeyData) {
      key.activating = true;
      setTimeout(() => {
        if (key.isActive) {
          this.$emit("inactive", key);
          createCustomToast(`The activation of ${key.name} key has been disabled.`, ToastType.success);
        } else {
          this.$emit("active", key);
          createCustomToast(`The activation of ${key.name} key has been enabled.`, ToastType.success);
        }
        key.activating = false;
      }, 3000);
    },
  },

  setup() {
    const deleting = ref<boolean>(false);
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
        title: "Deletion",
        key: "deletion",
      },
    ];

    return { headers, selectedKeys, capitalize, deleting, theme, AppThemeSelection };
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
