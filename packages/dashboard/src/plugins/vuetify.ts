import Vue from "vue";
import Vuetify from "vuetify/lib/framework";
import "@fortawesome/fontawesome-free/css/all.css"; // Ensure you are using css-loader

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    options: {
      customProperties: true,
    },
    themes: {
      light: {
        primary: "#1982b1",
        bg: "#064663",
        background: "#f4f4f4",
      },
      dark: {
        primary: "#1982b1",
        background: "#333",
      },
    },
    dark: false,
  },
  icons: {
    iconfont: "fa",
  },
});
