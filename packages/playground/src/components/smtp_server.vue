<template>
  <div>
    <v-alert variant="tonal" type="warning" :class="{ 'mb-4': persistent }">
      <slot v-if="$slots.default"></slot>
      <p v-else>Configure your SMTP Server.</p>
    </v-alert>

    <v-switch
      inset
      v-model="$props.modelValue.enabled"
      label="Toggle SMTP Server Enable"
      v-if="!persistent"
      color="primary"
    />

    <template v-if="$props.modelValue.enabled || persistent">
      <input-validator
        :value="$props.modelValue.username"
        :rules="[
          validators.required('Email is required.'),
          validators.isEmail('Please provide a valid email address.'),
        ]"
        #="{ props }"
      >
        <v-text-field
          label="Email"
          placeholder="email@example.com"
          v-model="$props.modelValue.username"
          v-bind="props"
          autofocus
        />
      </input-validator>

      <password-input-wrapper #="{ props }">
        <input-validator
          :value="$props.modelValue.password"
          :rules="[
            validators.required('Password is required.'),
            validators.minLength('Password must be at least 6 characters.', 6),
            validators.maxLength('Password cannot exceed 15 characters.', 15),
          ]"
          #="{ props: validatorProps }"
        >
          <v-text-field
            label="Password"
            v-model="$props.modelValue.password"
            v-bind="{ ...props, ...validatorProps }"
          />
        </input-validator>
      </password-input-wrapper>

      <input-validator
        :value="$props.modelValue.email"
        :rules="[
          validators.required('Email is required.'),
          validators.isEmail('Please provide a valid email address.'),
        ]"
        v-if="email"
        #="{ props }"
      >
        <v-text-field
          label="From Email Address"
          placeholder="support@example.com"
          v-bind="props"
          v-model="$props.modelValue.email"
        />
      </input-validator>

      <input-validator
        :value="$props.modelValue.hostname"
        :rules="[validators.required('Hostname is required.'), validators.isURL('Please provide a valid hostname.')]"
        #="{ props }"
      >
        <v-text-field label="Hostname" v-model="$props.modelValue.hostname" v-bind="props" />
      </input-validator>

      <input-validator
        :value="$props.modelValue.port"
        :rules="[validators.required('Port is required.'), validators.isPort('Please provide a valid port.')]"
        #="{ props }"
      >
        <v-text-field label="Port" v-model.number="$props.modelValue.port" v-bind="props" />
      </input-validator>

      <v-switch inset color="primary" label="Use TLS" v-if="tls" />
      <v-switch inset color="primary" label="Use SSL" v-if="ssl" />
    </template>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  modelValue: SMTPServer;
  ssl?: boolean;
  tls?: boolean;
  email?: boolean;
  persistent?: boolean;
}>();
</script>

<script lang="ts">
import { generateString } from "@threefold/grid_client";

import type { SMTPServer } from "../types";

export function createSMTPServer(options: Partial<SMTPServer> = {}): SMTPServer {
  return {
    enabled: options.enabled || false,
    username: options.username || "",
    email: options.email || "",
    hostname: options.hostname || "smtp.gmail.com",
    port: options.port || 587,
    tls: options.tls || false,
    ssl: options.ssl || false,
    password: options.password || generateString(12),
  };
}

export default {
  name: "SmtpServer",
};
</script>
