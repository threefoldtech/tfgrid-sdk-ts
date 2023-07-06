<template>
  <section>
    <v-dialog v-model="show" scrollable width="80%">
      <template #activator="{ on, attrs }">
        <v-card v-on="on" v-bind="attrs">
          <v-card-text class="d-flex align-center">
            <v-icon size="x-large">mdi-account</v-icon>
            <p class="font-weight-bold">Connect your TFChain Wallet</p>
          </v-card-text>
        </v-card>
      </template>

      <v-card>
        <v-card-title>Connect your TFChain Wallet</v-card-title>
        <v-card-subtitle>
          Please visit
          <a href="https://manual.grid.tf/weblets/weblets_profile_manager.html" target="_blank">the manual</a> get
          started.
        </v-card-subtitle>
        <v-divider />

        <v-card-text v-if="$store.state.profile" class="pt-2">
          <v-container>
            <v-form readonly>
              <v-text-field label="Mnemonic" :value="$store.state.profile.mnemonic" />
              <p class="text-center font-weight-bold">
                Scan the QRcode using
                <a href="https://manual.grid.tf/getstarted/TF_Connect/TF_Connect.html" target="_blank">
                  ThreeFold Connect
                </a>
                to fund your account
              </p>
              <QrcodeGenerator
                :data="'TFT:' + bridge + '?message=twin_' + $store.state.profile.twinId + '&sender=me&amount=100'"
              />

              <v-textarea label="Public SSH Key" :value="$store.state.profile.ssh" />
              <v-text-field label="Twin ID" :value="$store.state.profile.twin" />
              <v-text-field label="Address" :value="$store.state.profile.address" />
            </v-form>
          </v-container>
        </v-card-text>

        <v-card-text v-else>
          <v-tabs centered v-model="tab" class="mt-2">
            <v-tab v-if="canLogin">Login</v-tab>
            <v-tab>Connect Your Wallet</v-tab>
          </v-tabs>

          <v-container class="pt-5" v-if="tab === 0 && canLogin">
            {{ tab }}
          </v-container>

          <v-container class="pt-5" v-else>
            <v-form v-model="isValidForm" :disabled="connecting" @submit.prevent="connect">
              <v-alert type="warning" text>
                To connect your wallet, you will need to enter your mnemonic which will be encrypted using the password.
                Mnemonic will never be shared outside of this device.
              </v-alert>

              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <div class="d-flex" v-on="on" v-bind="attrs">
                    <v-text-field
                      label="Mnemonic"
                      :rules="mnemonicRules"
                      placeholder="Please insert your mnemonic"
                      type="password"
                      autofocus
                      :error-messages="mnemonicError"
                      :value="mnemonic"
                      @input="
                        e => {
                          mnemonic = e;
                          mnemonicError = null;
                        }
                      "
                    />
                    <v-btn color="primary" :disabled="connecting" class="mt-2 ml-4" text>Generate Account</v-btn>
                  </div>
                </template>

                <p class="font-weight-black" :style="{ maxWidth: '600px' }">
                  Mnemonic are your private key. They are used to represent you on the ThreeFold Grid. You can paste
                  existing mnemonic or click the 'Create Account' button to create an account and generate mnemonic.
                </p>
              </v-tooltip>

              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-text-field
                    :rules="[validatePassword]"
                    v-model="password"
                    v-on="on"
                    v-bind="attrs"
                    label="Password"
                    type="password"
                  />
                </template>

                <p class="font-weight-black" :style="{ maxWidth: '600px' }">
                  Used to encrypt your mnemonic on your local system, and is used to login from the same device.
                </p>
              </v-tooltip>

              <v-text-field
                label="Confirm Password"
                ref="confirmPassword"
                :rules="[validateConfirmPassword]"
                type="password"
              />

              <div class="d-flex justify-center">
                <v-btn color="primary" :disabled="!isValidForm" type="submit" :loading="connecting">Connect</v-btn>
              </div>
            </v-form>
          </v-container>
        </v-card-text>
        <v-divider />
        <v-card-actions class="d-flex justify-end">
          <v-btn color="error" outlined @click="show = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>

<script lang="ts">
import { validateMnemonic } from "bip39";
import { Component, Vue } from "vue-property-decorator";

import { getGrid } from "../utils/grid";
import QrcodeGenerator from "./QrcodeGenerator.vue";

const version = "v1";
const key = `wallet.${version}`;

@Component({
  name: "TfChainConnector",
  components: {
    QrcodeGenerator,
  },
})
export default class TfChainConnector extends Vue {
  /* devnet bridge for now */
  public bridge = "GDHJP6TF3UXYXTNEZ2P36J5FH7W4BJJQ4AYYAXC66I2Q2AH5B6O6BCFG";

  public show = true;
  public tab = 0;
  public mnemonic = "";
  public password = "";
  public isValidForm = false;

  public canLogin(): boolean {
    return typeof localStorage.getItem(key) === "string";
  }

  /* Validation */
  private _confirmPasswordUpdated = false;
  public readonly mnemonicRules = [
    (value: string) => (value ? true : "Mnemonic is required."),
    (value: string) => (validateMnemonic(value) ? true : "Mnemonic doesn't seem to be valid."),
  ];
  public validatePassword(value: string) {
    if (this._confirmPasswordUpdated) {
      (this.$refs.confirmPassword as any).validate();
    }
    if (!value) return "Password is required.";
    if (value.length < 6) return "Password must be at least 6 characters.";
    return true;
  }
  public validateConfirmPassword(value: string) {
    this._confirmPasswordUpdated = true;
    if (!value) return "A confirmation password is required.";
    if (value !== this.password) return "Passwords should match.";
    return true;
  }

  /* Connection */
  public connecting = false;
  public mnemonicError: null | string = null;
  public async connect() {
    this.connecting = true;
    try {
      const grid = await getGrid(this.mnemonic);
      this.$store.state.profile = {
        mnemonic: this.mnemonic,
        ssh: "",
        twin: grid.twinId,
        address: grid.tfclient.address,
      };
    } catch (error) {
      this.mnemonicError = (error as any).message || "Failed to Mnemonic on grid.";
    } finally {
      this.connecting = false;
    }
  }
}
</script>
