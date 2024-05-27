<template>
  <VCard
    class="tf-node-card rounded-0 w-100 pb-3"
    :class="{ 'selected-node': status !== 'Init' }"
    :color="
      status === 'Valid'
        ? 'rgba(var(--v-theme-primary), 0.1)'
        : status === 'Invalid'
        ? 'rgba(var(--v-theme-error), 0.1)'
        : status === 'Pending'
        ? 'rgba(var(--v-theme-warning), 0.01)'
        : undefined
    "
    :flat="flat"
    v-bind="{
      onClick: selectable
        ? () => {
            if (status === 'Init' && node) {
              $emit('node:select', (node as NodeInfo));
            }
          }
        : undefined,
    }"
  >
    <template #loader>
      <VProgressLinear indeterminate color="primary" height="2" v-if="status === 'Pending'" />
    </template>

    <template #prepend>
      <VTooltip :text="node?.location.country" :disabled="!node">
        <template #activator="{ props }">
          <VAvatar size="40">
            <span v-if="countryFlagSrc.length === 0" class="flag-avatar">NA</span>
            <img
              v-else
              :src="countryFlagSrc"
              class="h-100"
              :alt="(node?.location.country ?? 'node') + '-flag'"
              v-bind="props"
            />
          </VAvatar>
        </template>
      </VTooltip>
    </template>

    <template #title>
      Node ID: {{ node?.nodeId }}
      <VTooltip text="Node Serial Number" v-if="node && serialNumber">
        <template #activator="{ props }">
          <VChip size="x-small" v-bind="props">
            <span class="font-weight-bold" v-text="checkSerialNumber(serialNumber)" />
          </VChip>
        </template>
      </VTooltip>
      <VTooltip text="Node Country" v-if="node && node.location.country" location="left">
        <template #activator="{ props }">
          <VChip class="ml-2" size="x-small" v-bind="props">
            <span class="font-weight-bold" v-text="node?.location.country" />
          </VChip>
        </template>
      </VTooltip>
    </template>

    <template #subtitle>
      <span v-if="node"> Farm: <span class="font-weight-bold" v-text="node.farmName" /> </span>
      <span class="ml-2" v-if="node">
        Uptime:
        <span class="font-weight-bold" v-text="toReadableDate(node.uptime)" />
      </span>
    </template>

    <template #append>
      <template v-if="node">
        <div class="d-flex align-center">
          <VTooltip
            :text="dedicated ? 'This node is dedicated for one user only' : 'Multiple users can deploy on this node'"
            location="top"
            v-if="node"
          >
            <template #activator="{ props }">
              <VChip
                v-bind="props"
                class="mr-2"
                :color="dedicated ? 'success' : 'secondary'"
                :text="dedicated ? 'Dedicated' : 'Shared'"
              />
            </template>
          </VTooltip>

          <VTooltip text="Node Status" location="top" v-if="node && node.status">
            <template #activator="{ props }">
              <VChip
                v-bind="props"
                :color="getNodeStatusColor(node?.status)"
                class="mr-2"
                :text="capitalize(node.status)"
              />
            </template>
          </VTooltip>

          <VTooltip
            v-if="rentable || rented"
            location="top"
            :text="
              rentable ? 'You can rent it exclusively for your workloads' : 'Rented as full node for a single user'
            "
          >
            <template #activator="{ props }">
              <VChip
                v-if="rentable || rented"
                v-bind="props"
                class="mr-2"
                color="secondary"
                :text="rentable ? 'Rentable' : 'Rented'"
              />
            </template>
          </VTooltip>

          <VChip v-if="num_gpu" class="mr-2" color="secondary" :text="num_gpu + ' GPU'" />

          <VTooltip v-if="node && node.certificationType" location="top" text="Certification type">
            <template #activator="{ props }">
              <VChip
                v-bind="props"
                class="mr-2"
                color="primary"
                :text="
                  node?.certificationType === 'Diy' ? node?.certificationType.toUpperCase() : node?.certificationType
                "
              />
            </template>
          </VTooltip>

          <VTooltip v-if="speed" location="top" text="Network Speed Test">
            <template #activator="{ props }">
              <span v-bind="props" v-if="speed?.upload && speed?.download" class="speed-chip mr-2 grey-darken-3">
                <span>
                  <v-icon icon="mdi-arrow-up"></v-icon>
                  <span class="mx-1"> {{ formatSpeed(speed.upload) }}</span>
                </span>
                <span>
                  <v-icon icon="mdi-arrow-down"></v-icon>
                  <span class="mx-1">{{ formatSpeed(speed.download) }}</span>
                </span>
              </span>
            </template>
          </VTooltip>
        </div>
      </template>
    </template>

    <template #text>
      <VRow>
        <VCol class="tf-node-resource">
          <ResourceDetails
            name="CPU"
            :used="node?.used_resources.cru ?? 0"
            :total="node?.total_resources.cru ?? 0"
            :text="cruText"
            :cpuType="dmi?.processor[0]?.version"
          />
        </VCol>
        <VCol class="tf-node-resource">
          <ResourceDetails
            name="Memory"
            :used="node?.used_resources.mru ?? 0"
            :total="node?.total_resources.mru ?? 0"
            :text="mruText"
            :memoryType="dmi?.memory[0]?.type"
          />
        </VCol>
      </VRow>

      <VRow>
        <VCol class="tf-node-resource">
          <ResourceDetails
            name="SSD Disks"
            :used="node?.used_resources.sru ?? 0"
            :total="node?.total_resources.sru ?? 0"
            :text="sruText"
          />
        </VCol>
        <VCol class="tf-node-resource">
          <ResourceDetails
            name="HDD Disks"
            :used="node?.used_resources.hru ?? 0"
            :total="node?.total_resources.hru ?? 0"
            :text="hruText"
          />
        </VCol>
      </VRow>
      <div class="mt-5 ml-auto text-right">
        <v-tooltip bottom color="primary" close-delay="100" :disabled="!(node && node.dedicated)">
          <template v-slot:activator="{ isActive, props }">
            <span v-bind="props" v-on="isActive" class="font-weight-bold"
              ><v-icon class="scale_beat mr-2" color="warning" :disabled="!(node && node.dedicated)"
                >mdi-brightness-percent</v-icon
              >{{ formatPrice(price_usd) }} USD/Month</span
            >
          </template>
          <span>
            Discounts:
            <v-spacer />
            <ul class="pl-2">
              <li>
                {{ rentedByUser ? "You receive " : "You'll receive " }} a
                <strong class="mr-1">50%</strong>
                <a target="_blank" :href="manual?.billing_pricing">discount</a>
                {{ rentedByUser ? " as you reserve the" : " if you reserve the" }}
                entire node
              </li>
              <li>
                {{ rentedByUser ? "You receive" : "You'll receive" }} a
                <VProgressCircular indeterminate size="10" width="1" color="info" v-if="loadingStakingDiscount" />
                <strong v-else>{{ stakingDiscount }}%</strong>
                discount as per the
                <a target="_blank" :href="manual?.discount_levels"> staking discounts </a>
              </li>
            </ul>
          </span>
        </v-tooltip>

        <reserve-btn
          v-if="node?.dedicated && node?.status !== 'down'"
          class="ml-4"
          :node="(node as GridNode)"
          @updateTable="onReserveChange"
        />
      </div>
    </template>
  </VCard>
</template>
<script lang="ts">
import type { GridClient, NodeInfo, NodeResources } from "@threefold/grid_client";
import { CertificationType, type GridNode } from "@threefold/gridproxy_client";
import { computed, onMounted, ref, watch } from "vue";
import { capitalize } from "vue";

import ReserveBtn from "@/dashboard/components/reserve_action_btn.vue";
import { getCountryCode } from "@/utils/get_nodes";
import { manual } from "@/utils/manual";
import toReadableDate from "@/utils/to_readable_data";

import { useGrid, useProfileManager } from "../../stores";
import formatResourceSize from "../../utils/format_resource_size";
import { toGigaBytes } from "../../utils/helpers";
import ResourceDetails from "./node_details_internals/ResourceDetails.vue";

export default {
  name: "TfNodeDetailsCard",
  components: { ResourceDetails, ReserveBtn },
  props: {
    node: Object as () => NodeInfo | GridNode,
    status: String as () => "Init" | "Pending" | "Invalid" | "Valid",
    selectable: Boolean,
    flat: Boolean,
  },
  emits: {
    "node:select": (node: NodeInfo) => true || node,
    "update:node": (node: NodeInfo | GridNode) => true || node,
  },
  setup(props, ctx) {
    const profileManager = useProfileManager();
    const gridStore = useGrid();
    const grid = gridStore.client as unknown as GridClient;
    const node = ref(props.node);
    const stakingDiscount = ref<number>();
    const loadingStakingDiscount = ref<boolean>(false);
    const rentedByUser = computed(() => {
      return props.node?.rentedByTwinId === profileManager.profile?.twinId;
    });
    const countryFlagSrc = computed(() => {
      const countryCode = getCountryCode(props.node as GridNode);
      if (countryCode.length > 2) {
        return "";
      }

      const imageUrl =
        countryCode.toLowerCase() !== "ch"
          ? `https://www.worldatlas.com/r/w425/img/flag/${countryCode.toLowerCase()}-flag.jpg`
          : `https://www.worldatlas.com/r/w425/img/flag/${countryCode.toLowerCase()}-flag.png`;

      return imageUrl;
    });

    async function refreshStakingDiscount() {
      loadingStakingDiscount.value = true;
      if (props.node) {
        stakingDiscount.value = (await getStakingDiscount()) || 0;
      }
      loadingStakingDiscount.value = false;
    }

    watch(
      () => profileManager.profile,
      async () => {
        await refreshStakingDiscount();
      },
      { immediate: true, deep: true },
    );
    function formatPrice(price: number | null) {
      if (!price) {
        return;
      }
      if (price / 1000 > 1) {
        return price.toExponential(2);
      }
      return price.toFixed(2);
    }
    // A guard to check node type
    function isGridNode(node: unknown): node is GridNode {
      return !!node && typeof node === "object" && "num_gpu" in node;
    }

    const dedicated = computed(() => {
      if (isGridNode(node.value)) {
        return node.value?.dedicated;
      }
      return null;
    });

    const serialNumber = computed(() => {
      if (isGridNode(node.value)) {
        return null;
      }
      return node.value?.serialNumber;
    });

    const num_gpu = computed(() => {
      if (isGridNode(node.value)) {
        return node.value?.num_gpu;
      }
      return node.value?.hasGPU;
    });

    const rentable = computed(() => {
      if (isGridNode(node.value)) {
        return node.value?.rentable;
      }
      return null;
    });

    const rented = computed(() => {
      if (isGridNode(node.value)) {
        return node.value?.rented;
      }
      return null;
    });

    const speed = computed(() => {
      if (isGridNode(node.value)) {
        return node.value?.speed;
      }
      return null;
    });

    const price_usd = computed(() => {
      if (isGridNode(node.value)) {
        // convert extra fee from mili usd to usd
        const extraFee = node.value?.extraFee / 1000;
        return node.value?.price_usd + extraFee;
      }
      return null;
    });

    const dmi = computed(() => {
      if (isGridNode(node.value)) {
        return node.value?.dmi;
      }
      return null;
    });

    function normalizeBytesResource(name: "mru" | "sru" | "hru") {
      return () => {
        if (!props.node) {
          return "";
        }

        const used = formatResourceSize(props.node.used_resources[name]);
        const total = formatResourceSize(props.node.total_resources[name]);

        if (total === "0") return "";

        return `${used} / ${total}`;
      };
    }

    function checkSerialNumber(serialNumber: string) {
      if (/\d/.test(serialNumber)) {
        return serialNumber;
      } else {
        return "Unknown";
      }
    }

    const cruText = computed(() =>
      props.node ? `${props.node.used_resources.cru} / ${props.node.total_resources.cru} (Cores)` : "",
    );
    const mruText = computed(normalizeBytesResource("mru"));
    const sruText = computed(normalizeBytesResource("sru"));
    const hruText = computed(normalizeBytesResource("hru"));

    function formatSpeed(speed: number): string {
      return formatResourceSize(speed, true).toLocaleLowerCase() + "ps";
    }

    async function getStakingDiscount() {
      try {
        const total_resources = props.node?.total_resources;
        const { cru, hru, mru, sru } = total_resources as NodeResources;
        const price = await grid?.calculator.calculateWithMyBalance({
          cru,
          hru: toGigaBytes(hru),
          mru: toGigaBytes(mru),
          sru: toGigaBytes(sru),
          ipv4u: false,
          certified: props.node?.certificationType === CertificationType.Certified,
        });

        return price?.dedicatedPackage.discount;
      } catch (err) {
        console.error(err);
      }
    }

    function onReserveChange() {
      if (!node.value) {
        return;
      }

      const n = { ...node.value } as NodeInfo | GridNode;
      const gotReserved = n.rentedByTwinId === 0;

      if (gotReserved) {
        n.rentedByTwinId = profileManager.profile!.twinId;
        n.rented = true;
      } else {
        n.rentedByTwinId = 0;
        n.rented = false;
      }
      n.rentable = !n.rented;

      ctx.emit("update:node", n);
    }

    function getNodeStatusColor(status: string): string {
      if (status === "up") {
        return "success";
      } else if (status === "standby") {
        return "warning";
      } else {
        return "error";
      }
    }

    return {
      cruText,
      mruText,
      sruText,
      hruText,
      countryFlagSrc,
      dedicated,
      serialNumber,
      num_gpu,
      rentable,
      rented,
      speed,
      price_usd,
      dmi,
      manual,
      rentedByUser,
      loadingStakingDiscount,
      stakingDiscount,

      toReadableDate,
      checkSerialNumber,
      capitalize,
      formatResourceSize,
      formatSpeed,
      formatPrice,
      onReserveChange,
      getNodeStatusColor,
    };
  },
};
</script>

<style scoped>
.flag-avatar {
  padding: 20px;
  background-color: var(--primary);
  border-radius: 50%;
  color: white;
  font-weight: 700;
}

.speed-chip {
  display: flex;
  flex-direction: column !important;
  font-size: 0.7rem;
  font-weight: bold;
  background-color: rgb(var(--v-speed-chip));
  padding: 5px 12px;
  border-radius: 9999px;
}

.scale_beat {
  animation: crescendo 0.5s alternate infinite ease-in;
}

@keyframes crescendo {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.2);
  }
}

.v-icon--disabled {
  opacity: 0 !important;
}
</style>
