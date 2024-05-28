<template>
  <view-layout>
    <v-text-field label="Search Applications" v-model="searchItem" class="mb-5" clearable></v-text-field>
    <v-row>
      <v-col sm="12" md="6" lg="4" v-for="card in filteredCards" :key="card.title">
        <router-link :to="card.route">
          <v-hover>
            <template v-slot:default="{ isHovering, props }">
              <v-card class="pa-3 pt-6" height="100%" v-bind="props" :class="isHovering ? 'card-opacity' : undefined">
                <v-img
                  class="d-inline-block ml-3 mb-2"
                  width="35"
                  :src="baseURL + 'images/icons/' + card.icon"
                  :alt="card.title"
                  :style="{
                    filter: `brightness(${$vuetify.theme.global.name === 'light' ? 0.2 : 1})`,
                    lineHeight: 1,
                  }"
                />
                <v-card-title class="d-inline-block">
                  {{ card.title }}
                  <v-chip v-for="tag in card.tags" :key="tag" class="ml-2 pulse-animation">
                    {{ tag }}
                  </v-chip>
                </v-card-title>
                <v-card-text class="mt-2"> {{ card.excerpt }} </v-card-text>
              </v-card>
            </template></v-hover
          >
        </router-link>
      </v-col>
      <p v-if="filteredCards.length === 0" class="mx-3 mb-3">No solution was found with the provided search query.</p>
    </v-row>
  </view-layout>
</template>

<script lang="ts">
import { computed, ref } from "vue";

import { DashboardRoutes } from "@/router/routes";

interface Card {
  title: string;
  excerpt: string;
  icon: string;
  route: string;
  tags?: string[];
}

export default {
  name: "SolutionsView",
  setup() {
    const cards: Card[] = [
      {
        title: "Peertube",
        excerpt: "Peertube aspires to be a decentralized and free/libre alternative to video broadcasting services.",
        icon: "peertube.png",
        route: DashboardRoutes.Applications.Peertube,
      },
      {
        title: "Funkwhale",
        excerpt:
          "Funkwhale is social platform to enjoy and share music. Funkwhale is a community-driven project that lets you listen and share music and audio within a decentralized, open network.",
        icon: "funkwhale.png",
        route: DashboardRoutes.Applications.Funkwhale,
      },
      {
        title: "Mattermost",
        excerpt:
          "Mattermost is an open-source, self-hostable online chat service with file sharing, search, and integrations. It is designed as an internal chat for organisations and companies.",
        icon: "mattermost.png",
        route: DashboardRoutes.Applications.Mattermost,
        tags: ["Alpha"],
      },
      {
        title: "Discourse",
        excerpt:
          "Discourse is the 100% open source discussion platform built for the next decade of the Internet. Use it as a mailing list, discussion forum, long-form chat room, and more!",
        icon: "discourse.png",
        route: DashboardRoutes.Applications.Discourse,
      },
      {
        title: "Taiga",
        excerpt:
          "Taiga is a project management application that can handle both simple and complex projects for startups, software developers, and other target teams. It tracks the progress of a project.",
        icon: "taiga.png",
        route: DashboardRoutes.Applications.Taiga,
      },
      {
        title: "Static Website",
        excerpt:
          "Static Website is an application where a user provides a Github repository url and it's automatically served using Caddy.",
        icon: "static_website.png",
        route: DashboardRoutes.Applications.StaticWebsite,
      },
      // {
      //   title: "Owncloud",
      //   excerpt:
      //     "ownCloud develops and provides open-source software for content collaboration, allowing teams to easily share and work on files seamlessly regardless of device or location.",
      //   icon: "owncloud.png",
      //   route: DashboardRoutes.Applications.Owncloud,
      // },
      {
        title: "Nextcloud",
        excerpt:
          "Nextcloud is a suite of client-server software for creating and using file hosting services. Nextcloud provides functionality similar to Dropbox, Office 365 or Google Drive.",
        icon: "nextcloud.png",
        route: DashboardRoutes.Applications.Nextcloud,
        tags: ["Community"],
      },
      {
        title: "Presearch",
        excerpt:
          "Presearch is a community-powered, decentralized search engine that provides better results while protecting your privacy and rewarding you when you search. This weblet deploys a Presearch node. ",
        icon: "presearch.png",
        route: DashboardRoutes.Applications.Presearch,
      },
      {
        title: "Subsquid",
        excerpt:
          "Subsquid indexer is a piece of software that reads all the blocks from a Substrate based blockchain, decodes and stores them for processing in a later stage.",
        icon: "subsquid.png",
        route: DashboardRoutes.Applications.Subsquid,
      },
      {
        title: "Casperlabs",
        excerpt:
          "Casper Network is a blockchain protocol built from the ground up to remain true to core Web3 principles and adapt to the needs of our evolving world.",
        icon: "casperlabs.png",
        route: DashboardRoutes.Applications.Casperlabs,
      },
      {
        title: "Algorand",
        excerpt:
          "Algorand builds technology that accelerates the convergence between decentralized and traditional finance by enabling the simple creation of next-generation financial products, protocols, and exchange of value.",
        icon: "algorand.png",
        route: DashboardRoutes.Applications.Algorand,
      },
      {
        title: "Node Pilot",
        excerpt:
          "Deploy, manage, and monetize crypto nodes with a few clicks. Seamless Docker integration brings enterprise-level security and scalability.",
        icon: "vm.png",
        route: DashboardRoutes.Applications.Nodepilot,
      },
      {
        title: "Umbrel",
        excerpt:
          "Umbrel is an OS for running a personal server in your home. Self-host open source apps like Nextcloud, Bitcoin node, and more.",
        icon: "umbrel.png",
        route: DashboardRoutes.Applications.Umbrel,
      },
      //       {
      //         title: "Freeflow",
      //         excerpt: `Freeflow is a convenient ecosystem on top of a resilient internet grid. We bring you a new internet with a set of
      // productivity tools so you can enhance collaboration within your country, your company, your community.`,
      //         icon: "freeflow.png",
      //         route: DashboardRoutes.Applications.Freeflow,
      //       },
      {
        title: "Wordpress",
        excerpt:
          "Wordpress is the most popular CMS on the market, powering 65.2% of websites whose CMS we know. That translates to 42.4% of all websites – nearly half of the internet. It is a popular option for those who want to build a website or blog.",
        icon: "wordpress.png",
        route: DashboardRoutes.Applications.Wordpress,
      },
    ];

    const baseURL = import.meta.env.BASE_URL;
    const searchItem = ref("");
    const filteredCards = computed(() =>
      cards.filter(n => n.title.toLocaleLowerCase().includes(searchItem.value.toLocaleLowerCase())),
    );

    return {
      cards,
      baseURL,
      searchItem,
      filteredCards,
    };
  },
};
</script>

<style scoped>
a {
  text-decoration: none !important;
}

.card-opacity {
  background-color: rgba(125, 227, 200, 0.12);
}
</style>
