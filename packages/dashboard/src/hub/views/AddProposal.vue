<template>
  <v-container>
    <v-row class="mb-5 mt-5">
      <v-btn
        :color="$route.fullPath === '/hub/add-proposal' ? 'primary' : undefined"
        class="mr-2"
        @click="$router.push('/hub/add-proposal')"
      >
        Text
      </v-btn>
      <v-btn
        :color="$route.fullPath === '/hub/add-proposal/software' ? 'primary' : undefined"
        @click="$router.push('/hub/add-proposal/software')"
      >
        Software
      </v-btn>
    </v-row>

    <router-view />
  </v-container>
</template>
