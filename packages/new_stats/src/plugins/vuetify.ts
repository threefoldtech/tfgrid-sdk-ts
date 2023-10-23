import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

const vuetify = createVuetify({
  components: {
    ...components,
  },
  directives,
  theme: {
    defaultTheme: "dark",
    themes: {
      dark: {
        dark: true,
        colors: {
          primary: "#7de3c8",
          secondary: "#74DDC3",
          title: "#1AA18F",
          info: "#7de3c8",
          warning: "#FFCC00",
          link: "#5695ff",
          anchor: "#ffffff",
        },
      },
      light: {
        dark: false,
        colors: {
          primary: "#1AA18F",
          info: "#1AA18F",
          secondary: "#14A1B8",
          anchor: "#000000",
        },
      },
    },
  },
});

export default vuetify;
