<template>
  <VDialog
    scrollable
    width="60%"
    :model-value="$props.modelValue"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <template #activator="{ props }">
      <VCard v-bind="props" class="pa-3 d-inline-flex align-center">
        <VProgressCircular v-if="activating" class="mr-2" indeterminate color="primary" size="25" />
        <VIcon icon="mdi-account" size="x-large" class="mr-2" v-else />
        <div>
          <p v-if="!profileManager.profile">
            <strong>Connect your TFChain Wallet</strong>
          </p>
          <p v-else-if="loadingBalance">
            <strong>Loading...</strong>
          </p>
          <template v-else-if="balance">
            <p>
              Balance:
              <strong :class="theme.name.value === AppThemeSelection.light ? 'text-primary' : 'text-info'">
                {{ normalizeBalance(balance.free, true) }} TFT
              </strong>
            </p>
            <p>
              Locked:
              <strong :class="theme.name.value === AppThemeSelection.light ? 'text-primary' : 'text-info'">
                {{ normalizeBalance(balance.locked, true) || 0 }} TFT
              </strong>
              <v-tooltip text="Locked balance documentation" location="bottom right">
                <template #activator="{ props }">
                  <v-btn
                    @click.stop
                    v-bind="props"
                    :color="theme.name.value === AppThemeSelection.light ? 'black' : 'white'"
                    icon="mdi-information-outline"
                    height="24px"
                    width="24px"
                    class="ml-2"
                    href="https://manual.grid.tf/tfchain/tfchain.html?highlight=locked#contract-locking"
                    target="_blank"
                  />
                </template>
              </v-tooltip>
            </p>
          </template>
        </div>
        <v-tooltip text="Logout" location="bottom" :disabled="!profileManager.profile">
          <template #activator="{ props }">
            <VBtn
              color="error"
              variant="tonal"
              @click.stop="logout"
              v-if="profileManager.profile"
              :disabled="loadingBalance"
              class="ml-2"
              v-bind="props"
              icon="mdi-logout"
            />
          </template>
        </v-tooltip>
      </VCard>
    </template>
    <v-card
      color="primary"
      class="d-flex justify-center items-center mt-3 pa-3 text-center"
      v-if="!profileManager.profile"
    >
      <v-card-title class="pa-0">TFChain Wallet</v-card-title>
    </v-card>
    <WebletLayout disable-alerts v-if="!profileManager.profile">
      <DTabs
        v-if="!profileManager.profile"
        :tabs="getTabs()"
        v-model="activeTab"
        :disabled="creatingAccount || activatingAccount || activating"
        @tab:change="
          () => {
            clearError();
            clearFields();
          }
        "
        destroy
      >
        <VContainer>
          <form @submit.prevent="activeTab === 0 ? login() : storeAndLogin()">
            <FormValidator v-model="isValidForm">
              <v-alert type="warning" variant="tonal" class="mb-6" v-if="activeTab === 1">
                <p :style="{ maxWidth: '880px' }">
                  To connect your wallet, you will need to enter your Mnemonic or Hex Seed which will be encrypted using
                  the password. Mnemonic or Hex Seed will never be shared outside of this device.
                </p>
              </v-alert>

              <v-alert variant="tonal" type="info" class="mb-6" v-if="keypairType === KeypairType.ed25519">
                <p>
                  Please note that generation of ed25519 Keys isn't supported, you can only import pre existing ones.
                </p>
              </v-alert>

              <VTooltip
                v-if="activeTab === 1"
                text="Mnemonic or Hex Seed are your private key. They are used to represent you on the ThreeFold Grid. You can paste existing (Mnemonic or Hex Seed) or click the 'Create Account' button to create an account and generate mnemonic."
                location="bottom"
                max-width="700px"
              >
                <template #activator="{ props: tooltipProps }">
                  <PasswordInputWrapper #="{ props: passwordInputProps }">
                    <InputValidator
                      :value="mnemonic"
                      :rules="[
                        validators.required('Mnemonic or Hex Seed is required.'),
                        v => {
                          clearError();
                          if (
                            validateMnemonic(v) ||
                            ((v.length === 64 || v.length === 66) && isAddress(v.length === 66 ? v : `0x${v}`))
                          ) {
                            return;
                          }

                          return { message: 'Mnemonic or Hex Seed doesn\'t seem to be valid.' };
                        },
                      ]"
                      :async-rules="[validateMnInput]"
                      valid-message="Mnemonic or Hex Seed is valid."
                      #="{ props: validationProps }"
                      ref="mnemonicInput"
                      :disable-validation="creatingAccount || activatingAccount || activating"
                    >
                      <v-row>
                        <v-col cols="10">
                          <div v-bind="tooltipProps">
                            <VTextField
                              label="Mnemonic or Hex Seed"
                              placeholder="Please insert your Mnemonic or Hex Seed"
                              v-model="mnemonic"
                              v-bind="{ ...passwordInputProps, ...validationProps }"
                              :disabled="creatingAccount || activatingAccount || activating"
                            />
                          </div>
                        </v-col>
                        <v-col cols="2">
                          <v-autocomplete
                            :items="[...keyType]"
                            item-title="name"
                            v-model="keypairType"
                            v-if="activeTab === 1"
                          />
                        </v-col>
                      </v-row>

                      <div class="d-flex justify-end mb-10">
                        <v-tooltip>
                          <template v-slot:activator="{ isActive, props }">
                            <VBtn
                              class="mt-2 ml-3"
                              color="secondary"
                              variant="outlined"
                              :disabled="!shouldActivateAccount || keypairType === KeypairType.ed25519"
                              :loading="activatingAccount"
                              @click="openAcceptTerms = termsLoading = true"
                              v-bind="props"
                              v-on="isActive"
                            >
                              Activate account
                            </VBtn>
                          </template>
                          <span>To connect to your wallet, you should accept terms and conditions first.</span>
                        </v-tooltip>

                        <VBtn
                          class="mt-2 ml-3"
                          color="primary"
                          :disabled="
                            isValidForm || !!mnemonic || shouldActivateAccount || keypairType === KeypairType.ed25519
                          "
                          :loading="creatingAccount"
                          @click="openAcceptTerms = termsLoading = true"
                        >
                          create account
                        </VBtn>
                      </div>
                    </InputValidator>
                  </PasswordInputWrapper>
                </template>
              </VTooltip>
              <v-dialog v-model="openAcceptTerms" fullscreen>
                <iframe
                  v-show="!termsLoading"
                  src="https://library.threefold.me/info/legal/#/"
                  frameborder="0"
                  style="background-color: white"
                  allow="fullscreen"
                  height="95%"
                  width="100%"
                  sandbox="allow-forms allow-modals allow-scripts allow-popups allow-same-origin "
                  @load="termsLoading = false"
                ></iframe>
                <v-btn @click="shouldActivateAccount ? activateAccount() : createNewAccount()" v-show="!termsLoading">
                  accept terms and conditions
                </v-btn>
                <v-card v-show="termsLoading" :style="{ height: '100%' }">
                  <v-card-text class="d-flex justify-center align-center" :style="{ height: '100%' }">
                    <v-progress-circular indeterminate color="primary" />
                  </v-card-text>
                </v-card>
              </v-dialog>
              <v-alert
                type="error"
                variant="tonal"
                class="mb-4"
                v-if="(createAccountError || activatingAccountError) && activeTab === 1"
              >
                {{ createAccountError || activatingAccountError }}
              </v-alert>

              <v-alert type="info" variant="tonal" class="mb-6" v-if="activeTab === 0">
                <p :style="{ maxWidth: '880px' }">
                  You will need to provide the password used while connecting your wallet.
                </p>
              </v-alert>
              <PasswordInputWrapper #="{ props: passwordInputProps }">
                <InputValidator
                  :value="password"
                  :rules="[
                    validators.required('Password is required.'),
                    validators.minLength('Password must be at least 6 characters.', 6),
                    validatePassword,
                  ]"
                  #="{ props: validationProps }"
                  ref="passwordInput"
                >
                  <v-tooltip
                    location="top right"
                    text="Used to encrypt your mnemonic on your local system, and is used to login from the same device."
                  >
                    <template #activator="{ props: tooltipProps }">
                      <div v-bind="tooltipProps">
                        <VTextField
                          label="Password"
                          v-model="password"
                          v-bind="{ ...passwordInputProps, ...validationProps }"
                          :disabled="creatingAccount || activatingAccount || activating"
                        />
                      </div>
                    </template>
                  </v-tooltip>
                </InputValidator>
              </PasswordInputWrapper>

              <PasswordInputWrapper #="{ props: confirmPasswordInputProps }" v-if="activeTab === 1">
                <InputValidator
                  :value="confirmPassword"
                  :rules="[validators.required('A confirmation password is required.'), validateConfirmPassword]"
                  #="{ props: validationProps }"
                  ref="confirmPasswordInput"
                >
                  <VTextField
                    label="Confirm Password"
                    v-model="confirmPassword"
                    v-bind="{ ...confirmPasswordInputProps, ...validationProps }"
                    :disabled="creatingAccount || activatingAccount || activating"
                  />
                </InputValidator>
              </PasswordInputWrapper>
              <v-alert type="error" variant="tonal" class="mt-2 mb-4" v-if="loginError">
                {{ loginError }}
              </v-alert>
              <v-alert variant="tonal" type="warning" class="mb-6" v-if="activeTab === 1">
                <p>Using different keypair types will lead to a completely different account.</p>
              </v-alert>
            </FormValidator>

            <div class="d-flex justify-center mt-2">
              <VBtn color="anchor" variant="outlined" @click="$emit('update:modelValue', false)"> Close </VBtn>
              <VBtn
                class="ml-2"
                type="submit"
                color="secondary"
                variant="outlined"
                :loading="activating"
                :disabled="
                  !isValidForm ||
                  creatingAccount ||
                  activatingAccount ||
                  (activeTab === 1 && isValidConnectConfirmationPassword)
                "
              >
                {{ activeTab === 0 ? "Login" : "Connect" }}
              </VBtn>
            </div>
          </form>
        </VContainer>
      </DTabs>
    </WebletLayout>
  </VDialog>
</template>

<script lang="ts" setup>
import { isAddress } from "@polkadot/util-crypto";
import { KeypairType } from "@threefold/grid_client";
import { validateMnemonic } from "bip39";
import Cryptr from "cryptr";
import md5 from "md5";
import { computed, onMounted, type Ref, ref, watch } from "vue";
import { nextTick } from "vue";
import { useTheme } from "vuetify";

import { AppThemeSelection } from "@/utils/app_theme";
import { createCustomToast, ToastType } from "@/utils/custom_toast";

import { useProfileManagerController } from "../components/profile_manager_controller.vue";
import { useOnline } from "../hooks";
import { useInputRef } from "../hooks/input_validator";
import { useProfileManager } from "../stores";
import {
  activateAccountAndCreateTwin,
  type Balance,
  createAccount,
  getGrid,
  loadBalance,
  loadProfile,
} from "../utils/grid";
import { normalizeBalance, normalizeError } from "../utils/helpers";

interface Credentials {
  passwordHash?: string;
  mnemonicHash?: string;
  keypairTypeHash?: string;
}
const keyType = ["sr25519", "ed25519"];
const keypairType = ref(KeypairType.sr25519);

const theme = useTheme();

const props = defineProps({
  modelValue: {
    required: false,
    default: () => true,
    type: Boolean,
  },
});
defineEmits<{ (event: "update:modelValue", value: boolean): void }>();

const online = useOnline();
watch(
  () => [online.value, props.modelValue],
  ([online, m], [wasOnline]) => {
    if (!wasOnline && online) {
      handleModelValue(true);
    }

    handleModelValue(online && m);
  },
);
function handleModelValue(m: boolean) {
  if (m) {
    nextTick().then(mounted);
  } else {
    nextTick().then(() => {
      if (isStoredCredentials()) {
        activeTab.value = 0;
      } else {
        activeTab.value = 1;
      }
      clearFields();
    });
  }
}
watch(
  () => keypairType.value,
  async (value, oldValue) => {
    if (value !== oldValue) {
      mnemonicInput.value?.validate();
    }
  },
  { deep: false },
);

function mounted() {
  if (isStoredCredentials()) {
    activeTab.value = 0;
    const credentials: Credentials = getCredentials();
    const sessionPassword = sessionStorage.getItem("password");

    if (!sessionPassword) return;

    password.value = sessionPassword;

    if (credentials.passwordHash) {
      return login();
    }
  } else {
    activeTab.value = 1;
    return;
  }
}

function getCredentials() {
  const getCredentials = localStorage.getItem(WALLET_KEY);
  let credentials: Credentials = {};

  if (getCredentials) {
    credentials = JSON.parse(getCredentials);
  }
  return credentials;
}

function setCredentials(passwordHash: string, mnemonicHash: string, keypairTypeHash: string): Credentials {
  const credentials: Credentials = {
    passwordHash,
    mnemonicHash,
    keypairTypeHash,
  };
  localStorage.setItem(WALLET_KEY, JSON.stringify(credentials));
  return credentials;
}

function isStoredCredentials() {
  return localStorage.getItem(WALLET_KEY) ? true : false;
}

function getTabs() {
  let tabs = [];
  if (isStoredCredentials()) {
    tabs = [
      { title: "Login", value: "login" },
      { title: "Connect your Wallet", value: "register" },
    ];
  } else {
    tabs = [{ title: "Connect your Wallet", value: "register" }];
  }
  return tabs;
}
const termsLoading = ref(false);
const profileManager = useProfileManager();
const openAcceptTerms = ref(false);
const mnemonic = ref("");
const isValidForm = ref(false);

const mnemonicInput = useInputRef();

const isNonActiveMnemonic = ref(false);

const shouldActivateAccount = computed(() => {
  if (!mnemonicInput.value?.error || !mnemonic.value) return false;
  return isNonActiveMnemonic.value;
});

const isValidConnectConfirmationPassword = computed(() =>
  !validateConfirmPassword(confirmPassword.value) ? false : true,
);

const balance = ref<Balance>();

const activeTab = ref(0);
const password = ref("");
const confirmPassword = ref("");
const passwordInput = ref() as Ref<{ validate(value: string): Promise<boolean> }>;
const confirmPasswordInput = useInputRef();

const version = 1;
const WALLET_KEY = "wallet.v" + version;

let interval: any;
watch(
  () => profileManager.profile,
  profile => {
    if (profile) {
      __loadBalance(profile);
      if (interval) clearInterval(interval);
      interval = setInterval(__loadBalance.bind(undefined, profile), 1000 * 60 * 2);
    } else {
      if (interval) clearInterval(interval);
      balance.value = undefined;
    }
  },
  { immediate: true, deep: true },
);

watch(
  password,
  () => {
    confirmPassword.value && confirmPasswordInput.value?.validate();
  },
  { immediate: true },
);

function logout() {
  sessionStorage.removeItem("password");
  profileManager.clear();
}

const activating = ref(false);
const loginError = ref<string | null>(null);
const createAccountError = ref<string | null>(null);
const activatingAccountError = ref<string | null>(null);
function clearError() {
  isNonActiveMnemonic.value = false;
  loginError.value = null;
  createAccountError.value = null;
  activatingAccountError.value = null;
}

function clearFields() {
  password.value = "";
  confirmPassword.value = "";
  mnemonic.value = "";
}

async function activate(mnemonic: string, keypairType: KeypairType) {
  clearError();
  activating.value = true;
  sessionStorage.setItem("password", password.value);
  try {
    const grid = await getGrid({ mnemonic, keypairType });
    const profile = await loadProfile(grid!);

    profileManager.set({ ...profile, mnemonic });
  } catch (e) {
    loginError.value = normalizeError(e, "Something went wrong while login.");
  } finally {
    activating.value = false;
  }
}

function validateMnInput(mnemonic: string) {
  isNonActiveMnemonic.value = false;
  return getGrid({ mnemonic, keypairType: keypairType.value })
    .then(() => undefined)
    .catch(e => {
      if (e instanceof TwinNotExistError) {
        isNonActiveMnemonic.value = true;
        return {
          message: `Couldn't get the user twin for the provided mnemonic in ${
            process.env.NETWORK || window.env.NETWORK
          }net.`,
        };
      }

      return {
        message: normalizeError(e, "Something went wrong. please try again."),
      };
    });
}

onMounted(async () => {
  mounted();
});

const creatingAccount = ref(false);
async function createNewAccount() {
  openAcceptTerms.value = false;
  termsLoading.value = false;
  clearError();
  creatingAccount.value = true;
  try {
    const account = await createAccount();
    mnemonic.value = account.mnemonic;
  } catch (e) {
    createAccountError.value = normalizeError(e, "Something went wrong while creating new account.");
  } finally {
    creatingAccount.value = false;
  }
}

const activatingAccount = ref(false);
async function activateAccount() {
  openAcceptTerms.value = false;
  termsLoading.value = false;
  clearError();
  activatingAccount.value = true;
  try {
    await activateAccountAndCreateTwin(mnemonic.value);
    await mnemonicInput.value?.validate();
  } catch (e) {
    activatingAccountError.value = normalizeError(e, "Something went wrong while activating your account.");
  } finally {
    activatingAccount.value = false;
  }
}

let BalanceWarningRaised = false;
const loadingBalance = ref(false);
async function __loadBalance(profile?: Profile, tries = 1) {
  profile = profile || profileManager.profile!;
  if (!profile) return;

  try {
    loadingBalance.value = true;
    const grid = await getGrid(profile);
    balance.value = await loadBalance(grid!);
    if (!BalanceWarningRaised && balance.value?.free) {
      if (balance.value?.free < 0.01) {
        createCustomToast("Your balance is too low, Please fund your account.", ToastType.warning);
        BalanceWarningRaised = true;
      }
    }
    loadingBalance.value = false;
  } catch {
    if (tries > 10) {
      loadingBalance.value = false;
      return;
    }

    setTimeout(() => __loadBalance(profile, tries + 1), Math.floor(Math.exp(tries) * 1_000));
  }
}

const profileManagerController = useProfileManagerController();
profileManagerController.set({ loadBalance: __loadBalance });

function login() {
  const credentials: Credentials = getCredentials();
  if (credentials.mnemonicHash && credentials.passwordHash) {
    if (credentials.passwordHash === md5(password.value)) {
      const cryptr = new Cryptr(password.value, { pbkdf2Iterations: 10, saltLength: 10 });
      const mnemonic = cryptr.decrypt(credentials.mnemonicHash);
      const keypairType = credentials.keypairTypeHash
        ? cryptr.decrypt(credentials.keypairTypeHash)
        : KeypairType.sr25519;
      activate(mnemonic, keypairType as KeypairType);
    }
  }
}

function storeAndLogin() {
  const cryptr = new Cryptr(password.value, { pbkdf2Iterations: 10, saltLength: 10 });
  const mnemonicHash = cryptr.encrypt(mnemonic.value);
  const keypairTypeHash = cryptr.encrypt(keypairType.value);
  setCredentials(md5(password.value), mnemonicHash, keypairTypeHash);
  activate(mnemonic.value, keypairType.value);
}

function validatePassword(value: string) {
  if (activeTab.value === 0) {
    if (!localStorage.getItem(WALLET_KEY)) {
      return { message: "We couldn't find a matching wallet for this password. Please connect your wallet first." };
    }
    if (getCredentials().passwordHash !== md5(password.value)) {
      return { message: "We couldn't find a matching wallet for this password. Please connect your wallet first." };
    }
  }
}

function validateConfirmPassword(value: string) {
  if (value !== password.value) {
    return { message: "Passwords should match." };
  }
}
</script>

<script lang="ts">
import { TwinNotExistError } from "@threefold/types";

import type { Profile } from "../stores/profile_manager";

export default {
  name: "ProfileManager",
};
</script>
<style>
.v-field__input {
  font-size: small;
}
@media only screen and (max-width: 1400px) {
  .app-btn {
    width: 8rem !important;
  }
}
</style>
