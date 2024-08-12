<template>
  <view-layout>
    <v-card color="primary" class="d-flex justify-center items-center mt-3 pa-3 text-center">
      <v-icon size="30" class="pr-3">mdi-cog</v-icon>
      <v-card-title class="pa-0">Settings</v-card-title>
    </v-card>
    <v-card class="my-5"
      ><v-card-title>Theme</v-card-title> <v-card-text>Pick an application theme!</v-card-text>
      <form-validator v-model="isValidTheme" valid-on-init>
        <input-validator :rules="[validateTheme]" #="{ props }" ref="themeInput" :value="selectedTheme">
          <v-select class="pa-3" :items="themes" v-model="selectedTheme" v-bind="props" />
        </input-validator>
      </form-validator>
      <v-card-actions class="justify-end" :disabled="!isValidTheme">
        <v-btn :disabled="!isValidTheme" @click="UpdateTheme" class="justify-end ml-auto">Update</v-btn></v-card-actions
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
            <v-tooltip location="top right" text="Please enter your current password.">
              <template #activator="{ props: tooltipProps }">
                <div v-bind="tooltipProps">
                  <VTextField
                    label="Current Password"
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
            <v-tooltip location="top right" text="Please enter your current password.">
              <template #activator="{ props: tooltipProps }">
                <div v-bind="tooltipProps">
                  <VTextField
                    label="New Password"
                    v-model="newPassword"
                    v-bind="{ ...passwordInputProps, ...validationProps }"
                    autocomplete="off"
                    class="pa-3"
                  />
                </div>
              </template>
            </v-tooltip>
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
      <v-card-actions class="justify-end">
        <v-btn :disabled="!isValidPassword" @click="UpdatePassword" class="justify-end ml-auto"
          >Update</v-btn
        ></v-card-actions
      >
    </v-card>
    <v-card class="my-5"
      ><v-card-title>Timeout</v-card-title>

      <v-tooltip text="Set desired session timeout in seconds">
        <template v-slot:activator="{ props }">
          <v-card-text v-bind="props">Adjust Timeout <v-icon icon="mdi-information-outline" /></v-card-text>
        </template>
      </v-tooltip>
      <form-validator v-model="isValidTimeout" valid-on-init>
        <input-validator
          :value="selectedTimeout"
          :rules="[
            validators.required('Timeout is required.'),
            validators.isInt('Timeout must be a valid integer.'),
            validateTimeout,
          ]"
          #="{ props }"
          ref="timeoutInput"
        >
          <v-text-field
            label="Enter timeout (sec)"
            class="pa-5"
            v-bind="props"
            type="number"
            v-model="selectedTimeout"
          ></v-text-field>
        </input-validator>
        <v-card-actions class="justify-end">
          <v-btn :disabled="!isValidTimeout" @click="UpdateTimeout" class="justify-end ml-auto"
            >Update</v-btn
          ></v-card-actions
        >
      </form-validator>
    </v-card>
  </view-layout>
</template>
<script lang="ts">
import md5 from "md5";
import { ref, watch } from "vue";
import { useTheme } from "vuetify";

import { createCustomToast, ToastType } from "@/utils/custom_toast";

import { getCredentials, updateCredentials } from "../utils/credentials";
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
    const newPassword = ref("");
    const confirmPassword = ref("");
    const selectedTimeout = ref(window.env.TIMEOUT / 1000);
    const isValidTimeout = ref(false);
    const isValidPassword = ref(false);
    const isValidTheme = ref(false);
    function validateTheme() {
      if (selectedTheme.value.split(" ")[0].toLowerCase() == currentTheme) {
        return { message: "Select a theme different from the current one." };
      }
    }

    function UpdateTheme() {
      localStorage.setItem(KEY, selectedTheme.value == "Light Mode" ? "light" : "dark");
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
    function UpdateTimeout() {
      try {
        window.env.TIMEOUT = selectedTimeout.value * 1000;
        createCustomToast("Session Timeout Updated", ToastType.success);
        selectedTimeout.value = window.env.TIMEOUT / 1000;
        isValidTimeout.value = false;
      } catch (err) {
        createCustomToast("Could not update timeout", ToastType.danger);
        console.log(err);
      }
    }
    function validateTimeout() {
      if (selectedTimeout.value == window.env.TIMEOUT / 1000) {
        return { message: "Enter a timeout different from the current one." };
      }
      if (selectedTimeout.value < 1) {
        return { message: "Timeout should be at least 1 second." };
      }
    }

    return {
      themes,
      selectedTheme,
      currentPassword,
      newPassword,
      confirmPassword,
      selectedTimeout,
      isValidTimeout,
      isValidPassword,
      isValidTheme,
      UpdateTheme,
      UpdatePassword,
      UpdateTimeout,
      validateCurrentPassword,
      validateNewPassword,
      validateConfirmPassword,
      validateTimeout,
      validateTheme,
    };
  },
};
</script>
