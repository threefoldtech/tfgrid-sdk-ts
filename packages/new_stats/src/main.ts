import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

import { createPinia } from "pinia";
import { createApp } from "vue";

import App from "./App.vue";
import vuetify from "./plugins/vuetify";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(vuetify);
app.mount("#app");
