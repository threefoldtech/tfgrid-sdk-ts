<template>
  <view-layout>
    <v-card color="primary" class="d-flex justify-center items-center mt-3 pa-3 text-center">
      <v-icon size="30" class="pr-3">mdi-cog</v-icon>
      <v-card-title class="pa-0">Settings</v-card-title>
    </v-card>
    <v-card class="my-5"
      ><v-card-title>Theme</v-card-title> <v-card-text>Pick an application theme!</v-card-text>
      <v-select class="pa-3" :items="themes" v-model="selectedTheme" />
      <v-card-actions class="justify-end">
        <v-btn @click="UpdateTheme" class="justify-end ml-auto">Update</v-btn></v-card-actions
      >
    </v-card>
    <v-card class="my-5"
      ><v-card-title>Password</v-card-title> <v-card-text>Change your password</v-card-text>

      <PasswordInputWrapper #="{ props: passwordInputProps }">
        <InputValidator
          :value="currentPassword"
          :rules="[
            validators.required('Password is required.'),
            validators.minLength('Password must be at least 6 characters.', 6),
            checkCurrentPassword,
          ]"
          #="{ props: validationProps }"
          ref="passwordInput"
        >
          <v-tooltip location="top right" text="Please enter your current password.">
            <template #activator="{ props: tooltipProps }">
              <div v-bind="tooltipProps">
                <VTextField
                  label=" Current Password"
                  v-model="currentPassword"
                  v-bind="{ ...passwordInputProps, ...validationProps }"
                  autocomplete="off"
                  class="pa-3"
                />
              </div>
            </template>
          </v-tooltip>
        </InputValidator>
      </PasswordInputWrapper>
      <v-card-actions class="justify-end">
        <v-btn @click="UpdatePassword" class="justify-end ml-auto">Update</v-btn></v-card-actions
      >
    </v-card>
  </view-layout>
</template>
<script lang="ts">
import md5 from "md5";
import { ref, watch } from "vue";
import { useTheme } from "vuetify";

import type { Credentials } from "../utils/grid";
export default {
  name: "Settings",
  setup() {
    const theme = useTheme();
    const KEY = "APP_CURRENT_THEME";

    const themes = ["Dark Mode", "Light Mode"];

    const currentTheme = localStorage.getItem(KEY);

    watch(theme.global.name, theme => localStorage.setItem(KEY, theme));

    const selectedTheme = ref(currentTheme == "light" ? "Light Mode" : "Dark Mode");

    const currentPassword = ref("");
    const version = 1;
    const WALLET_KEY = "wallet.v" + version;

    function UpdateTheme() {
      if (selectedTheme.value.split(" ")[0].toLowerCase() != currentTheme) {
        localStorage.setItem(KEY, selectedTheme.value == "Light Mode" ? "light" : "dark");
        theme.global.name.value = selectedTheme.value == "Light Mode" ? "light" : "dark";
      }
    }
    function checkCurrentPassword() {
      if (getCredentials().passwordHash !== md5(currentPassword.value)) {
        return { message: "Incorrect Password." };
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
    function UpdatePassword() {
      console.log("updating");
    }

    return {
      themes,
      selectedTheme,
      currentPassword,
      UpdateTheme,
      UpdatePassword,
      checkCurrentPassword,
    };
  },
};
</script>
