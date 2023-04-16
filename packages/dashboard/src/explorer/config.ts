import Vue from "vue";
import VueApollo from "vue-apollo";

import dateFiler from "./filters/date";
import optionTitleFiler from "./filters/optionTitle";
import secondToRedable from "./filters/secondToRedable";
import toTeraOrGigaOrPeta from "./filters/toTeraOrGigaOrPeta";
import apolloProvider from "./plugins/apollo";

Vue.use(VueApollo);
Vue.filter("date", dateFiler);
Vue.filter("optionTitle", optionTitleFiler);
Vue.filter("toTeraOrGigaOrPeta", toTeraOrGigaOrPeta);
Vue.filter("secondToRedable", secondToRedable);

export const explorerConfigs: any = {
  apolloProvider,
};
