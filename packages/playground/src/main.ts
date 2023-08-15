import { useGlobals } from "@threefold/common";
import { createPinia } from "pinia";
import { createApp } from "vue";

import vuetify from "@/plugins/vuetify";

import App from "./App.vue";
import { defineGlobals } from "./config";
import router from "./router";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(vuetify);
app.use(useGlobals());
defineGlobals(app);

app.mount("#app");
