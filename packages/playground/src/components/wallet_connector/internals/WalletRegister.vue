<template>
  <section>
    <VAlert
      type="warning"
      text="To connect your wallet, you will need to enter your Mnemonic or Hex Seed which will be encrypted using the password. Mnemonic or Hex Seed will never be shared outside of this device."
    />

    <VFadeTransition>
      <VAlert
        class="mt-4"
        type="info"
        text="Please note that generation of ed25519 Keys isn't supported, you can only import pre existing ones."
        v-if="keypairType === 'ed25519'"
      />
    </VFadeTransition>

    <VForm
      v-model="formValid"
      @submit.prevent="connectTask.run(mnemonic, keypairType)"
      :disabled="walletService.locked.value"
    >
      <InputTooltip
        tooltip="Mnemonic or Hex Seed are your private key. They are used to represent you on the ThreeFold Grid. You can paste existing (Mnemonic or Hex Seed) or click the 'Create Account' button to create an account and generate mnemonic."
        align-center
      >
        <PasswordInputWrapper #="{ props }">
          <VTextField
            ref="mnemonicInput"
            class="mnemonic-input mt-4"
            label="Mnemonic or Hex Seed"
            placeholder="Please insert your Mnemonic or Hex Seed"
            v-bind="props"
            :error="
              !generateAccountTask.loading &&
              !activateAccountTask.loading &&
              !validateMnemonicTask.loading &&
              (!!validateMnemonicTask.error || !!validateMnemonicTask.error || !!generateAccountTask.error)
            "
            :error-messages="
              generateAccountTask.loading || activateAccountTask.loading
                ? undefined
                : validateMnemonicTask.error || generateAccountTask.error || activateAccountTask.error || undefined
            "
            :hint="
              generateAccountTask.loading
                ? 'Generating new account...'
                : activateAccountTask.loading
                ? 'Activating your account...'
                : mnemonic && !validateMnemonicTask.initialized
                ? 'Prepare to validate mnemonic'
                : validateMnemonicTask.loading
                ? 'Validating...'
                : undefined
            "
            :persistent-hint="
              generateAccountTask.loading ||
              activateAccountTask.loading ||
              (mnemonic && !validateMnemonicTask.initialized) ||
              validateMnemonicTask.loading
            "
            :loading="validateMnemonicTask.loading"
            v-model="mnemonic"
            autofocus
          >
            <template #append>
              <VSelect
                :items="['sr25519', 'ed25519']"
                hide-details
                v-model="keypairType"
                :disabled="validateMnemonicTask.loading"
              >
                <template #item="{ props }">
                  <VListItem v-bind="props" />
                </template>
              </VSelect>
            </template>
          </VTextField>
        </PasswordInputWrapper>
      </InputTooltip>

      <VFadeTransition>
        <VContainer class="mb-4" v-if="keypairType !== KeypairType.ed25519">
          <VRow justify="end">
            <VBtn
              type="button"
              text="Activate Account"
              variant="tonal"
              color="primary"
              class="mr-2"
              :disabled="
                !(validateMnemonicTask.error === noTwinFoundError) ||
                (walletService.locked.value && !activateAccountTask.loading)
              "
              @click="requestTermsAndConditions = 'activate'"
              :loading="activateAccountTask.loading"
            />

            <VBtn
              type="button"
              text="Create Account"
              variant="tonal"
              color="secondary"
              :disabled="!!mnemonic || (walletService.locked.value && !generateAccountTask.loading)"
              @click="requestTermsAndConditions = 'generate'"
              :loading="generateAccountTask.loading"
            />
          </VRow>
        </VContainer>
      </VFadeTransition>

      <InputTooltip
        tooltip="Used to encrypt your mnemonic on your local system, and is used to login from the same device."
      >
        <PasswordInputWrapper #="{ props }">
          <VTextField
            label="Password"
            placeholder="Your password"
            :model-value="password"
            @update:model-value="
              password = $event.trim();
              ($refs.confirmPasswordInput as VTextField).dirty && ($refs.confirmPasswordInput as VTextField).validate();
            "
            :rules="[
              p => (p ? true : 'Password is required.'),
              p => (p.length < 6 ? 'Password must be at least 6 characters.' : true),
            ]"
            v-bind="props"
          />
        </PasswordInputWrapper>
      </InputTooltip>

      <PasswordInputWrapper #="{ props }">
        <VTextField
          ref="confirmPasswordInput"
          label="Confirm Password"
          placeholder="Your confirm password"
          :rules="[
            p => (p ? true : 'Confirm password is required.'),
            p => (p === password ? true : 'Passwords should match.'),
          ]"
          v-bind="props"
        />
      </PasswordInputWrapper>

      <VAlert type="warning" text="Using different keypair types will lead to a completely different account." />

      <VAlert
        type="error"
        v-if="connectTask.error"
        :text="connectTask.error"
        class="mt-4"
        closable
        @click:close="connectTask.reset"
      />

      <VContainer class="mt-4">
        <VRow justify="center">
          <VBtn
            type="button"
            variant="outlined"
            class="mr-2"
            @click="walletService.active.value = false"
            text="Close"
          />
          <VBtn
            type="submit"
            variant="tonal"
            color="primary"
            :disabled="!valid || (walletService.locked.value && !connectTask.loading)"
            text="Connect"
            :loading="connectTask.loading"
          />
        </VRow>
      </VContainer>
    </VForm>

    <TermsAndConditions
      v-if="requestTermsAndConditions"
      @accept="requestTermsAndConditions === 'activate' ? activateAccountTask.run() : generateAccountTask.run()"
      @exit="requestTermsAndConditions = undefined"
    />
  </section>
</template>

<script lang="ts">
import { isAddress } from "@polkadot/util-crypto";
import { KeypairType } from "@threefold/grid_client";
import { validateMnemonic } from "bip39";
import { computed, ref } from "vue";
import type { VTextField } from "vuetify/components/VTextField";

import { network } from "../../../clients";
import { useAsync, useWatchDeep } from "../../../hooks";
import { connectAndLoginProfile, useWalletService } from "../../../hooks/wallet_connector";
import { activateAccountAndCreateTwin, createAccount, getGrid } from "../../../utils/grid";
import { normalizeError } from "../../../utils/helpers";
import { resolveAsync } from "../../../utils/nodeSelector";
import TermsAndConditions from "./TermsAndConditions.vue";

const noTwinFoundError = `Couldn't get the user twin for the provided mnemonic in ${network}net.`;

export default {
  name: "WalletRegister",
  components: { TermsAndConditions },
  setup() {
    const walletService = useWalletService();
    const validateMnemonicTask = useAsync<true, string, [string, KeypairType]>(
      async (mnemonic: string, keypairType: KeypairType) => {
        switch (true) {
          case !mnemonic:
            throw "Mnemonic or Hex Seed is required.";

          case [64, 66].includes(mnemonic.length) && isAddress(`${mnemonic.length === 64 ? "0x" : ""}${mnemonic}`):
          case !validateMnemonic(mnemonic):
            throw `Mnemonic or Hex Seed doesn't seem to be valid.`;
        }

        const [grid, e0] = await resolveAsync(getGrid({ mnemonic, keypairType }));
        if (!grid || e0) {
          const error = normalizeError(e0, "Something went wrong. please try again.");

          if (error.toLowerCase().includes("invalid twin id")) {
            throw noTwinFoundError;
          }

          throw error;
        }

        return true;
      },
      { tries: 1 },
    );

    const mnemonicInput = ref<VTextField>();
    const mnemonic = ref("");
    const keypairType = ref<KeypairType>(KeypairType.sr25519);
    const password = ref("");

    /* Validate mnemonic input */
    const mnemonicDeps = computed(() => ({ mnemonic: mnemonic.value, keypairType: keypairType.value }));
    useWatchDeep(mnemonicDeps, validateMnemonicTask.value.reset);
    useWatchDeep(
      mnemonicDeps,
      d => mnemonicInput.value?.dirty && validateMnemonicTask.value.run(d.mnemonic, d.keypairType),
      { debounce: 1000 },
    );

    const formValid = ref(false);
    const valid = computed(() => formValid.value && validateMnemonicTask.value.data === true);

    const connectTask = useAsync<void, string, [string, KeypairType]>(
      async (mnemonic: string, keypairType: KeypairType) => {
        await connectAndLoginProfile(walletService, mnemonic, keypairType);

        walletService.localCredentials.set(password.value, mnemonic, keypairType);
        walletService.passwordStorage.value = password.value;
      },
      {
        shouldRun: () => valid.value,
        onBeforeTask: () => (walletService.locked.value = true),
        onAfterTask({ error }) {
          walletService.locked.value = false;
          if (error) {
            setTimeout(() => connectTask.value.initialized && connectTask.value.reset(), 5_000);
          }
        },
      },
    );

    const showTermsAndConditions = ref(false);
    const requestTermsAndConditions = ref<"activate" | "generate">();

    const activateAccountTask = useAsync<void, string>(
      async () => {
        const [account, e0] = await resolveAsync(activateAccountAndCreateTwin(mnemonic.value));
        if (!account || e0) {
          throw normalizeError(e0, "Failed to activate Account.");
        }
      },
      {
        onBeforeTask: () => {
          walletService.locked.value = true;
          showTermsAndConditions.value = false;
        },
        onAfterTask({ error }) {
          walletService.locked.value = false;
          !error && validateMnemonicTask.value.run(mnemonic.value, keypairType.value);
        },
      },
    );

    const generateAccountTask = useAsync<void, string>(
      async () => {
        const [account, e0] = await resolveAsync(createAccount());
        if (!account || e0) {
          throw normalizeError(e0, "Failed to create a new account.");
        }

        mnemonic.value = account.mnemonic;
      },
      {
        onBeforeTask: () => {
          walletService.locked.value = true;
          showTermsAndConditions.value = false;
        },
        onAfterTask() {
          walletService.locked.value = false;
        },
      },
    );

    return {
      walletService,
      formValid,
      validateMnemonicTask,
      mnemonicInput,
      mnemonic,
      KeypairType,
      password,
      valid,
      keypairType,
      noTwinFoundError,
      connectTask,

      showTermsAndConditions,
      requestTermsAndConditions,
      activateAccountTask,
      generateAccountTask,
    };
  },
};
</script>

<style>
.mnemonic-input .v-input__append {
  padding-top: 0;
}
</style>
