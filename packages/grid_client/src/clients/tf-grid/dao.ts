import { Dao, DaoVoteOptions, Proposals } from "@threefold/tfchain_client";

class TFDao extends Dao {
  async get(): Promise<Proposals> {
    const proposals = await super.get();
    return proposals;
  }

  async vote(options: DaoVoteOptions) {
    return await super.vote(options);
  }
}

export { TFDao };
