<template>
  <div>
    <v-alert variant="tonal" type="warning" :class="{ 'mb-4': persistent }">
      <slot v-if="$slots.default"></slot>
      <p v-else>Configure your SMTP Server.</p>
    </v-alert>

    <input-tooltip
      v-if="!persistent"
      inline
      tooltip="When the SMTP server is enabled, the system is capable of sending outgoing emails through the SMTP server."
    >
      <v-switch color="primary" inset label="Toggle SMTP Server Enable" v-model="$props.modelValue.enabled" />
    </input-tooltip>

    <template v-if="$props.modelValue.enabled || persistent">
      <input-validator
        :value="$props.modelValue.username"
        :rules="[
          validators.required('Email is required.'),
          validators.isEmail('Please provide a valid email address.'),
        ]"
        #="{ props }"
      >
        <input-tooltip tooltip="SMTP admin email.">
          <v-text-field
            label="Admin Email"
            placeholder="email@example.com"
            v-model="$props.modelValue.username"
            v-bind="props"
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
          <input-tooltip tooltip="SMTP admin password.">
            <v-text-field
              label="Admin Password"
              placeholder="email@example.com"
              v-model="$props.modelValue.password"
              v-bind="{ ...props, ...validatorProps }"
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
        <input-tooltip tooltip="From email address.">
          <v-text-field
            label="From Email Address"
            placeholder="email@example.com"
            v-model="$props.modelValue.email"
            v-bind="props"
            autofocus
          />
        </input-tooltip>
      </input-validator>

      <input-validator
        :value="$props.modelValue.hostname"
        :rules="[validators.required('Hostname is required.'), validators.isURL('Please provide a valid hostname.')]"
        #="{ props }"
      >
        <input-tooltip tooltip="SMTP host server.">
          <v-text-field
            label="Hostname"
            placeholder="email@example.com"
            v-model="$props.modelValue.hostname"
            v-bind="props"
            autofocus
          />
        </input-tooltip>
      </input-validator>

      <input-validator
        :value="$props.modelValue.port"
        :rules="[validators.required('Port is required.'), validators.isPort('Please provide a valid port.')]"
        #="{ props }"
      >
        <input-tooltip tooltip="SMTP port server.">
          <v-text-field label="Port" v-model.number="$props.modelValue.port" v-bind="props" />
        </input-tooltip>
      </input-validator>

      <input-tooltip
        v-if="tls"
        #="props"
        inline
        tooltip="TLS (Transport Layer Security) is a cryptographic protocol that ensures secure communication over a network. It provides encryption, authentication, and data integrity, making it an essential component for secure deployments."
      >
        <v-switch color="primary" inset label="Use TLS" v-bind="props" />
      </input-tooltip>

      <input-tooltip
        v-if="ssl"
        #="props"
        inline
        tooltip="SSL (Secure Sockets Layer) is an older cryptographic protocol that was widely used for secure communication before being superseded by TLS. SSL and TLS are often used interchangeably, but technically TLS is the successor of SSL."
      >
        <v-switch color="primary" inset label="Use SSL" v-bind="props" />
      </input-tooltip>
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
import type { SMTPServer } from "../types";
import { generatePassword } from "../utils/strings";

export function createSMTPServer(options: Partial<SMTPServer> = {}): SMTPServer {
  return {
    enabled: options.enabled || false,
    username: options.username || "",
    email: options.email || "",
    hostname: options.hostname || "smtp.gmail.com",
    port: options.port || 587,
    tls: options.tls || false,
    ssl: options.ssl || false,
    password: options.password || generatePassword(),
  };
}

export default {
  name: "SmtpServer",
};
</script>
