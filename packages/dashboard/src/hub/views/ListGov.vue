<template>
  <v-container>
    <v-row justify="space-between" class="my-6">
      <h1>Proposals</h1>
      <v-alert type="error" v-if="error != null">
        {{ error }}
      </v-alert>

      <div style="display: flex">
        <div v-if="tally">
          <h4 class="my-2">Tally Parameters</h4>
          <ul style="list-style: square">
            <li>
              Quorum: <strong>{{ normalize(tally.quorum) }}</strong>
            </li>
            <li>
              Threshold: <strong>{{ normalize(tally.threshold) }}</strong>
            </li>
            <li>
              Veto Threshold:
              <strong>{{ normalize(tally.vetoThreshold) }}</strong>
            </li>
          </ul>
        </div>

        <v-divider vertical class="mx-4" v-if="tally" />

        <div v-if="deposit || voting">
          <div v-if="deposit">
            <h4 class="my-2">Deposit Parameters</h4>
            <ul style="list-style: square">
              <li>
                Min Deposit:
                <strong>
                  {{ deposit.minDeposit[0].amount }}
                  {{ deposit.minDeposit[0].denom }}
                </strong>
              </li>
              <li>
                Max Deposit Period:
                <strong>{{ deposit.maxDepositPeriod }}</strong>
              </li>
            </ul>
          </div>

          <v-divider class="my-2" v-if="deposit && voting" />

          <div v-if="voting">
            <h4 class="my-2">Voting Parameters</h4>
            <ul style="list-style: square">
              <li>
                Voting Period: <strong>{{ voting.votingPeriod }}</strong>
              </li>
            </ul>
          </div>
        </div>

        <v-divider vertical class="mx-4" v-if="deposit || voting" />

        <div class="my-4">
          <ul style="list-style: none">
            <li
              v-for="color in [
                ['#1982b1', 'Yes'],
                ['#e74c3c', 'No'],
                ['#c0392b', 'No With Veto'],
              ]"
              :key="color[0]"
              style="display: flex; align-items: center; margin-bottom: 4px"
            >
              <span
                :style="
                  'display: inline-block; margin-right: 10px;height: 20px; width: 20px; background-color:' + color[0]
                "
              />
              <span>{{ color[1] }}</span>
            </li>
          </ul>
        </div>
      </div>
    </v-row>

    <v-data-table :headers="headers" :items="proposals" :loading="loading">
      <template v-slot:[`item.status`]="{ item }">
        {{ item.status.replace("PROPOSAL_STATUS_", "") }}
      </template>

      <template v-slot:[`item.finalTallyResult`]="{ item }">
        <VoteCircle
          :yes="+item.finalTallyResult.yes"
          :no="+item.finalTallyResult.no"
          :noWithVeto="+item.finalTallyResult.noWithVeto"
        />
      </template>

      <template v-slot:[`item.submitTime`]="{ item }">
        {{ item.submitTime }}
      </template>

      <template v-slot:[`item.type`]="{ item }">
        {{ getType(item.content["@type"]) }}
      </template>

      <template v-slot:[`item.details`]="{ item }">
        <v-btn color="primary" @click="$router.push('/hub/proposal/' + item.proposalId)"> View Details </v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { CosmosGovV1Beta1QueryParamsResponse, CosmosGovV1Beta1QueryProposalsResponse } from "../rest/cosmos";
import { listProposals, parameters, tally } from "../utils/gov";
import { formatUnits } from "ethers/lib/utils";
import VoteCircle from "../components/VoteCircle.vue";

@Component({
  name: "ListGov",
  components: {
    VoteCircle,
  },
})
export default class ListGov extends Vue {
  headers: { text: string; value: string }[] = [
    { text: "ID", value: "proposalId" },
    { text: "Title", value: "content.title" },
    { text: "Type", value: "type" },
    { text: "Status", value: "status" },
    { text: "Votes", value: "finalTallyResult" },
    { text: "Submitted", value: "submitTime" },
    { text: "Details", value: "details" },
  ];

  proposals: CosmosGovV1Beta1QueryProposalsResponse["proposals"] = [];
  loading = false;

  // params
  tally: CosmosGovV1Beta1QueryParamsResponse["tallyParams"] | null = null;
  deposit: any | null = null;
  voting: CosmosGovV1Beta1QueryParamsResponse["votingParams"] | null = null;
  error: string | null = null;

  normalize(v?: string): string {
    if (typeof v !== "string") return v as any;

    return +v * 100 + "%";
  }

  async fillPendingProposalsVotes() {
    let proposals = this.proposals || [];
    for (const proposal of proposals) {
      if (proposal.status == "PROPOSAL_STATUS_VOTING_PERIOD") {
        let currentTally = await tally(this.$store.state.hub.config.cosmos_rest, proposal.proposalId || "");
        proposal.finalTallyResult = currentTally.tally;
      }
    }
  }

  created() {
    this.loading = true;

    parameters(this.$store.state.hub.config.cosmos_rest)
      .then(res => {
        this.tally = res.tallyParams!;
        this.deposit = res.depositParams!;
        this.deposit.minDeposit[0].amount = formatUnits(
          this.deposit.minDeposit[0].amount,
          this.$store.state.hub.config.tft_decimals,
        );
        this.voting = res.votingParams!;
      })
      .catch((err: any) => {
        this.error = "Couldn't get voting parameters (refresh to try again): " + err.message;
      });

    listProposals(this.$store.state.hub.config.cosmos_rest)
      .then((res: CosmosGovV1Beta1QueryProposalsResponse) => {
        this.proposals = res.proposals;
        this.fillPendingProposalsVotes();
      })
      .catch(err => {
        this.error = "Couldn't list proposals (refresh to try again): " + err.message;
      })
      .finally(() => {
        this.loading = false;
      });
  }

  getType(type: string): string {
    const parts = type.split(".");
    return parts[parts.length - 1].replace("Proposal", "");
  }
}
</script>

<style scoped>
ul {
  font-size: 0.9rem;
}
</style>
