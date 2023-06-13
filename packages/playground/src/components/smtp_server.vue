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
        <input-tooltip #="{ tooltipProps }" tooltip="SMTP admin email.">
          <v-text-field
            label="Admin Email"
            placeholder="email@example.com"
            v-model="$props.modelValue.username"
            v-bind="{ ...props, ...tooltipProps }"
            autofocus
          />
        </input-tooltip>
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
          <input-tooltip #="{ tooltipProps }" tooltip="SMTP admin password.">
            <v-text-field
              label="Admin Password"
              placeholder="email@example.com"
              v-model="$props.modelValue.password"
              v-bind="{ ...props, ...tooltipProps }"
              autofocus
            />
          </input-tooltip>
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
        <input-tooltip #="{ tooltipProps }" tooltip="From email address.">
          <v-text-field
            label="From Email Address"
            placeholder="email@example.com"
            v-model="$props.modelValue.email"
            v-bind="{ ...props, ...tooltipProps }"
            autofocus
          />
        </input-tooltip>
      </input-validator>

      <input-validator
        :value="$props.modelValue.hostname"
        :rules="[validators.required('Hostname is required.'), validators.isURL('Please provide a valid hostname.')]"
        #="{ props }"
      >
        <input-tooltip #="{ tooltipProps }" tooltip="SMTP host server.">
          <v-text-field
            label="Hostname"
            placeholder="email@example.com"
            v-model="$props.modelValue.hostname"
            v-bind="{ ...props, ...tooltipProps }"
            autofocus
          />
        </input-tooltip>
      </input-validator>

      <input-validator
        :value="$props.modelValue.port"
        :rules="[validators.required('Port is required.'), validators.isPort('Please provide a valid port.')]"
        #="{ props }"
      >
        <input-tooltip #="{ tooltipProps }" tooltip="SMTP port server.">
          <v-text-field label="Port" v-model.number="$props.modelValue.port" v-bind="{ ...props, ...tooltipProps }" />
        </input-tooltip>
      </input-validator>

      <v-tooltip
        location="top"
        text="TLS (Transport Layer Security) is a cryptographic protocol that ensures secure communication over a network. It provides encryption, authentication, and data integrity, making it an essential component for secure deployments."
      >
        <template v-slot:activator="{ props }">
          <v-switch inset color="primary" label="Use TLS" v-if="tls" v-bind="props" />
        </template>
      </v-tooltip>

      <v-tooltip
        location="top"
        text="SSL (Secure Sockets Layer) is an older cryptographic protocol that was widely used for secure communication before being superseded by TLS. SSL and TLS are often used interchangeably, but technically TLS is the successor of SSL."
      >
        <template v-slot:activator="{ props }">
          <v-switch inset color="primary" label="Use SSL" v-if="ssl" v-bind="props" />
        </template>
      </v-tooltip>
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
