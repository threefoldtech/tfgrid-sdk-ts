import Vue from "vue";
import Toasted from "vue-toasted";

import Dashboard from "./Dashboard.vue";
import { explorerConfigs } from "./explorer/config";
import {} from "./hub/config";
import vuetify from "./plugins/vuetify";
import router from "./router";
import store from "./store";

Vue.config.productionTip = false;

Vue.use(Toasted, {
  position: "bottom-right",
  duration: 4000,
});

new Vue({
  router,
  store,
  vuetify,
  ...explorerConfigs,
  render: h => h(Dashboard),
}).$mount("#app");
