import { BaseError } from "../base_error";
import { ErrorModules } from "../modules";

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
  constructor(name: string, code: number, message: string) {
    super(name, code, message, ErrorModules.Dao);
  }
}
export class NoneValue extends DaoError {
  constructor(message: string) {
    super("NoneValue", Errors.NoneValue, message);
  }
}

export class StorageOverflow extends DaoError {
  constructor(message: string) {
    super("StorageOverflow", Errors.StorageOverflow, message);
  }
}

export class FarmNotExists extends DaoError {
  constructor(message: string) {
    super("FarmNotExists", Errors.FarmNotExists, message);
  }
}

export class NotCouncilMember extends DaoError {
  constructor(message: string) {
    super("NotCouncilMember", Errors.NotCouncilMember, message);
  }
}

export class WrongProposalLength extends DaoError {
  constructor(message: string) {
    super("WrongProposalLength", Errors.WrongProposalLength, message);
  }
}

export class DuplicateProposal extends DaoError {
  constructor(message: string) {
    super("DuplicateProposal", Errors.DuplicateProposal, message);
  }
}

export class NotAuthorizedToVote extends DaoError {
  constructor(message: string) {
    super("NotAuthorizedToVote", Errors.NotAuthorizedToVote, message);
  }
}

export class ProposalMissing extends DaoError {
  constructor(message: string) {
    super("ProposalMissing", Errors.ProposalMissing, message);
  }
}

export class WrongIndex extends DaoError {
  constructor(message: string) {
    super("WrongIndex", Errors.WrongIndex, message);
  }
}

export class DuplicateVote extends DaoError {
  constructor(message: string) {
    super("DuplicateVote", Errors.DuplicateVote, message);
  }
}

export class DuplicateVeto extends DaoError {
  constructor(message: string) {
    super("DuplicateVeto", Errors.DuplicateVeto, message);
  }
}

export class WrongProposalWeight extends DaoError {
  constructor(message: string) {
    super("WrongProposalWeight", Errors.WrongProposalWeight, message);
  }
}

export class TooEarly extends DaoError {
  constructor(message: string) {
    super("TooEarly", Errors.TooEarly, message);
  }
}

export class TimeLimitReached extends DaoError {
  constructor(message: string) {
    super("TimeLimitReached", Errors.TimeLimitReached, message);
  }
}

export class OngoingVoteAndTresholdStillNotMet extends DaoError {
  constructor(message: string) {
    super("OngoingVoteAndTresholdStillNotMet", Errors.OngoingVoteAndTresholdStillNotMet, message);
  }
}

export class FarmHasNoNodes extends DaoError {
  constructor(message: string) {
    super("FarmHasNoNodes", Errors.FarmHasNoNodes, message);
  }
}

export class InvalidProposalDuration extends DaoError {
  constructor(message: string) {
    super("InvalidProposalDuration", Errors.InvalidProposalDuration, message);
  }
}
