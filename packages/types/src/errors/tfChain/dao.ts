import { BaseError } from "../index";

export enum Types {
  NoneValue = 1,
  StorageOverflow,
  FarmNotExists,
  NotCouncilMember,
  WrongProposalLength,
  DuplicateProposal,
  NotAuthorizedToVote,
  ProposalMissing,
  WrongIndex,
  DuplicateVote,
  DuplicateVeto,
  WrongProposalWeight,
  TooEarly,
  TimeLimitReached,
  OngoingVoteAndTresholdStillNotMet,
  FarmHasNoNodes,
  InvalidProposalDuration,
}

export class NoneValue extends BaseError {
  constructor(message: string) {
    super(Types.NoneValue, message);
  }
}

export class StorageOverflow extends BaseError {
  constructor(message: string) {
    super(Types.StorageOverflow, message);
  }
}

export class FarmNotExists extends BaseError {
  constructor(message: string) {
    super(Types.FarmNotExists, message);
  }
}

export class NotCouncilMember extends BaseError {
  constructor(message: string) {
    super(Types.NotCouncilMember, message);
  }
}

export class WrongProposalLength extends BaseError {
  constructor(message: string) {
    super(Types.WrongProposalLength, message);
  }
}

export class DuplicateProposal extends BaseError {
  constructor(message: string) {
    super(Types.DuplicateProposal, message);
  }
}

export class NotAuthorizedToVote extends BaseError {
  constructor(message: string) {
    super(Types.NotAuthorizedToVote, message);
  }
}

export class ProposalMissing extends BaseError {
  constructor(message: string) {
    super(Types.ProposalMissing, message);
  }
}

export class WrongIndex extends BaseError {
  constructor(message: string) {
    super(Types.WrongIndex, message);
  }
}

export class DuplicateVote extends BaseError {
  constructor(message: string) {
    super(Types.DuplicateVote, message);
  }
}

export class DuplicateVeto extends BaseError {
  constructor(message: string) {
    super(Types.DuplicateVeto, message);
  }
}

export class WrongProposalWeight extends BaseError {
  constructor(message: string) {
    super(Types.WrongProposalWeight, message);
  }
}

export class TooEarly extends BaseError {
  constructor(message: string) {
    super(Types.TooEarly, message);
  }
}

export class TimeLimitReached extends BaseError {
  constructor(message: string) {
    super(Types.TimeLimitReached, message);
  }
}

export class OngoingVoteAndTresholdStillNotMet extends BaseError {
  constructor(message: string) {
    super(Types.OngoingVoteAndTresholdStillNotMet, message);
  }
}

export class FarmHasNoNodes extends BaseError {
  constructor(message: string) {
    super(Types.FarmHasNoNodes, message);
  }
}

export class InvalidProposalDuration extends BaseError {
  constructor(message: string) {
    super(Types.InvalidProposalDuration, message);
  }
}
