<template>
  <v-card class="pt-6 pl-6 pr-6 mb-4" variant="tonal">
    <div class="head">
      <h2 class="text-info">
        <v-icon> {{ headerIcon }} </v-icon>
        {{ headerTitle }}
      </h2>
    </div>

    <div class="table">
      <list-table
        class="pa-5 mt-3"
        :deleting="false"
        v-model="selectedKeys"
        :loading="loading"
        :headers="headers"
        :items="sshKeys"
      >
        <template #[`item.lastUsed`]="{ item }">
          <v-tooltip location="top" :text="`The most recent deployment activity associated with this SSH key.`">
            <template #activator="{ props }">
              <v-chip color="primary" v-bind="props">
                {{ item.value.lastUsed }}
              </v-chip>
            </template>
          </v-tooltip>
        </template>

        <template #[`item.createdAt`]="{ item }">
          <v-tooltip location="top" :text="`The date when this SSH key was created.`">
            <template #activator="{ props }">
              <v-chip color="primary" v-bind="props">
                {{ item.value.createdAt }}
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
                {{ item.value.fingerPrint }}
              </p>
            </template>
          </v-tooltip>
        </template>

        <template #[`item.activation`]="{ item }">
          <v-tooltip
            v-if="item.value.isActive"
            :text="`The '${item.value.name}' key is currently activated and will be utilized in deployments.`"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                :loading="item.value.activating"
                color="green"
                variant="tonal"
                @click="activateKey(item.value)"
                prepend-icon="mdi-check"
              >
                Active
              </v-btn>
            </template>
          </v-tooltip>

          <v-tooltip v-else :text="`Click to activate the '${item.value.name}' for use in deployments.`">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                :loading="item.value.activating"
                color="grey-lighten-1"
                variant="tonal"
                @click="activateKey(item.value)"
              >
                Inactive
              </v-btn>
            </template>
          </v-tooltip>
        </template>

        <template #[`item.deletion`]="{ item }">
          <v-tooltip :text="`Delete ${item.value.name}`">
            <template #activator="{ props }">
              <v-btn
                :disabled="loading || item.value.deleting"
                :loading="item.value.deleting"
                color="error"
                @click="deleteKey(item.value)"
                variant="tonal"
                v-bind="props"
                class="ml-2"
              >
                <v-icon class="pt-1">mdi-trash-can-outline</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </template>
      </list-table>
    </div>

    <div class="bottom mt-3">
      <v-tooltip location="bottom" text="Export all selected keys.">
        <template #activator="{ props }">
          <v-btn
            :disabled="selectedKeys.length !== sshKeys.length"
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
            :disabled="selectedKeys.length !== sshKeys.length"
            v-bind="props"
            variant="tonal"
            prepend-icon="mdi-trash-can-outline"
            color="error"
          >
            Delete
          </v-btn>
        </template>
      </v-tooltip>
    </div>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from "vue";

import ListTable from "@/components/list_table.vue";
import { SSHKeyData, VDataTableHeader } from "@/types";
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
  },

  components: {
    ListTable,
  },

  emits: ["inactive", "active", "delete"],

  methods: {
    deleteKey(item: SSHKeyData) {
      item.deleting = true;
      setTimeout(() => {
        this.$emit("delete", item);
        item.deleting = false;
        createCustomToast(`${item.name} key has been successfully removed.`, ToastType.success);
      }, 3000);
    },

    activateKey(item: SSHKeyData) {
      item.activating = true;
      setTimeout(() => {
        if (item.isActive) {
          this.$emit("inactive", item);
          createCustomToast(`The activation of ${item.name} key has been disabled.`, ToastType.success);
        } else {
          this.$emit("active", item);
          createCustomToast(`The activation of ${item.name} key has been enabled.`, ToastType.success);
        }
        item.activating = false;
      }, 3000);
    },
  },

  setup() {
    const loading = ref<boolean>(false);
    const selectedKeys = ref<SSHKeyData[]>([]);

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
        title: "Last Used",
        key: "lastUsed",
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

    return { headers, loading, selectedKeys };
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
