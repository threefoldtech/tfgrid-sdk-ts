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
          primary: "#76E2C8",
          info: "#DC8DE3",
        },
      },
      light: {
        dark: false,
        colors: {
          primary: "#1AA18F",
          info: "#e61ef4",
          secondary: "#855DE0",
        },
      },
    },
  },
});

export default vuetify;
