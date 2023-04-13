<template>
  <v-container>
    <v-row
      justify="center"
      v-if="!proposal"
    >
      <v-progress-circular indeterminate />
    </v-row>
    <div v-if="proposal">
      <v-row
        class="mb-2"
        justify="space-between"
        align="center"
      >
        <h1 class="my-6">{{ proposal.content.title }} #{{ proposal.proposalId }}</h1>
        <v-btn
          v-if="proposal.status === 'PROPOSAL_STATUS_DEPOSIT_PERIOD'"
          color="primary"
          @click="$router.push('/proposal/deposit/' + proposal.proposalId)"
        >
          Deposit
        </v-btn>
      </v-row>

      <div
        style="display: flex"
        v-if="proposal.status !== 'PROPOSAL_STATUS_DEPOSIT_PERIOD'"
      >
        <v-card
          v-for="item of [
            { label: 'YES', symbol: 'yes', color: 'primary' },
            { label: 'NO', symbol: 'no', color: 'red' },
            { label: 'ABSTAIN', symbol: 'abstain', color: 'grey' },
            { label: 'NO (VETO)', symbol: 'noWithVeto', color: '#c40404' },
          ]"
          :key="item.symbol"
          :color="item.color"
          dark
          style="min-width: 150px"
          class="mr-2"
        >
          <v-list-item three-line>
            <v-list-item-content>
              <div class="text-overline">{{ item.label }}</div>
              <v-list-item-title class="text-h5 mt-1 mb-1">
                {{
                  totalVotes
                    ? (proposal.finalTallyResult[item.symbol] * 100) /
                      totalVotes
                    : 0
                }}%
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ proposal.finalTallyResult[item.symbol] }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-card>

        <v-card
          style="width: 100%"
          dark
          v-if="bondedTokens"
        >
          <v-list-item three-line>
            <v-list-item-content>
              <div class="text-overline">Percent Voted</div>
              <v-list-item-title class="text-h5 mt-1 mb-1">
                <v-progress-linear
                  :value="(totalVotes * 100) / +bondedTokens"
                  :height="30"
                >
                  {{ totalVotes }} / {{ bondedTokens }}
                </v-progress-linear>
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-card>
      </div>

      <h3 class="mt-6">Total Deposit</h3>
      <p>
        {{ proposal.totalDeposit.length ? proposal.totalDeposit[0].amount : 0 }}
        <strong>
          {{
            proposal.totalDeposit.length ? proposal.totalDeposit[0].denom : ""
          }}</strong>
      </p>

      <h3 class="mt-6">Description</h3>
      <p v-html="getDescription()" />

      <div v-if="proposal.content['@type'].indexOf('SoftwareUpgrade') > -1">
        <v-divider class="mb-2" />
        <p class="mb-0"><strong>Name:</strong> {{ proposal.content.plan.name }}</p>
        <p class="mb-0"><strong>Height:</strong> {{ proposal.content.plan.height }}</p>
        <p class="mb-0">
          <strong>info:</strong>
        <ul>
          <li
            v-for="(u, i) in normalizeInfo(proposal.content.plan.info)"
            :key="i"
          >
            <strong>{{ u[0] }}:</strong> {{  u[1] }}
          </li>
        </ul>
        </p>
      </div>

      <div v-if="proposal.status === 'PROPOSAL_STATUS_VOTING_PERIOD'">
        <h2>Vote</h2>
        <v-btn
          v-for="action in actions"
          :key="action.label"
          :color="action.color"
          class="mr-2"
          @click="onSubmitVote(action)"
          :disabled="!!loading"
          :loading="loading === action.value"
        >
          {{ action.label }}
        </v-btn>
      </div>

      <CustomAlert
        :loading="!!loading"
        :result="result"
        :error="error"
      />
    </div>
  </v-container>
</template>

<script lang="ts">
import { VoteOption } from "../types/cosmos/gov/v1beta1/gov";
import { submitVote, getProposal } from "../utils/gov";
import { Component, Vue } from "vue-property-decorator";
import { marked } from "marked";
import CustomAlert from "../components/CustomAlert.vue";
import { pool } from "../utils/staking";
import { formatUnits } from "ethers/lib/utils";

interface IAction {
  label: string;
  color: string;
  value: VoteOption;
}

@Component({
  name: "GovDetails",
  components: {
    CustomAlert,
  },
})
export default class GovDetails extends Vue {
  proposal: any = null;
  bondedTokens: string | null = null;

  loading: VoteOption | null = null;
  result: string | null = null;
  error: string | null = null;

  getDescription() {
    return marked(this.proposal.content.description);
  }

  get totalVotes(): number {
    const { yes, no, abstain, noWithVeto } = this.proposal.finalTallyResult;
    return +yes + +no + +abstain + +noWithVeto;
  }

  actions: IAction[] = [
    {
      label: "Yes",
      color: "green",
      value: VoteOption.VOTE_OPTION_YES,
    },
    { label: "No", color: "red", value: VoteOption.VOTE_OPTION_NO },
    {
      label: "Abstain",
      color: "grey",
      value: VoteOption.VOTE_OPTION_ABSTAIN,
    },
    {
      label: "No With Veto",
      color: "",
      value: VoteOption.VOTE_OPTION_NO_WITH_VETO,
    },
  ];

  created() {
    this.loading = 1;
    getProposal(this.$store.state.hub.config.cosmos_rest, this.$route.params.id)
      .then((proposal) => {
        this.proposal = proposal.proposal;
        this.proposal.totalDeposit[0].amount = formatUnits(
          this.proposal.totalDeposit[0].amount,
          this.$store.state.hub.config.tft_decimals
        );
        this.proposal.finalTallyResult.yes = formatUnits(
          this.proposal.finalTallyResult.yes,
          this.$store.state.hub.config.tft_decimals
        );
        this.proposal.finalTallyResult.no = formatUnits(
          this.proposal.finalTallyResult.no,
          this.$store.state.hub.config.tft_decimals
        );
        this.proposal.finalTallyResult.noWithVeto = formatUnits(
          this.proposal.finalTallyResult.noWithVeto,
          this.$store.state.hub.config.tft_decimals
        );
        this.proposal.finalTallyResult.abstain = formatUnits(
          this.proposal.finalTallyResult.abstain,
          this.$store.state.hub.config.tft_decimals
        );
      })
      .catch((err) => {
        this.error =
          "Couldn't get proposal info (refresh to try again): " + err.message;
      })
      .finally(() => {
        this.loading = null;
      });

    pool(this.$store.state.hub.config.cosmos_rest)
      .then((res: any) => {
        this.bondedTokens = formatUnits(
          res.pool.bondedTokens!,
          this.$store.state.hub.config.tft_decimals
        );
      })
      .catch((err) => {
        this.error =
          "Couldn't get total vonded tokens (refresh to try again): " +
          err.message;
      });
  }

  onSubmitVote(action: IAction) {
    const vote = confirm(
      `Are your sure you want to vote \`${action.label}\` for proposal(${this.proposal.proposalId})?`
    );

    if (!vote) return;

    this.loading = action.value;
    this.result = null;
    this.error = null;

    submitVote(
      this.$store.state.hub.config.tendermint_rpc,
      this.$store.state.hub.config.cosmos_rest,
      this.$store.state.hub.config.gas_price,
      this.$store.state.hub.config.chain_id,
      this.proposal.proposalId,
      action.value
    )
      .then(() => {
        this.result = `Successfully voted with '${action.label}'.`;
      })
      .catch((err) => {
        this.error = err.message;
      })
      .finally(() => {
        this.loading = null;
      });
  }

  normalizeInfo(info: string): Array<[string, string]> {
    return Object.entries(JSON.parse(info));
  }
}
</script>
