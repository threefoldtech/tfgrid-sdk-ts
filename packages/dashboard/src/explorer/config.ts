import Vue from "vue";

import dateFiler from "./filters/date";
import optionTitleFiler from "./filters/optionTitle";
import toTeraOrGigaOrPeta from "./filters/toTeraOrGigaOrPeta";
import secondToRedable from "./filters/secondToRedable";
import apolloProvider from "./plugins/apollo";
import VueApollo from "vue-apollo";

Vue.use(VueApollo);
Vue.filter("date", dateFiler);
Vue.filter("optionTitle", optionTitleFiler);
Vue.filter("toTeraOrGigaOrPeta", toTeraOrGigaOrPeta);
Vue.filter("secondToRedable", secondToRedable);

export const explorerConfigs: any = {
  apolloProvider,
};
