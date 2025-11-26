import "mosha-vue-toastify/dist/style.css";
import "./global.scss";

import * as Sentry from "@sentry/vue";
import { createPinia } from "pinia";
import { type ComponentPublicInstance, createApp } from "vue";

import vuetify from "@/plugins/vuetify";

import { defineGlobals } from "./config";
import Monitor from "./Monitor.vue";
import router from "./router";
import { normalizeError } from "./utils/helpers";
const app = createApp(Monitor);

app.config.errorHandler = error => {
  console.error(
    "[Uncaught Error]\n" +
      `- Message: ${normalizeError(error, "Something went wrong in dashboard app but we couldn't fetch it.")}\n` +
      `- Stack: ${error && typeof error === "object" ? Reflect.get(error, "stack") : null}\n` +
      `- Constructor: ${error && typeof error === "object" ? error.constructor.name : null}`,
  );
};

// In development mode, log warnings to the console not to the logger
if (import.meta.env.DEV) {
  app.config.warnHandler = (msg: string, instance: ComponentPublicInstance | null, trace: string) => {
    const componentName = instance?.$?.type?.name || instance?.$?.type?.__name || "AnonymousComponent";
    console.warn(`[Vue Warning] ${msg}\n` + `Component: <${componentName}>\n` + (trace ? `Trace:\n${trace}` : ""));
  };
}

if (window.env.ENABLE_TELEMETRY) {
  Sentry.init({
    app,
    dsn: window.env.SENTRY_DSN,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
    release: process.env.VERSION,
    // Performance Monitoring
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0, // 10% in production, 100% in development
    // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
    // Session Replay
    replaysSessionSampleRate: import.meta.env.PROD ? 0.01 : 0.1, // 1% in production, 10% in development
    replaysOnErrorSampleRate: import.meta.env.PROD ? 0.5 : 1.0, // 50% in production, 100% in development
  });
}

app.use(createPinia());
app.use(router);
app.use(vuetify);
defineGlobals(app);
app.provide("noAppVersion", "No version to show");

app.mount("#app");
