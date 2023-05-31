import { createPinia } from "pinia";
import { createApp } from "vue";

import vuetify from "@/plugins/vuetify";

import App from "./App.vue";
import { defineGlobals } from "./config";
import router from "./router";

console.log(window.env);

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(vuetify);
defineGlobals(app);

app.mount("#app");
