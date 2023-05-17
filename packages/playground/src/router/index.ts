import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../views/full_virtual_machine.vue'),
      meta: { title: 'Full Virtual Machine' },
    },
    {
      path: '/vm',
      component: () => import('../views/micro_virtual_machine.vue'),
      meta: { title: 'Micro Virtual Machine' },
    },
    {
      path: '/kubernetes',
      component: () => import('../views/kubernetes_view.vue'),
      meta: { title: 'Kubernetes' },
    },
    {
      path: '/caprover',
      component: () => import('../views/caprover_view.vue'),
      meta: { title: 'Caprover' },
    },
    {
      path: '/peertube',
      component: () => import('../views/peertube_view.vue'),
      meta: { title: 'Peertube' },
    },
    {
      path: '/funkwhale',
      component: () => import('../views/funkwhale_view.vue'),
      meta: { title: 'Funkwhale' },
    },
    {
      path: '/mattermost',
      component: () => import('../views/mattermost_view.vue'),
      meta: { title: 'Mattermost' },
    },
    {
      path: '/discourse',
      component: () => import('../views/discourse_view.vue'),
      meta: { title: 'Discourse' },
    },
    {
      path: '/taiga',
      component: () => import('../views/taiga_view.vue'),
      meta: { title: 'Taiga' },
    },
    {
      path: '/owncloud',
      component: () => import('../views/owncloud_view.vue'),
      meta: { title: 'Owncloud' },
    },
    {
      path: '/presearch',
      component: () => import('../views/presearch_view.vue'),
      meta: { title: 'Presearch' },
    },
    {
      path: '/subsquid',
      component: () => import('../views/subsquid_view.vue'),
      meta: { title: 'Subsquid' },
    },
    {
      path: '/casperlabs',
      component: () => import('../views/casperlabs_view.vue'),
      meta: { title: 'Casperlabs' },
    },
    {
      path: '/algorand',
      component: () => import('../views/algorand_view.vue'),
      meta: { title: 'Algorand' },
    },
    {
      path: '/nodepilot',
      component: () => import('../views/node_pilot.vue'),
      meta: { title: 'Node Pilot' },
    },
    {
      path: '/wordpress',
      component: () => import('../views/wordpress_view.vue'),
      meta: { title: 'Wordpress' },
    },
    {
      path: '/umbrel',
      component: () => import('../views/umbrel_view.vue'),
      meta: { title: 'Umbrel' },
    },
    {
      path: '/contractslist',
      component: () => import('../views/contracts_list.vue'),
      meta: { title: 'Contracts List' },
    },
    {
      path: '/deployedlist',
      component: () => import('../views/deployment_list.vue'),
      meta: { title: 'Deployment List' },
    },
    {
      path: '/:pathMatch(.*)*',
      component: () => import('../views/not_yet_implemented.vue'),
      meta: { title: 'Not Yet Implemented' },
    },
  ],
})

export default router
