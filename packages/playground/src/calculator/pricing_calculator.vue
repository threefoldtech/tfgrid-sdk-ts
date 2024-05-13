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
            For more information about Threefold Pricing check,
            <a class="app-link" target="_blank" :href="manual.pricing" v-text="'Cloud Unit Pricing'" />
          </VAlert>

          <VForm
            ref="form"
            @vue:mounted="($refs.form as VForm).validate()"
            :model-value="valid"
            @update:model-value="
              valid = $event as boolean;
              if ($event) {
                priceTask.run();
              }
            "
            @input="priceTask.run()"
          >
            <VRow>
              <VCol cols="6">
                <InputTooltip tooltip="The number of virtual cores.">
                  <VTextField
                    label="CPU (vCores)"
                    suffix="vCores"
                    min="1"
                    max="256"
                    :rules="[cruRules]"
                    v-model="resources.cru"
                  />
                </InputTooltip>
              </VCol>

              <VCol cols="6">
                <InputTooltip tooltip="The amount of RAM (Random Access Memory) in GB.">
                  <VTextField
                    label="Memory (GB)"
                    suffix="GB"
                    min="1"
                    max="1024"
                    :rules="[mruRules]"
                    v-model="resources.mru"
                  />
                </InputTooltip>
              </VCol>

              <VCol cols="6">
                <InputTooltip tooltip="The SSD capacity storage.">
                  <VTextField
                    label="Disk SSD"
                    suffix="GB"
                    min="1"
                    max="1000000"
                    :rules="[sruRules]"
                    v-model="resources.sru"
                  />
                </InputTooltip>
              </VCol>

              <VCol cols="6">
                <InputTooltip tooltip="The HDD capacity storage.">
                  <VTextField
                    label="Disk HDD"
                    suffix="GB"
                    min="0"
                    max="1000000"
                    :rules="[hruRules]"
                    v-model="resources.hru"
                  />
                </InputTooltip>
              </VCol>

              <VCol cols="6">
                <InputTooltip tooltip="To input network bandwidth, The public IPv4 should be enabled.">
                  <VTextField
                    label="Bandwidth"
                    suffix="GB"
                    min="0"
                    max="1000000"
                    :disabled="!resources.ipv4"
                    :rules="[nuRules]"
                    v-model="resources.nu"
                  />
                </InputTooltip>
              </VCol>

              <VCol cols="6">
                <InputTooltip tooltip="The amount of TFT to calculate discount.">
                  <VTextField
                    label="Balance"
                    suffix="TFT"
                    :rules="[balanceRules]"
                    :disabled="userBalance && resources.useCurrentBalance"
                    :model-value="userBalance && resources.useCurrentBalance ? userBalance.free : resources.balance"
                    @update:model-value="resources.balance = $event"
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

              <VCol
                cols="4"
                v-if="userBalance"
                @vue:unmounted="
                  resources.useCurrentBalance = true;
                  priceTask.run();
                "
              >
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
          <VRow v-if="valid && priceTask.error">
            <VCol cols="12">
              <VAlert type="error" :text="normalizeError(priceTask.error, 'Failed to calculate price.')" />
            </VCol>
          </VRow>

          <VRow class="text-center text-body-1 text-black" v-else-if="valid">
            <VCol cols="6">
              <div
                class="rounded pa-4 h-100 d-flex justify-center align-center"
                :style="{ background: computePackageColor(priceTask.data?.dedicatedPackage.package) }"
              >
                <p>
                  Cost of reserving a <strong v-text="'Dedicated Node'" /> of the same specifications<br />
                  <strong v-text="'Loading...'" v-if="priceTask.loading" />
                  <strong v-else v-text="dedicatedPriceUSD + ' USD/month, ' + dedicatedPriceTFT + ' TFT/month'" />. A
                  user can reserve an entire node then use it exclusively to deploy solutions
                </p>
              </div>
            </VCol>
            <VCol cols="6">
              <div
                class="rounded pa-4 h-100 d-flex justify-center align-center"
                :style="{ background: computePackageColor(priceTask.data?.sharedPackage.package) }"
              >
                <p>
                  Cost of reservation on a <strong v-text="'Shared Node'" /><br />
                  <strong v-text="'Loading...'" v-if="priceTask.loading" />
                  <strong v-else v-text="sharedPriceUSD + ' USD/month, ' + sharedPriceTFT + ' TFT/month'" />. Shared
                  Nodes allow several users to host various workloads on a single node
                </p>
              </div>
            </VCol>
          </VRow>

          <VRow v-else>
            <VCol cols="12">
              <VAlert type="error">
                Please provide a valid data in order to calculate your deployment price correctly.
              </VAlert>
            </VCol>
          </VRow>
        </VContainer>
      </VCardText>
    </VCard>
  </ViewLayout>
</template>

<script lang="ts">
import { QueryClient } from "@threefold/tfchain_client";
import { computed, ref } from "vue";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { VForm } from "vuetify/components/VForm";

import { manual } from "@/utils/manual";

import { calculator as Calculator } from "../../../grid_client/dist/es6";
import { useProfileManagerController } from "../components/profile_manager_controller.vue";
import { useAsync } from "../hooks";
import { useProfileManager } from "../stores";
import { normalizeError } from "../utils/helpers";
import { balanceRules, cruRules, hruRules, mruRules, nuRules, sruRules } from "../utils/pricing_calculator";
import { computePackageColor, normalizePrice } from "../utils/pricing_calculator";

export default {
  name: "PricingCalculator",
  setup() {
    const calculator = new Calculator(new QueryClient(window.env.SUBSTRATE_URL));
    const profileManager = useProfileManager();
    const userBalance = useProfileManagerController().balance;
    const valid = ref(true);
    const resources = ref({
      cru: "1",
      mru: "1",
      sru: "25",
      hru: "100",
      nu: "0",
      balance: "1",
      certified: false,
      ipv4: false,
      useCurrentBalance: true,
    });

    const tftPriceTask = useAsync(() => calculator.tftPrice(), { init: true, default: 0 });
    const priceTask = useAsync(
      () => {
        return calculator.calculate({
          cru: +resources.value.cru,
          mru: +resources.value.mru,
          hru: +resources.value.hru,
          sru: +resources.value.sru,
          ipv4u: resources.value.ipv4,
          certified: resources.value.certified,
          balance:
            userBalance.value && resources.value.useCurrentBalance ? userBalance.value.free : +resources.value.balance,
          nu: +resources.value.nu,
        });
      },
      {
        init: true,
        shouldRun: () => valid.value,
      },
    );

    const dedicatedPriceUSD = computed(() => {
      const price = priceTask.value.data?.dedicatedPrice;
      if (price) {
        return normalizePrice(price);
      }
      return 0;
    });

    const dedicatedPriceTFT = computed(() => {
      const tftPrice = tftPriceTask.value.data;
      const dedicatedPrice = dedicatedPriceUSD.value;
      if (dedicatedPrice && tftPrice) {
        const price = dedicatedPrice / tftPrice;
        return normalizePrice(price);
      }
      return 0;
    });

    const sharedPriceUSD = computed(() => {
      const price = priceTask.value.data?.sharedPrice;
      if (price) {
        return normalizePrice(price);
      }
      return 0;
    });

    const sharedPriceTFT = computed(() => {
      const tftPrice = tftPriceTask.value.data;
      const sharedPrice = sharedPriceUSD.value;
      if (sharedPrice && tftPrice) {
        const price = sharedPrice / tftPrice;
        return normalizePrice(price);
      }
      return 0;
    });

    return {
      valid,
      cruRules,
      mruRules,
      sruRules,
      hruRules,
      nuRules,
      balanceRules,
      userBalance,
      resources,
      priceTask,
      dedicatedPriceUSD,
      dedicatedPriceTFT,
      sharedPriceUSD,
      sharedPriceTFT,
      computePackageColor,
      normalizeError,
      profileManager,
      manual,
    };
  },
};
</script>
