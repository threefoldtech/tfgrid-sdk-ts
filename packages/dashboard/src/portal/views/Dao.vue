<template>
  <v-container fluid>
    <v-skeleton-loader :loading="loadingProposals" max-width="100%" type="image">
      <v-container v-if="!proposals.active.length && !proposals.inactive.length">
        <v-card class="my-3 pa-3 d-flex justify-center">
          <h3 v-if="!loadingProposals">No proposals at this time</h3>
        </v-card>
      </v-container>
      <v-container v-else>
        <v-card>
          <v-toolbar flat color="dark">
            <v-container>
              <v-row class="d-flex justify-center">
                <h2 v-if="!proposals.active.length">No Active proposals at this time</h2>
                <h2 v-else>{{ $store.state.credentials.account.meta.name }}, you can now vote on proposals!</h2>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon dark right v-bind="attrs" v-on="on" @click="openInfoModal = true">
                      mdi-information-outline
                    </v-icon>
                  </template>
                  <span> Click for more info </span>
                </v-tooltip>
              </v-row>
            </v-container>

            <template v-slot:extension>
              <v-tabs v-model="tabSelected" centered>
                <v-tab v-for="(tab, i) in tabs" :key="i" :href="`#tab-${i}`">
                  {{ tab.title }}
                </v-tab>
              </v-tabs>
            </template>
          </v-toolbar>
          <v-tabs-items v-model="tabSelected">
            <v-tab-item v-for="(tab, i) in tabs" :key="i" :value="`tab-${i}`">
              <v-container>
                <v-text-field
                  v-model="searchTerm"
                  color="primary darken-2"
                  label="Search by proposal action or description"
                ></v-text-field>

                <v-card class="my-3 pa-3" outlined v-for="(proposal, i) in filteredProposals(tab.content)" :key="i">
                  <v-card-title class="pa-3 mb-2">
                    {{ proposal.action.toUpperCase() }}
                  </v-card-title>
                  <v-card-subtitle class="pb-0">
                    <p class="font-weight-bold">
                      Proposal hash: <span class="text--secondary">{{ proposal.hash }}</span>
                    </p>
                  </v-card-subtitle>
                  <v-card-text class="pb-0">
                    <p class="font-weight-bold">
                      Description:
                      <span class="text--secondary">
                        {{ proposal.description }}
                        <a v-bind:href="proposal.link" v-bind:target="'blank'">More details</a>
                      </span>
                    </p>
                    <p class="font-weight-bold" v-if="proposal.end > Date.now()">
                      You can vote until:
                      <span class="text--secondary">{{ proposal.end }}</span>
                    </p>
                    <p class="font-weight-bold" v-else>
                      Voting ended on: <span class="text--secondary">{{ proposal.end }}</span>
                    </p>
                  </v-card-text>
                  <v-container class="votes">
                    <div v-if="proposal.end > Date.now()" class="d-flex justify-space-between my-3 mx-8">
                      <v-btn color="primary" @click="openVoteDialog(proposal.hash, true)" :disabled="loadingVote"
                        >Yes <v-divider class="mx-3" vertical />{{ proposal.ayes.length }}
                      </v-btn>
                      <div class="d-flex align-center text-center pr-2">
                        <v-divider vertical />
                        <span class="px-1"
                          >Threshold: <br />{{ proposal.nayes.length + proposal.ayes.length }}/{{ proposal.threshold }}
                        </span>
                        <v-divider vertical />
                      </div>
                      <v-btn
                        color="grey lighten-2 black--text"
                        @click="openVoteDialog(proposal.hash, false)"
                        :disabled="loadingVote"
                        >No <v-divider class="mx-3" vertical />{{ proposal.nayes.length }}
                      </v-btn>
                    </div>
                    <v-container class="px-12" v-if="proposal.ayesProgress > 0 || proposal.nayesProgress > 0">
                      <v-row justify="center" class="pt-4">
                        <v-progress-linear
                          rounded
                          :value="proposal.ayesProgress"
                          height="20"
                          :style="{
                            width: proposal.ayesProgress + '%',
                            marginRight: 'auto',
                            backgroundColor: '#1982b1',
                            color: '#fff',
                          }"
                        >
                          <template>
                            <strong v-if="proposal.ayesProgress >= 20"
                              >{{
                                !!(proposal.ayesProgress % 1)
                                  ? proposal.ayesProgress.toFixed(2)
                                  : proposal.ayesProgress
                              }}%</strong
                            >
                          </template>
                        </v-progress-linear>
                        <v-progress-linear
                          rounded
                          :value="proposal.nayesProgress"
                          color="grey lighten-2"
                          backgroundColor="#e0e0e0"
                          height="20"
                          :style="{
                            width: proposal.nayesProgress + '%',
                            marginRight: 'auto',
                            color: '#333',
                          }"
                        >
                          <template>
                            <strong v-if="proposal.nayesProgress >= 20"
                              >{{
                                !!(proposal.nayesProgress % 1)
                                  ? proposal.nayesProgress.toFixed(2)
                                  : proposal.nayesProgress
                              }}%</strong
                            >
                          </template>
                        </v-progress-linear>
                      </v-row>
                    </v-container>
                  </v-container>
                </v-card>

                <v-dialog v-model="openVDialog" max-width="600">
                  <v-card>
                    <v-card-title>Cast Vote</v-card-title>
                    <v-card-text>
                      <v-form v-model="isValidFarm">
                        <v-select
                          :items="farms"
                          label="Select a farm"
                          outlined
                          item-text="name"
                          item-value="id"
                          v-model="selectedFarm"
                          :rules="rules.select"
                        >
                        </v-select>
                      </v-form>
                    </v-card-text>
                    <v-card-actions class="justify-end">
                      <v-btn
                        @click="castVote"
                        :loading="loadingVote"
                        color="primary white--text"
                        :disabled="!isValidFarm"
                        >Submit</v-btn
                      >
                      <v-btn @click="openVDialog = false" color="grey lighten-2 black--text">Close</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-container>
            </v-tab-item>
          </v-tabs-items>
        </v-card>
        <v-dialog v-model="openInfoModal" width="50vw">
          <v-card class="card">
            <v-card-title class="text-h5"> Proposals information </v-card-title>

            <v-card-text>
              <div class="textContainer">
                <h2>General</h2>
                <span>A proposal can be created by one of the council members of tfchain.</span>
                <span> Once a proposal has reached it's timelimit, voting stops and a proposal can be closed.</span>
                <span>
                  A proposal is either approved or dissapproved based on the majority of the weights of yes / no votes
                  (50%).</span
                >
                <span>
                  A minimal participation threshold must be met. If there are not enough votes and the timelimit is
                  reached, the proposal is dissapproved.</span
                >
                <br />
                <h2>How do we count weight:</h2>
                <span
                  >Votes are weighted based on the farmers stake in the network. One vote by default is 1 weight.</span
                >
                <span> If the farmers has nodes, the weight of the vote is calulcated as following:</span>
                <ul>
                  <li>Sum of all nodes of the farmer: (node CU * 2 + node SU)</li>
                </ul>
              </div>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text @click="openInfoModal = false"> Close </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </v-skeleton-loader>
  </v-container>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { getProposals, vote, proposalInterface } from "../lib/dao";
import { getFarm, getNodesByFarm } from "../lib/farms";
@Component({
  name: "Dao",
})
export default class DaoView extends Vue {
  openInfoModal = false;
  activeProposals: proposalInterface[] = [];
  inactiveProposals: proposalInterface[] = [];
  $api: any;
  proposals: { active: proposalInterface[]; inactive: proposalInterface[] } = {
    active: [],
    inactive: [],
  };
  percentageVoted = 0;
  openVDialog = false;
  selectedFarm = "";
  farms: any[] = [];
  vote = false;
  loadingVote = false;
  selectedProposal = "";
  searchTerm = "";
  tabSelected = "tab-0";
  tabs = [
    { title: "Active", content: this.activeProposals },
    { title: "Archived", content: this.inactiveProposals },
  ];
  isValidFarm = false;
  rules = {
    select: [(v: string) => !!v || "required field"],
  };
  loadingProposals = false;

  async mounted() {
    if (this.$api) {
      this.loadingProposals = true;
      this.proposals = await getProposals(this.$api);
      this.activeProposals = this.proposals.active;
      this.inactiveProposals = this.proposals.inactive;
      this.tabs = [
        { title: "Active", content: this.activeProposals },
        { title: "Executable", content: this.inactiveProposals },
      ];
      this.farms = await getFarm(this.$api, parseFloat(`${this.$store.state.credentials.twin.id}`));
      this.loadingProposals = false;
    } else {
      this.$router.push({
        name: "accounts",
        path: "/",
      });
    }
  }

  unmounted() {
    this.$store.commit("UNSET_CREDENTIALS");
  }

  filteredProposals(selectedProposals: any) {
    if (this.searchTerm.length) {
      return selectedProposals.filter(
        (proposal: { action: string; description: string }) =>
          proposal.action.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          proposal.description.toLowerCase().includes(this.searchTerm.toLowerCase()),
      );
    }
    return selectedProposals;
  }
  openVoteDialog(hash: any, vote: boolean) {
    this.openVDialog = true;
    this.vote = vote;
    this.selectedProposal = hash;
  }
  async castVote() {
    const nodes = await getNodesByFarm(this.selectedFarm);
    if (!nodes.length) {
      this.$toasted.show(`Farm has no nodes`);
      return;
    }
    this.loadingVote = true;
    vote(
      this.$route.params.accountID,
      this.$api,
      this.selectedFarm,
      this.selectedProposal,
      this.vote,
      (res: { events?: never[] | undefined; status: any }) => {
        console.log(res);
        if (res instanceof Error) {
          console.log(res);
          return;
        }
        const { events = [], status } = res;
        console.log(`Current status is ${status.type}`);
        switch (status.type) {
          case "Ready":
            this.$toasted.show(`Transaction submitted`);
        }
        if (status.isFinalized) {
          console.log(`Transaction included at blockHash ${status.asFinalized}`);
          if (!events.length) {
            this.$toasted.show("Vote failed");
            this.loadingVote = false;
            this.openVDialog = false;
          } else {
            // Loop through Vec<EventRecord> to display all events
            events.forEach(({ phase, event: { data, method, section } }) => {
              console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
              if (section === "dao" && method === "Voted") {
                this.$toasted.show("Voted for proposal!");
                this.loadingVote = false;
                this.openVDialog = false;
                getProposals(this.$api).then(proposals => {
                  this.proposals = proposals;
                  this.tabs = [
                    { title: "Active", content: proposals.active },
                    { title: "Archived", content: proposals.inactive },
                  ];
                });
              } else if (section === "system" && method === "ExtrinsicFailed") {
                this.$toasted.show("Vote failed");
                this.loadingVote = false;
                this.openVDialog = false;
              }
            });
          }
        }
      },
    ).catch(err => {
      this.$toasted.show(err.message);
      this.loadingVote = false;
      this.openVDialog = false;
    });
  }
}
</script>
<style scoped>
.chart {
  width: 50%;
}

.votes {
  width: 75%;
}
</style>
