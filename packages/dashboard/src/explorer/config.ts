import Vue from "vue";
import VueApollo from "vue-apollo";

import toHumanDate from "./filters/date";
import optionTitleFiler from "./filters/optionTitle";
import toReadableDate from "./filters/toReadableDate";
import toTeraOrGigaOrPeta from "./filters/toTeraOrGigaOrPeta";
import apolloProvider from "./plugins/apollo";

Vue.use(VueApollo);
Vue.filter("date", toHumanDate);
Vue.filter("optionTitle", optionTitleFiler);
Vue.filter("toTeraOrGigaOrPeta", toTeraOrGigaOrPeta);
Vue.filter("toReadableDate", toReadableDate);

export const explorerConfigs: any = {
  apolloProvider,
};
