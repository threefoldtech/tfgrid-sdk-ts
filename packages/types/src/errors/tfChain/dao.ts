import { BaseError } from "../base_error";

export enum Errors {
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
    super(Errors.NoneValue, message);
  }
}

export class StorageOverflow extends BaseError {
  constructor(message: string) {
    super(Errors.StorageOverflow, message);
  }
}

export class FarmNotExists extends BaseError {
  constructor(message: string) {
    super(Errors.FarmNotExists, message);
  }
}

export class NotCouncilMember extends BaseError {
  constructor(message: string) {
    super(Errors.NotCouncilMember, message);
  }
}

export class WrongProposalLength extends BaseError {
  constructor(message: string) {
    super(Errors.WrongProposalLength, message);
  }
}

export class DuplicateProposal extends BaseError {
  constructor(message: string) {
    super(Errors.DuplicateProposal, message);
  }
}

export class NotAuthorizedToVote extends BaseError {
  constructor(message: string) {
    super(Errors.NotAuthorizedToVote, message);
  }
}

export class ProposalMissing extends BaseError {
  constructor(message: string) {
    super(Errors.ProposalMissing, message);
  }
}

export class WrongIndex extends BaseError {
  constructor(message: string) {
    super(Errors.WrongIndex, message);
  }
}

export class DuplicateVote extends BaseError {
  constructor(message: string) {
    super(Errors.DuplicateVote, message);
  }
}

export class DuplicateVeto extends BaseError {
  constructor(message: string) {
    super(Errors.DuplicateVeto, message);
  }
}

export class WrongProposalWeight extends BaseError {
  constructor(message: string) {
    super(Errors.WrongProposalWeight, message);
  }
}

export class TooEarly extends BaseError {
  constructor(message: string) {
    super(Errors.TooEarly, message);
  }
}

export class TimeLimitReached extends BaseError {
  constructor(message: string) {
    super(Errors.TimeLimitReached, message);
  }
}

export class OngoingVoteAndTresholdStillNotMet extends BaseError {
  constructor(message: string) {
    super(Errors.OngoingVoteAndTresholdStillNotMet, message);
  }
}

export class FarmHasNoNodes extends BaseError {
  constructor(message: string) {
    super(Errors.FarmHasNoNodes, message);
  }
}

export class InvalidProposalDuration extends BaseError {
  constructor(message: string) {
    super(Errors.InvalidProposalDuration, message);
  }
}
