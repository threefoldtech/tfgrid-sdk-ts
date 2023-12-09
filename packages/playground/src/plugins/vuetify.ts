import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { VDataTable, VDataTableServer } from "vuetify/labs/VDataTable";
const vuetify = createVuetify({
  components: {
    ...components,
    VDataTable,
    VDataTableServer,
  },
  directives,
  theme: {
    defaultTheme: "dark",
    themes: {
      dark: {
        dark: true,
        colors: {
          primary: "#1aa18f",
          secondary: "#74DDC3",
          title: "#1AA18F",
          disclaimer: "#4D776D",
          info: "#7de3c8",
          warning: "#FFCC00",
          link: "#5695ff",
          anchor: "#9e9e9e",
        },
      },
      light: {
        dark: false,
        colors: {
          background: "#f6f6f6",
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
