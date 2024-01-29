import "mosha-vue-toastify/dist/style.css";
import "./global.css";

import { createPinia } from "pinia";
import { createApp } from "vue";

import vuetify from "@/plugins/vuetify";

import App from "./App.vue";
import { defineGlobals } from "./config";
import router from "./router";
import { normalizeError } from "./utils/helpers";

const app = createApp(App);

app.config.errorHandler = error => {
  console.error(
    "[Uncatched Error]",
    normalizeError(error, "Something went wrong in dashboard app but we couldn't fetch it."),
  );
};

app.use(createPinia());
app.use(router);
app.use(vuetify);
defineGlobals(app);

app.mount("#app");
