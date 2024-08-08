import "mosha-vue-toastify/dist/style.css";
import "./global.scss";

import { createPinia } from "pinia";
import { createApp } from "vue";

import vuetify from "@/plugins/vuetify";

import { defineGlobals } from "./config";
import Monitor from "./Monitor.vue";
import router from "./router";
import { normalizeError } from "./utils/helpers";

const app = createApp(Monitor);

app.config.errorHandler = error => {
  console.error(
    "[Uncaught Error]\n" +
      `- Message: ${normalizeError(error, "Something went wrong in dashboard app but we couldn't fetch it.")}\n` +
      `- Stack: ${error && typeof error === "object" ? Reflect.get(error, "stack") : null}\n` +
      `- Constructor: ${error && typeof error === "object" ? error.constructor.name : null}`,
  );
};

app.use(createPinia());
app.use(router);
app.use(vuetify);
defineGlobals(app);

app.mount("#app");
