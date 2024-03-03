<template>
  <ViewLayout>
    <VCard>
      <VCardTitle class="bg-primary text-center">
        <VIcon icon="mdi-calculator" />
        Pricing Calculator
      </VCardTitle>
      <VCardText>
        <VContainer fluid>
          <VAlert type="info" class="mb-10">
            For more information about Threefold Pricing check
            <a
              class="app-link"
              target="_blank"
              href="https://manual.grid.tf/wiki/cloudunits/pricing/pricing.html#cloud-unit-pricing"
              v-text="'here'"
            />
          </VAlert>

          <VForm v-model="valid">
            <VRow>
              <VCol cols="6">
                <InputTooltip tooltip="The number of virtual cores.">
                  <VTextField
                    label="CPU (vCores)"
                    suffix="vCores"
                    type="number"
                    min="1"
                    max="256"
                    :rules="[cruRules]"
                    v-model.number="resources.cru"
                  />
                </InputTooltip>
              </VCol>

              <VCol cols="6">
                <InputTooltip tooltip="The amount of RAM (Random Access Memory) in GB.">
                  <VTextField
                    label="Memory (GB)"
                    type="number"
                    suffix="GB"
                    min="1"
                    max="1024"
                    :rules="[mruRules]"
                    v-model.number="resources.mru"
                  />
                </InputTooltip>
              </VCol>

              <VCol cols="6">
                <InputTooltip tooltip="The SSD capacity storage.">
                  <VTextField
                    label="Disk SSD"
                    suffix="GB"
                    type="number"
                    min="1"
                    max="1000000"
                    :rules="[sruRules]"
                    v-model.number="resources.sru"
                  />
                </InputTooltip>
              </VCol>

              <VCol cols="6">
                <InputTooltip tooltip="The HDD capacity storage.">
                  <VTextField
                    label="Disk HDD"
                    suffix="GB"
                    type="number"
                    min="0"
                    max="1000000"
                    :rules="[hruRules]"
                    v-model.number="resources.hru"
                  />
                </InputTooltip>
              </VCol>

              <VCol cols="12">
                <InputTooltip tooltip="The amount of TFT to calculate discount.">
                  <VTextField
                    label="Balance"
                    suffix="TFT"
                    type="number"
                    :rules="[balanceRules]"
                    v-model.number="resources.balance"
                  />
                </InputTooltip>
              </VCol>

              <VCol cols="4">
                <InputTooltip
                  inline
                  tooltip=" A certified node will receive 25% more reward compared to a non-certified node."
                >
                  <VSwitch color="primary" inset label="Certified Node" hide-details v-model="resources.certified" />
                </InputTooltip>
              </VCol>

              <VCol cols="4">
                <InputTooltip
                  inline
                  tooltip="An Internet Protocol version 4 address that is globally unique and accessible over the internet"
                >
                  <VSwitch color="primary" inset label="With a Public IPv4" hide-details v-model="resources.ipv4" />
                </InputTooltip>
              </VCol>

              <VCol cols="4">
                <input-tooltip inline tooltip="Use current balance to calculate the discount.">
                  <VSwitch
                    color="primary"
                    inset
                    label="Use current balance"
                    hide-details
                    v-model="resources.useCurrentBalance"
                  />
                </input-tooltip>
              </VCol>
            </VRow>
          </VForm>

          <VDivider class="my-8" />

          <VRow class="text-center text-body-1">
            <VCol cols="6">
              <div class="rounded bg-white pa-4 h-100 d-flex justify-center align-center">
                <p>
                  Cost of reserving a <strong v-text="'Dedicated Node'" /> of the same specifications<br />
                  <strong v-text="'$2.1750/month, 120.8300 TFT/month'" />. A user can reserve an entire node then use it
                  exclusively to deploy solutions
                </p>
              </div>
            </VCol>
            <VCol cols="6">
              <div class="rounded bg-white pa-4 h-100 d-flex justify-center align-center">
                <p>
                  Cost of reservation on a <strong v-text="'Shared Node'" /><br />
                  <strong v-text="'$4.3500/month, 241.6700 TFT/month'" />. Shared Nodes allow several users to host
                  various workloads on a single node
                </p>
              </div>
            </VCol>
          </VRow>
        </VContainer>
      </VCardText>
    </VCard>
  </ViewLayout>
</template>

<script lang="ts">
import { ref } from "vue";

import { balanceRules, cruRules, hruRules, mruRules, sruRules } from "../utils/pricing_calculator";

export default {
  name: "PricingCalculator",
  setup() {
    const valid = ref(false);
    const resources = ref({
      cru: 1,
      mru: 1,
      sru: 25,
      hru: 100,
      balance: 0,
      certified: false,
      ipv4: false,
      useCurrentBalance: false,
    });

    return {
      valid,
      cruRules,
      mruRules,
      sruRules,
      hruRules,
      balanceRules,
      resources,
    };
  },
};
</script>
