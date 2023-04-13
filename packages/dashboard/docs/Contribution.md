# Architecture

## src

```
.
├── assets
├── Dashboard.vue
├── explorer
├── hub
├── main.ts
├── plugins
├── portal
├── router
├── shims-png.d.ts
├── shims-tsx.d.ts
├── shims-vue.d.ts
├── shims-vuetify.d.ts
└── store
```

#### Assets

- to add images to the project go to the assets folder and add the images you want to use in your project
- to add global styles to the project go to the assets folder then to the css folder and add the styles you want to use in your project

#### router

##### What is the purpose of the router?

- the router is the main component of the project it is responsible for routing the user to the right component
- the router can have nested routes to navigate to different components

##### How to use the router?

- simply import the component that you want to route to
- then append it to the routes array in this form :
  ```
  {
    component: <Component>,
    path: "/<path>",
    children: <Nested-Router>,
  }
  ```
- If you want to create new Category in the sidebar then you need to create a new component and add it to the router

#### If you want to create new Category in the sidebar

- you create a new folder with the name of the category and inside it components,router (these will be the nested routes),Assets,lib (for manipulative functions) folder
- example explorer folder:

```
.
├── assets
├── components
├── config.ts
├── Explorer.vue
├── filters
├── graphql
├── json
├── plugins
├── router
├── store
├── types
├── utils
└── views
```

- `suggestion: copy this entire directory and start working on it file by file , make sure to remove the files that you don't need , and down here will be explanation for each file purpose`

#### Starting Point : Explorer.vue

- you need to import

  ```
  import { Component, Vue } from "vue-property-decorator";
  import Sidenav from "./components/Sidebar.vue";
  import Navbar from "./components/Navbar.vue";
  import { ActionTypes } from "./store/actions";
  ```

- you need to add the components to the components object
  ```
  components: {
    Sidenav,
    Navbar,
  },
  ```

#### In the router/index.ts folder

- you need to add the router to the router object

```
import { RouteConfig } from "vue-router";



export const explorerRouter: RouteConfig[] = [
{
path: "/explorer/statistics",
name: "Statistics",
component: () => import("../views/Statistics.vue"),
},
{
path: "/explorer/nodes",
name: "Nodes",
component: () => import("../views/Nodes.vue"),
},
{
path: "/explorer/farms",
name: "Farms",
component: () => import("../views/Farms.vue"),
},
];


```

#### In the views folder

```
.
├── Farms.vue
├── Nodes.vue
└── Statistics.vue
```

- you need to add the component that you want to route to
- each component should have a name and a template
- for example : Statistics.vue

```
<template>
  <Layout pageName="Statistics" v-if="stats" :noFilter="true">
    <v-row>
      <section class="items" v-if="statistics.length > 0">
        <div v-for="item of statistics" :key="item.title">
          <StatisticsCard :item="item" />
        </div>
      </section>
      <v-col cols="10" class="mx-auto">
        <tf-map :nodes="nodesDistribution"></tf-map
      ></v-col>
    </v-row>

    <section class="loader" v-if="statistics.length === 0">
      <v-progress-circular size="150" indeterminate />
    </section>

    <v-divider class="mt-2 mb-2" />
  </Layout>
</template>
```

- take a look at the template and see how it is structured in Statistics.vue file

#### In the components folder

- you need to add the components that you want to use in the views
- for example : StatisticsCard.vue

```
<template>
  <v-card class="mx-auto" max-width="300">
    <v-card-title class="headline">{{ item.title }}</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="6">
          <v-icon color="primary" size="50">{{ item.icon }}</v-icon>
        </v-col>
        <v-col cols="6">
          <h1 class="text-center">{{ item.value }}</h1>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
```

#### In the graphql folder

- you need to add the queries that you want to use in the project
- and its relative types within its own files

#### In the store folder

- here you have your REDUX store files

#### In the plugins folder

- here you have your plugins files example:
  - axios.ts = > where you can add your <a href="https://axios-http.com/docs/instance">axios</a> Instance configuration base url,headers,etc
  - apollo.ts => where you can add your <a href="https://www.apollographql.com/docs/">apollo</a>
    configuration
  - vuetify.ts => where you can add your <a href="https://vuetifyjs.com/en/getting-started/quick-start/">vuetify</a> configuration

#### In the utils folder

- here you have your manipulative functions in each file

#### In the types folder

- here you have your typescript types
