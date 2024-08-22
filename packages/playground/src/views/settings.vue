<template>
  <view-layout>
    <v-card color="primary" class="d-flex justify-center items-center mt-3 pa-3 text-center">
      <v-icon size="30" class="pr-3">mdi-cog</v-icon>
      <v-card-title class="pa-0">Settings</v-card-title>
    </v-card>
    <v-card class="my-5"
      ><v-card-title>Theme</v-card-title> <v-card-text>Pick an application theme!</v-card-text>

      <v-select class="pa-3" :items="themes" v-model="selectedTheme" />

      <v-card-actions class="justify-end mb-3 mx-3">
        <v-btn :disabled="isCurrentTheme()" @click="UpdateTheme" class="justify-end ml-auto"
          >Update</v-btn
        ></v-card-actions
      >
    </v-card>
    <v-card class="my-5"
      ><v-card-title>Password</v-card-title> <v-card-text>Change your password</v-card-text>
      <form-validator v-model="isValidPassword">
        <PasswordInputWrapper #="{ props: passwordInputProps }">
          <InputValidator
            :value="currentPassword"
            :rules="[
              validators.required('Password is required.'),
              validators.minLength('Password must be at least 6 characters.', 6),
              validateCurrentPassword,
            ]"
            #="{ props: validationProps }"
            ref="currentpasswordInput"
          >
            <VTextField
              label="Current Password"
              v-model="currentPassword"
              v-bind="{ ...passwordInputProps, ...validationProps }"
              autocomplete="off"
              class="pa-3"
            />
          </InputValidator>
        </PasswordInputWrapper>

        <PasswordInputWrapper #="{ props: passwordInputProps }">
          <InputValidator
            :value="newPassword"
            :rules="[
              validators.required('Password is required.'),
              validators.minLength('Password must be at least 6 characters.', 6),
              validateNewPassword,
            ]"
            #="{ props: validationProps }"
            ref="newPasswordInput"
          >
            <VTextField
              label="New Password"
              v-model="newPassword"
              v-bind="{ ...passwordInputProps, ...validationProps }"
              autocomplete="off"
              class="pa-3"
            />
          </InputValidator>
        </PasswordInputWrapper>
        <PasswordInputWrapper #="{ props: confirmPasswordInputProps }">
          <InputValidator
            :value="confirmPassword"
            :rules="[validators.required('A confirmation password is required.'), validateConfirmPassword]"
            #="{ props: validationProps }"
            ref="confirmPasswordInput"
          >
            <VTextField
              label="Confirm Password"
              v-model="confirmPassword"
              v-bind="{
                ...confirmPasswordInputProps,
                ...validationProps,
              }"
              autocomplete="off"
              class="pa-3"
            />
          </InputValidator>
        </PasswordInputWrapper>
      </form-validator>
      <v-card-actions class="justify-end mb-3 mx-3">
        <v-btn :disabled="!isValidPassword" @click="UpdatePassword" class="justify-end ml-auto"
          >Update</v-btn
        ></v-card-actions
      >
    </v-card>
    <v-card class="my-5"
      ><v-card-title>Timeout</v-card-title>

      <form-validator v-model="isValidTimeout">
        <v-card-text>
          Adjust Query Timeout
          <v-tooltip location="end">
            <template #activator="{ props: tooltipProps }">
              <v-icon v-bind="tooltipProps"> mdi-information-outline </v-icon>
            </template>
            <span>Set desired queries timeout in seconds</span>
          </v-tooltip>
        </v-card-text>

        <input-validator
          :value="selectedQueryTimeout"
          :rules="[
            validators.required('Query timeout is required.'),
            validators.isInt('Timeout must be a valid integer.'),
            validators.min(`Query timeout should be at least 3 second.`, 3),
          ]"
          #="{ props }"
          ref="timeoutQueryInput"
        >
          <v-text-field
            label="Enter Query timeout (sec)"
            class="pa-5"
            v-bind="props"
            type="number"
            v-model="selectedQueryTimeout"
          ></v-text-field>
        </input-validator>

        <v-card-text>
          Adjust Deployment Timeout
          <v-tooltip location="end">
            <template #activator="{ props: tooltipProps }">
              <v-icon v-bind="tooltipProps"> mdi-information-outline </v-icon>
            </template>
            <span>Set desired deployment timeout in seconds</span>
          </v-tooltip>
        </v-card-text>
        <input-validator
          :value="selectedDeploymentTimeout"
          :rules="[
            validators.required('Deployment timeout is required.'),
            validators.isInt('Timeout must be a valid integer.'),
            validators.min(`Deployment timeout should be at least 3 second.`, 3),
          ]"
          #="{ props }"
          ref="timeoutDeploymentInput"
        >
          <v-text-field
            label="Enter Deployment timeout (sec)"
            class="pa-5"
            v-bind="props"
            type="number"
            v-model="selectedDeploymentTimeout"
          ></v-text-field>
        </input-validator>
        <v-card-actions class="justify-end mb-3 mx-3">
          <v-btn :disabled="!isValidTimeout || isCurrentTimeout()" @click="UpdateTimeout" class="justify-end ml-auto"
            >Update</v-btn
          ></v-card-actions
        >
      </form-validator>
    </v-card>
  </view-layout>
</template>
<script lang="ts">
import type { GridClient } from "@threefold/grid_client";
import md5 from "md5";
import { onMounted, ref, watch } from "vue";
import { useTheme } from "vuetify";

import { createCustomToast, ToastType } from "@/utils/custom_toast";

import { useGrid } from "../stores";
import { getCredentials, updateCredentials } from "../utils/credentials";

export default {
  name: "Settings",
  setup() {
    const theme = useTheme();
    const THEME_KEY = "APP_CURRENT_THEME";
    const TIMEOUT_QUERY_KEY = "APP_QUERY_TIMEOUT";
    const TIMEOUT_DEPLOYMENT_KEY = "APP_DEPLOYMENT_TIMEOUT";

    const themes = ["System Mode", "Dark Mode", "Light Mode"];

    const currentTheme = ref(localStorage.getItem(THEME_KEY));
    const selectedTheme = ref(currentTheme.value == "light" ? "Light Mode" : "Dark Mode");

    watch(theme.global.name, () => {
      currentTheme.value = localStorage.getItem(THEME_KEY);
      selectedTheme.value = currentTheme.value == "light" ? "Light Mode" : "Dark Mode";
    });

    const currentPassword = ref("");
    const newPassword = ref("");
    const confirmPassword = ref("");
    const currentQueryTimeout = ref(0);
    const currentDeploymentTimeout = ref(0);
    const selectedQueryTimeout = ref(0);
    const selectedDeploymentTimeout = ref(0);
    const isValidTimeout = ref(false);
    const isValidPassword = ref(false);
    const gridStore = useGrid();
    onMounted(async () => {
      currentQueryTimeout.value = +localStorage.getItem(TIMEOUT_QUERY_KEY)!;
      selectedQueryTimeout.value = currentQueryTimeout.value;

      currentDeploymentTimeout.value = +localStorage.getItem(TIMEOUT_DEPLOYMENT_KEY)!;
      selectedDeploymentTimeout.value = currentDeploymentTimeout.value;
    });

    function isCurrentTheme() {
      if (selectedTheme.value.split(" ")[0].toLowerCase() == "system") {
        return (
          (window.matchMedia("(prefers-color-scheme: dark)").matches && currentTheme.value == "dark") ||
          (window.matchMedia("(prefers-color-scheme: light)").matches && currentTheme.value == "light")
        );
      }
      if (currentTheme.value) {
        return selectedTheme.value.split(" ")[0].toLowerCase() == currentTheme.value;
      }
    }
    function UpdateTheme() {
      if (selectedTheme.value == "System Mode") {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          localStorage.setItem(THEME_KEY, "dark");
          theme.global.name.value = "dark";

          return;
        }
        if (window.matchMedia("(prefers-color-scheme: light)").matches) {
          localStorage.setItem(THEME_KEY, "light");
          theme.global.name.value = "light";

          return;
        }
      }
      localStorage.setItem(THEME_KEY, selectedTheme.value == "Light Mode" ? "light" : "dark");
      theme.global.name.value = selectedTheme.value == "Light Mode" ? "light" : "dark";
    }
    function validateCurrentPassword() {
      if (getCredentials().passwordHash !== md5(currentPassword.value)) {
        return { message: "Incorrect Password." };
      }
    }
    /**
     * Checks that new password isn't the same as the current one.
     */
    function validateNewPassword() {
      if (newPassword.value === currentPassword.value) {
        return { message: "New password cannot be the same as current password. Please enter a different password." };
      }
    }
    function validateConfirmPassword(value: string) {
      if (value !== newPassword.value) {
        return { message: "Passwords should match." };
      }
    }
    /** Updates user credentials with the hashes produced by the new password  */
    async function UpdatePassword() {
      await updateCredentials(currentPassword.value, newPassword.value);

      createCustomToast("Password Updated!", ToastType.success);
      // reset input fields
      currentPassword.value = "";
      newPassword.value = "";
      confirmPassword.value = "";
      isValidPassword.value = false;
    }
    function isCurrentTimeout() {
      return (
        currentQueryTimeout.value == selectedQueryTimeout.value &&
        currentDeploymentTimeout.value == selectedDeploymentTimeout.value
      );
    }
    async function UpdateTimeout() {
      try {
        const client = gridStore.client as GridClient;

        if (selectedQueryTimeout.value != currentQueryTimeout.value) {
          localStorage.setItem(TIMEOUT_QUERY_KEY, `${selectedQueryTimeout.value}`);
          window.env.TIMEOUT = +localStorage.getItem(TIMEOUT_QUERY_KEY)! * 1000;
          currentQueryTimeout.value = +localStorage.getItem(TIMEOUT_QUERY_KEY)!;
          selectedQueryTimeout.value = currentQueryTimeout.value;
        }

        if (selectedDeploymentTimeout.value != currentDeploymentTimeout.value) {
          localStorage.setItem(TIMEOUT_DEPLOYMENT_KEY, `${selectedDeploymentTimeout.value}`);
          currentDeploymentTimeout.value = +localStorage.getItem(TIMEOUT_DEPLOYMENT_KEY)!;
          selectedDeploymentTimeout.value = currentDeploymentTimeout.value;
          if (client) {
            client.clientOptions.deploymentTimeoutMinutes = +localStorage.getItem(TIMEOUT_DEPLOYMENT_KEY)! / 60;
            await client._connect;
          }
        }

        createCustomToast("Session Timeout Updated", ToastType.success);

        isValidTimeout.value = false;
      } catch (err) {
        createCustomToast("Could not update timeout", ToastType.danger);
        console.log(err);
      }
    }

    return {
      themes,
      selectedTheme,
      currentTheme,
      currentPassword,
      newPassword,
      confirmPassword,
      selectedQueryTimeout,
      selectedDeploymentTimeout,
      currentQueryTimeout,
      isValidTimeout,
      isValidPassword,
      UpdateTheme,
      UpdatePassword,
      UpdateTimeout,
      validateCurrentPassword,
      validateNewPassword,
      validateConfirmPassword,
      isCurrentTheme,
      isCurrentTimeout,
    };
  },
};
</script>
