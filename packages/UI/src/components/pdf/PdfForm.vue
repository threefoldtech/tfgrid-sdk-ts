<template>
  <v-container v-if="isSubmitted">
    <object :data="pdfLink" type="application/pdf" width="100%" height="910">
      <p>PDF cannot be displayed.</p>
    </object>
  </v-container>

  <v-container v-else>
    <div class="d-flex align-center">
      <img class="threefold-logo" src="../../assets/threefold-logo.png" alt="" />
      <span class="logo-text">Viewer</span>
    </div>

    <div class="form-box">
      <v-form class="form" ref="form" @submit.prevent="submitForm">
        <v-text-field
          prepend-inner-icon="mdi-link"
          label="Pdf Link"
          :class="{ 'error-field': errorLink && isClicked }"
          v-model="pdfLink"
          required
          @click="isClicked = true"
          class="input-label"
          :rules="[validateLinkRule]"
        ></v-text-field>

        <v-btn type="submit" block class="mt-2 btn" :disabled="errorLink">Load</v-btn>
      </v-form>
    </div>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { validatePdfUrl, type ValidationResult } from "../../utils/validations";

export default defineComponent({
  data() {
    return {
      pdfLink: "",
      isClicked: false,
      isSubmitted: false,
      linkValidationResult: {} as ValidationResult,
    };
  },
  computed: {
    errorLink(): boolean {
      return !validatePdfUrl(this.pdfLink).isValid;
    },
    validateLinkRule() {
      return (value: string) => {
        this.linkValidationResult = validatePdfUrl(value);
        return this.linkValidationResult.isValid || this.linkValidationResult.errorMessage;
      };
    },
  },

  methods: {
    submitForm() {
      if (!this.errorLink) {
        this.isSubmitted = true;
        console.log("Link:", this.pdfLink);
      } else {
        console.log("Form is not valid");
      }
    },
  },
});
</script>

<style scoped>
.threefold-logo {
  width: 10rem;
  /* height: 15rem; */
}
.logo-text {
  color: #ffffffc9;
  font-size: 22px;
  font-weight: 600;
  margin-left: -18px;
}
.btn {
  border-radius: 8px;
  background: #5038ed;
  box-shadow: 0px 8px 21px 0px rgba(0, 0, 0, 0.16);
  color: #ffff;
  width: 13rem;
  min-width: 13rem;
}
.v-btn--block {
  display: flex;
  flex: 1 0 auto;
  min-width: 13rem;
}
.form-box {
  width: 50%;
  margin: 0 auto;
  height: 20rem;
  display: flex;
  justify-content: center;
  align-items: center;
}
.form {
  width: 90%;
}
</style>
