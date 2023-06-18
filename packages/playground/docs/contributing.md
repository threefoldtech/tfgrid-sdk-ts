# Contribution

## Prerequisites

- Make sure you go through the [getting started](./getting_started.md) guide first.
- Have some knowledge of [Typescript](https://www.typescriptlang.org/docs/), [Vue3](https://vuejs.org/guide/introduction.html) & [Composition API](https://vuejs.org/api/composition-api-setup.html)

## Write a Weblet

We are going to add new weblet called `demo`

1. Add new file called **tf_demo.vue** at `src/weblets/`
2. Import the demo file in views folder & include the deployment list with the project name (demo) in this case

Note: Make sure to include the project name to ProjectName enum in [index.ts](../src/types/index.ts)

```html
<template>
  <div>
    <TfDemo />
    <div class="mt-4">
      <TfDeploymentList title="deployment list" :project-name="name" />
    </div>
  </div>
</template>

<script lang="ts">
  import { ProjectName } from "../types";
  import TfDemo from "../weblets/tf_demo.vue";
  import TfDeploymentList from "../weblets/tf_deployment_list.vue";

  export default {
    name: "DemoView",
    components: {
      TfDemo,
      TfDeploymentList,
    },
    setup() {
      return { name: ProjectName.Demo };
    },
  };
</script>
```

3. Add the routing for the created project in [index.ts](../src/router/index.ts).

   ```ts
   // index.ts

    {
      path: "/demo",
      component: () => import("../views/tf_demo.vue"),
      meta: { title: "Demo" },
    },
   ```

4. You can now run the new solution

   ```sh
   yarn dev
   ```
