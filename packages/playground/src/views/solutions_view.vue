<template>
  <view-layout>
    <v-card color="primary" class="d-flex justify-center items-center mb-4 pa-3 text-center">
      <v-icon size="30" class="pr-3">mdi-lightbulb-on-outline</v-icon>
      <v-card-title class="pa-0">Labs</v-card-title>
    </v-card>
    <v-text-field label="Search for a lab" v-model="searchItem" class="mb-5" clearable></v-text-field>
    <p v-if="filteredAppCards.length === 0 && filteredOrchCards.length === 0" class="mx-3 mb-3">
      No solution was found with the provided search query.
    </p>

    <v-card class="my-5" variant="text" v-if="filteredOrchCards.length > 0"
      ><v-card-title
        class="mb-2"
        :style="{
          fontSize: '1.25rem',
        }"
        >Orchestrators</v-card-title
      >
      <ApplicationCards :cards="filteredOrchCards" />
    </v-card>
    <v-divider class="my-4" v-if="filteredAppCards.length && filteredOrchCards.length"></v-divider>
    <v-card class="my-5" variant="text" v-if="filteredAppCards.length > 0"
      ><v-card-title
        class="mb-2"
        :style="{
          fontSize: '1.25rem',
        }"
        >Applications</v-card-title
      >
      <ApplicationCards :cards="filteredAppCards" />
    </v-card>
  </view-layout>
</template>

<script lang="ts">
import { computed, ref } from "vue";

import ApplicationCards from "@/components/applications/ApplicationCards.vue";
import { DashboardRoutes } from "@/router/routes";
import type { ApplicationCard } from "@/utils/types";

export default {
  name: "SolutionsView",
  components: {
    ApplicationCards,
  },
  setup() {
    let orch_cards: ApplicationCard[] = [
      {
        title: "Kubernetes",
        excerpt:
          "Kubernetes is the standard container orchestration tool. On the TF grid, Kubernetes clusters can be deployed out of the box. We have implemented K3S, a full-blown Kubernetes offering that uses only half of the memory footprint.",
        icon: "kubernetes.png",
        route: DashboardRoutes.Applications.Kubernetes,
      },
      {
        title: "CapRover",
        excerpt:
          "CapRover is an extremely easy to use app/database deployment & web server manager for your NodeJS, Python, PHP, ASP.NET, Ruby, MySQL, MongoDB, Postgres, WordPress (and etc…) applications!",
        icon: "caprover.png",
        route: DashboardRoutes.Applications.CapRover,
      },
    ];
    let app_cards: ApplicationCard[] = [
      {
        title: "Nostr",
        excerpt:
          "Nostr is a simple, open protocol that enables global, decentralized, and censorship-resistant social media.",
        icon: "nostr.png",
        route: DashboardRoutes.Applications.Nostr,
        releaseDate: new Date("2024-11-13"),
      },
      {
        title: "Gitea",
        excerpt:
          "Gitea is a forge software package for hosting software development version control using Git as well as other collaborative features like bug tracking, code review, continuous integration, kanban boards, tickets, and wikis. It supports self-hosting but also provides a free public first-party instance.",
        icon: "gitea.png",
        route: DashboardRoutes.Applications.Gitea,
        releaseDate: new Date("2024-11-13"),
      },
      {
        title: "TFRobot",
        excerpt:
          "TFRobot is a command line interface tool that offers simultaneous mass deployment of groups of VMs on the ThreeFold Grid, with support of multiple retries for failed deployments, and customizable configurations.",
        icon: "tfrobot.png",
        route: DashboardRoutes.Applications.TFRobot,
        releaseDate: new Date("2024-11-13"),
      },
      {
        title: "Jenkins",
        excerpt:
          "Jenkins is a popular open-source automation server that enables developers to build, test, and deploy their applications continuously.",
        icon: "jenkins.png",
        route: DashboardRoutes.Applications.Jenkins,
        releaseDate: new Date("2024-11-13"),
      },
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
        releaseDate: new Date("2024-11-13"),
      },
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
      {
        title: "Wordpress",
        excerpt:
          "Wordpress is the most popular CMS on the market, powering 65.2% of websites whose CMS we know. That translates to 42.4% of all websites – nearly half of the internet. It is a popular option for those who want to build a website or blog.",
        icon: "wordpress.png",
        route: DashboardRoutes.Applications.Wordpress,
      },
      {
        title: "Jitsi",
        excerpt:
          "Jitsi Meet is a set of Open Source projects which empower users to use and deploy video conferencing platforms with state-of-the-art video quality and features.",
        icon: "jitsi.png",
        route: DashboardRoutes.Applications.Jitsi,
        releaseDate: new Date("2024-11-13"),
      },
    ];
    app_cards = app_cards.sort((a, b) => a.title.localeCompare(b.title));
    orch_cards = orch_cards.sort((a, b) => a.title.localeCompare(b.title));
    const searchItem = ref("");
    const filteredAppCards = computed(() =>
      app_cards.filter(n => n.title.toLocaleLowerCase().includes(searchItem.value.toLocaleLowerCase())),
    );
    const filteredOrchCards = computed(() =>
      orch_cards.filter(n => n.title.toLocaleLowerCase().includes(searchItem.value.toLocaleLowerCase())),
    );

    return {
      app_cards,
      orch_cards,
      searchItem,
      filteredAppCards,
      filteredOrchCards,
    };
  },
};
</script>
