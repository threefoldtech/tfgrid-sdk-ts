## Playground project

Playground is a web components which provide a UI to deploy workloads on TF Grid 3. All the backend functionality is provided by [grid_client](https://github.com/threefoldtech/tfgrid-sdk-ts/tree/development/packages/grid_client). It is a reusable component that can be injected in a HTML or a Node Web app.

## Usage

Run the playground locally:
First you need to [Install dependencies and config the environment](./config.md)

Then, to run the playground you need to install dependencies first then run `yarn dev` script.

```bash
yarn
yarn dev           # to install the dependencies
```

To read about each weblet and how to use it, and also how to config your twin id and activate your profile on the playground you can go to the [weblets documentation](https://manual.grid.tf/weblets/weblets_profile_manager.html?highlight=profile#profile-manager).

## Weblet List

There is a several component in the weblets repo, you can find them in the `/src/weblets` directory. and they are:

- Basic Components
  - [Micro Virtual Machine](../src/weblets/micro_vm.vue)
  - [Kubernetes Cluster](../src/weblets/tf_kubernetes.vue)
- Comunity Solutions
  - [Caprover](../src/weblets/tf_caprover.vue)
  - [Peertube](../src/weblets/tf_peertube.vue)
  - [Funkwhale](../src/weblets/tf_funkwhale.vue)
  - [Mattermost](../src/weblets/tf_mattermost.vue)
  - [Discourse](../src/weblets/tf_discourse.vue)
  - [Taiga](../src/weblets/tf_taiga.vue)
  - [Owncloud](../src/weblets/tf_owncloud.vue)
  - [Presearch](../src/weblets/tf_presearch.vue)
  - [Casperlabs](../src/weblets/tf_casperlabs.vue)
  - [Node Pilot](../src/weblets/tf_node_pilot.vue)
  - [Full Virtual Machine](../src/weblets/full_vm.vue)
- Utils Components
  - [Profile](../src/weblets/profile_manager.vue)
  - [Deployments List](../src/weblets/tf_deployment_list.vue)
  - [Contracts List](../src/weblets/tf_contracts_list.vue)
  - ...
