import { createStore } from "vuex";

import statsModule from "./stats/index";
const store = createStore({
  modules: {
    stats: statsModule,
  },
});
export default store;
