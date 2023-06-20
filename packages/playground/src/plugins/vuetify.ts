import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { VDataTable } from "vuetify/labs/VDataTable";

const vuetify = createVuetify({
  components: {
    ...components,
    VDataTable,
  },
  directives,
  theme: {
    defaultTheme: "dark",
    themes: {
      dark: {
        dark: true,
        colors: {
          primary: "#1AA18F",
          info: "#14B874",
          link: "#5eaff4",
          warning: "#FFCC00",
        },
      },
      light: {
        dark: false,
        colors: {
          primary: "#1AA18F",
          secondary: "#855DE0",
          info: "#1AA18F",
          link: "#5eaff4",
        },
      },
    },
  },
});

export default vuetify;
