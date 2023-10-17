import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

import { createApp } from "vue";

import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import store from "./store/index";

const app = createApp(App);
app.use(store);
app.use(vuetify);
app.mount("#app");
