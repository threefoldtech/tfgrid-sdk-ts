import { BaseError } from "../base_error";

export enum Errors {
  NoneValue,
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

class DaoError extends BaseError {
  constructor(code: number, message: string) {
    super(code, message, "dao");
  }
}
export class NoneValue extends DaoError {
  constructor(message: string) {
    super(Errors.NoneValue, message);
  }
}

export class StorageOverflow extends DaoError {
  constructor(message: string) {
    super(Errors.StorageOverflow, message);
  }
}

export class FarmNotExists extends DaoError {
  constructor(message: string) {
    super(Errors.FarmNotExists, message);
  }
}

export class NotCouncilMember extends DaoError {
  constructor(message: string) {
    super(Errors.NotCouncilMember, message);
  }
}

export class WrongProposalLength extends DaoError {
  constructor(message: string) {
    super(Errors.WrongProposalLength, message);
  }
}

export class DuplicateProposal extends DaoError {
  constructor(message: string) {
    super(Errors.DuplicateProposal, message);
  }
}

export class NotAuthorizedToVote extends DaoError {
  constructor(message: string) {
    super(Errors.NotAuthorizedToVote, message);
  }
}

export class ProposalMissing extends DaoError {
  constructor(message: string) {
    super(Errors.ProposalMissing, message);
  }
}

export class WrongIndex extends DaoError {
  constructor(message: string) {
    super(Errors.WrongIndex, message);
  }
}

export class DuplicateVote extends DaoError {
  constructor(message: string) {
    super(Errors.DuplicateVote, message);
  }
}

export class DuplicateVeto extends DaoError {
  constructor(message: string) {
    super(Errors.DuplicateVeto, message);
  }
}

export class WrongProposalWeight extends DaoError {
  constructor(message: string) {
    super(Errors.WrongProposalWeight, message);
  }
}

export class TooEarly extends DaoError {
  constructor(message: string) {
    super(Errors.TooEarly, message);
  }
}

export class TimeLimitReached extends DaoError {
  constructor(message: string) {
    super(Errors.TimeLimitReached, message);
  }
}

export class OngoingVoteAndTresholdStillNotMet extends DaoError {
  constructor(message: string) {
    super(Errors.OngoingVoteAndTresholdStillNotMet, message);
  }
}

export class FarmHasNoNodes extends DaoError {
  constructor(message: string) {
    super(Errors.FarmHasNoNodes, message);
  }
}

export class InvalidProposalDuration extends DaoError {
  constructor(message: string) {
    super(Errors.InvalidProposalDuration, message);
  }
}
