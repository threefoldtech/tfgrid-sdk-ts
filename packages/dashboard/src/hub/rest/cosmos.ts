/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/**
* Grant gives permissions to execute
the provide method with expiration time.
*/
export interface CosmosAuthzV1Beta1Grant {
  /**
   * `Any` contains an arbitrary serialized protocol buffer message along with a
   * URL that describes the type of the serialized message.
   *
   * Protobuf library provides support to pack/unpack Any values in the form
   * of utility functions or additional generated methods of the Any type.
   * Example 1: Pack and unpack a message in C++.
   *     Foo foo = ...;
   *     Any any;
   *     any.PackFrom(foo);
   *     ...
   *     if (any.UnpackTo(&foo)) {
   *       ...
   *     }
   * Example 2: Pack and unpack a message in Java.
   *     Any any = Any.pack(foo);
   *     if (any.is(Foo.class)) {
   *       foo = any.unpack(Foo.class);
   *  Example 3: Pack and unpack a message in Python.
   *     foo = Foo(...)
   *     any = Any()
   *     any.Pack(foo)
   *     if any.Is(Foo.DESCRIPTOR):
   *       any.Unpack(foo)
   *  Example 4: Pack and unpack a message in Go
   *      foo := &pb.Foo{...}
   *      any, err := anypb.New(foo)
   *      if err != nil {
   *        ...
   *      }
   *      ...
   *      foo := &pb.Foo{}
   *      if err := any.UnmarshalTo(foo); err != nil {
   * The pack methods provided by protobuf library will by default use
   * 'type.googleapis.com/full.type.name' as the type URL and the unpack
   * methods only use the fully qualified type name after the last '/'
   * in the type URL, for example "foo.bar.com/x/y.z" will yield type
   * name "y.z".
   * JSON
   * ====
   * The JSON representation of an `Any` value uses the regular
   * representation of the deserialized, embedded message, with an
   * additional field `@type` which contains the type URL. Example:
   *     package google.profile;
   *     message Person {
   *       string first_name = 1;
   *       string last_name = 2;
   *     {
   *       "@type": "type.googleapis.com/google.profile.Person",
   *       "firstName": <string>,
   *       "lastName": <string>
   * If the embedded message type is well-known and has a custom JSON
   * representation, that representation will be embedded adding a field
   * `value` which holds the custom JSON in addition to the `@type`
   * field. Example (for message [google.protobuf.Duration][]):
   *       "@type": "type.googleapis.com/google.protobuf.Duration",
   *       "value": "1.212s"
   */
  authorization?: { "@type"?: string };

  /** @format date-time */
  expiration?: string;
}

/**
 * MsgExecResponse defines the Msg/MsgExecResponse response type.
 */
export interface CosmosAuthzV1Beta1MsgExecResponse {
  results?: string[];
}

/**
 * MsgGrantResponse defines the Msg/MsgGrant response type.
 */
export type CosmosAuthzV1Beta1MsgGrantResponse = object;

/**
 * MsgRevokeResponse defines the Msg/MsgRevokeResponse response type.
 */
export type CosmosAuthzV1Beta1MsgRevokeResponse = object;

/**
 * QueryGrantsResponse is the response type for the Query/Authorizations RPC method.
 */
export interface CosmosAuthzV1Beta1QueryGrantsResponse {
  /** authorizations is a list of grants granted for grantee by granter. */
  grants?: { authorization?: { "@type"?: string }; expiration?: string }[];

  /** pagination defines an pagination for the response. */
  pagination?: { nextKey?: string; total?: string };
}

/**
* message SomeRequest {
         Foo some_parameter = 1;
         PageRequest pagination = 2;
 }
*/
export interface CosmosBaseQueryV1Beta1PageRequest {
  /**
   * key is a value returned in PageResponse.next_key to begin
   * querying the next page most efficiently. Only one of offset or key
   * should be set.
   * @format byte
   */
  key?: string;

  /**
   * offset is a numeric offset that can be used when key is unavailable.
   * It is less efficient than using key. Only one of offset or key should
   * be set.
   * @format uint64
   */
  offset?: string;

  /**
   * limit is the total number of results to be returned in the result page.
   * If left empty it will default to a value to be set by each app.
   * @format uint64
   */
  limit?: string;

  /**
   * count_total is set to true  to indicate that the result set should include
   * a count of the total number of items available for pagination in UIs.
   * count_total is only respected when offset is used. It is ignored when key
   * is set.
   */
  countTotal?: boolean;

  /**
   * reverse is set to true if results are to be returned in the descending order.
   *
   * Since: cosmos-sdk 0.43
   */
  reverse?: boolean;
}

/**
* PageResponse is to be embedded in gRPC response messages where the
corresponding request message has used PageRequest.

 message SomeResponse {
         repeated Bar results = 1;
         PageResponse page = 2;
 }
*/
export interface CosmosBaseQueryV1Beta1PageResponse {
  /**
   * next_key is the key to be passed to PageRequest.key to
   * query the next page most efficiently
   * @format byte
   */
  nextKey?: string;

  /**
   * total is total number of results available if PageRequest.count_total
   * was set, its value is undefined otherwise
   * @format uint64
   */
  total?: string;
}

/**
* `Any` contains an arbitrary serialized protocol buffer message along with a
URL that describes the type of the serialized message.

Protobuf library provides support to pack/unpack Any values in the form
of utility functions or additional generated methods of the Any type.

Example 1: Pack and unpack a message in C++.

    Foo foo = ...;
    Any any;
    any.PackFrom(foo);
    ...
    if (any.UnpackTo(&foo)) {
      ...
    }

Example 2: Pack and unpack a message in Java.

    Foo foo = ...;
    Any any = Any.pack(foo);
    ...
    if (any.is(Foo.class)) {
      foo = any.unpack(Foo.class);
    }

 Example 3: Pack and unpack a message in Python.

    foo = Foo(...)
    any = Any()
    any.Pack(foo)
    ...
    if any.Is(Foo.DESCRIPTOR):
      any.Unpack(foo)
      ...

 Example 4: Pack and unpack a message in Go

     foo := &pb.Foo{...}
     any, err := anypb.New(foo)
     if err != nil {
       ...
     }
     ...
     foo := &pb.Foo{}
     if err := any.UnmarshalTo(foo); err != nil {
       ...
     }

The pack methods provided by protobuf library will by default use
'type.googleapis.com/full.type.name' as the type URL and the unpack
methods only use the fully qualified type name after the last '/'
in the type URL, for example "foo.bar.com/x/y.z" will yield type
name "y.z".


JSON
====
The JSON representation of an `Any` value uses the regular
representation of the deserialized, embedded message, with an
additional field `@type` which contains the type URL. Example:

    package google.profile;
    message Person {
      string first_name = 1;
      string last_name = 2;
    }

    {
      "@type": "type.googleapis.com/google.profile.Person",
      "firstName": <string>,
      "lastName": <string>
    }

If the embedded message type is well-known and has a custom JSON
representation, that representation will be embedded adding a field
`value` which holds the custom JSON in addition to the `@type`
field. Example (for message [google.protobuf.Duration][]):

    {
      "@type": "type.googleapis.com/google.protobuf.Duration",
      "value": "1.212s"
    }
*/
export interface GoogleProtobufAny {
  /**
   * A URL/resource name that uniquely identifies the type of the serialized
   * protocol buffer message. This string must contain at least
   * one "/" character. The last segment of the URL's path must represent
   * the fully qualified name of the type (as in
   * `path/google.protobuf.Duration`). The name should be in a canonical form
   * (e.g., leading "." is not accepted).
   *
   * In practice, teams usually precompile into the binary all types that they
   * expect it to use in the context of Any. However, for URLs which use the
   * scheme `http`, `https`, or no scheme, one can optionally set up a type
   * server that maps type URLs to message definitions as follows:
   * * If no scheme is provided, `https` is assumed.
   * * An HTTP GET on the URL must yield a [google.protobuf.Type][]
   *   value in binary format, or produce an error.
   * * Applications are allowed to cache lookup results based on the
   *   URL, or have them precompiled into a binary to avoid any
   *   lookup. Therefore, binary compatibility needs to be preserved
   *   on changes to types. (Use versioned type names to manage
   *   breaking changes.)
   * Note: this functionality is not currently available in the official
   * protobuf release, and it is not used for type URLs beginning with
   * type.googleapis.com.
   * Schemes other than `http`, `https` (or the empty scheme) might be
   * used with implementation specific semantics.
   */
  "@type"?: string;
}

export interface GoogleRpcStatus {
  /** @format int32 */
  code?: number;
  message?: string;
  details?: { "@type"?: string }[];
}

/**
* DenomUnit represents a struct that describes a given
denomination unit of the basic token.
*/
export interface CosmosBankV1Beta1DenomUnit {
  /** denom represents the string name of the given denom unit (e.g uatom). */
  denom?: string;

  /**
   * exponent represents power of 10 exponent that one must
   * raise the base_denom to in order to equal the given DenomUnit's denom
   * 1 denom = 1^exponent base_denom
   * (e.g. with a base_denom of uatom, one can create a DenomUnit of 'atom' with
   * exponent = 6, thus: 1 atom = 10^6 uatom).
   * @format int64
   */
  exponent?: number;

  /** aliases is a list of string aliases for the given denom */
  aliases?: string[];
}

/**
 * Input models transaction input.
 */
export interface CosmosBankV1Beta1Input {
  address?: string;
  coins?: { denom?: string; amount?: string }[];
}

/**
* Metadata represents a struct that describes
a basic token.
*/
export interface CosmosBankV1Beta1Metadata {
  description?: string;

  /** denom_units represents the list of DenomUnit's for a given coin */
  denomUnits?: { denom?: string; exponent?: number; aliases?: string[] }[];

  /** base represents the base denom (should be the DenomUnit with exponent = 0). */
  base?: string;

  /**
   * display indicates the suggested denom that should be
   * displayed in clients.
   */
  display?: string;

  /**
   * name defines the name of the token (eg: Cosmos Atom)
   * Since: cosmos-sdk 0.43
   */
  name?: string;

  /**
   * symbol is the token symbol usually shown on exchanges (eg: ATOM). This can
   * be the same as the display.
   *
   * Since: cosmos-sdk 0.43
   */
  symbol?: string;
}

/**
 * MsgMultiSendResponse defines the Msg/MultiSend response type.
 */
export type CosmosBankV1Beta1MsgMultiSendResponse = object;

/**
 * MsgSendResponse defines the Msg/Send response type.
 */
export type CosmosBankV1Beta1MsgSendResponse = object;

/**
 * Output models transaction outputs.
 */
export interface CosmosBankV1Beta1Output {
  address?: string;
  coins?: { denom?: string; amount?: string }[];
}

/**
 * Params defines the parameters for the bank module.
 */
export interface CosmosBankV1Beta1Params {
  sendEnabled?: { denom?: string; enabled?: boolean }[];
  defaultSendEnabled?: boolean;
}

/**
* QueryAllBalancesResponse is the response type for the Query/AllBalances RPC
method.
*/
export interface CosmosBankV1Beta1QueryAllBalancesResponse {
  /** balances is the balances of all the coins. */
  balances?: { denom?: string; amount?: string }[];

  /** pagination defines the pagination in the response. */
  pagination?: { nextKey?: string; total?: string };
}

/**
 * QueryBalanceResponse is the response type for the Query/Balance RPC method.
 */
export interface CosmosBankV1Beta1QueryBalanceResponse {
  /**
   * Coin defines a token with a denomination and an amount.
   *
   * NOTE: The amount field is an Int which implements the custom method
   * signatures required by gogoproto.
   */
  balance?: { denom?: string; amount?: string };
}

/**
* QueryDenomMetadataResponse is the response type for the Query/DenomMetadata RPC
method.
*/
export interface CosmosBankV1Beta1QueryDenomMetadataResponse {
  /**
   * Metadata represents a struct that describes
   * a basic token.
   */
  metadata?: {
    description?: string;
    denomUnits?: { denom?: string; exponent?: number; aliases?: string[] }[];
    base?: string;
    display?: string;
    name?: string;
    symbol?: string;
  };
}

/**
* QueryDenomsMetadataResponse is the response type for the Query/DenomsMetadata RPC
method.
*/
export interface CosmosBankV1Beta1QueryDenomsMetadataResponse {
  /** metadata provides the client information for all the registered tokens. */
  metadatas?: {
    description?: string;
    denomUnits?: { denom?: string; exponent?: number; aliases?: string[] }[];
    base?: string;
    display?: string;
    name?: string;
    symbol?: string;
  }[];

  /** pagination defines the pagination in the response. */
  pagination?: { nextKey?: string; total?: string };
}

/**
 * QueryParamsResponse defines the response type for querying x/bank parameters.
 */
export interface CosmosBankV1Beta1QueryParamsResponse {
  /** Params defines the parameters for the bank module. */
  params?: { sendEnabled?: { denom?: string; enabled?: boolean }[]; defaultSendEnabled?: boolean };
}

/**
 * QuerySupplyOfResponse is the response type for the Query/SupplyOf RPC method.
 */
export interface CosmosBankV1Beta1QuerySupplyOfResponse {
  /**
   * Coin defines a token with a denomination and an amount.
   *
   * NOTE: The amount field is an Int which implements the custom method
   * signatures required by gogoproto.
   */
  amount?: { denom?: string; amount?: string };
}

export interface CosmosBankV1Beta1QueryTotalSupplyResponse {
  /** supply is the supply of the coins */
  supply?: { denom?: string; amount?: string }[];

  /**
   * pagination defines the pagination in the response.
   *
   * Since: cosmos-sdk 0.43
   */
  pagination?: { nextKey?: string; total?: string };
}

/**
* SendEnabled maps coin denom to a send_enabled status (whether a denom is
sendable).
*/
export interface CosmosBankV1Beta1SendEnabled {
  denom?: string;
  enabled?: boolean;
}

/**
* Coin defines a token with a denomination and an amount.

NOTE: The amount field is an Int which implements the custom method
signatures required by gogoproto.
*/
export interface CosmosBaseV1Beta1Coin {
  denom?: string;
  amount?: string;
}

/**
 * MsgVerifyInvariantResponse defines the Msg/VerifyInvariant response type.
 */
export type CosmosCrisisV1Beta1MsgVerifyInvariantResponse = object;

/**
* DecCoin defines a token with a denomination and a decimal amount.

NOTE: The amount field is an Dec which implements the custom method
signatures required by gogoproto.
*/
export interface CosmosBaseV1Beta1DecCoin {
  denom?: string;
  amount?: string;
}

/**
* DelegationDelegatorReward represents the properties
of a delegator's delegation reward.
*/
export interface CosmosDistributionV1Beta1DelegationDelegatorReward {
  validatorAddress?: string;
  reward?: { denom?: string; amount?: string }[];
}

/**
 * MsgFundCommunityPoolResponse defines the Msg/FundCommunityPool response type.
 */
export type CosmosDistributionV1Beta1MsgFundCommunityPoolResponse = object;

/**
 * MsgSetWithdrawAddressResponse defines the Msg/SetWithdrawAddress response type.
 */
export type CosmosDistributionV1Beta1MsgSetWithdrawAddressResponse = object;

/**
 * MsgWithdrawDelegatorRewardResponse defines the Msg/WithdrawDelegatorReward response type.
 */
export type CosmosDistributionV1Beta1MsgWithdrawDelegatorRewardResponse = object;

/**
 * MsgWithdrawValidatorCommissionResponse defines the Msg/WithdrawValidatorCommission response type.
 */
export type CosmosDistributionV1Beta1MsgWithdrawValidatorCommissionResponse = object;

/**
 * Params defines the set of params for the distribution module.
 */
export interface CosmosDistributionV1Beta1Params {
  communityTax?: string;
  baseProposerReward?: string;
  bonusProposerReward?: string;
  withdrawAddrEnabled?: boolean;
}

/**
* QueryCommunityPoolResponse is the response type for the Query/CommunityPool
RPC method.
*/
export interface CosmosDistributionV1Beta1QueryCommunityPoolResponse {
  /** pool defines community pool's coins. */
  pool?: { denom?: string; amount?: string }[];
}

/**
* QueryDelegationRewardsResponse is the response type for the
Query/DelegationRewards RPC method.
*/
export interface CosmosDistributionV1Beta1QueryDelegationRewardsResponse {
  /** rewards defines the rewards accrued by a delegation. */
  rewards?: { denom?: string; amount?: string }[];
}

/**
* QueryDelegationTotalRewardsResponse is the response type for the
Query/DelegationTotalRewards RPC method.
*/
export interface CosmosDistributionV1Beta1QueryDelegationTotalRewardsResponse {
  /** rewards defines all the rewards accrued by a delegator. */
  rewards?: { validatorAddress?: string; reward?: { denom?: string; amount?: string }[] }[];

  /** total defines the sum of all the rewards. */
  total?: { denom?: string; amount?: string }[];
}

/**
* QueryDelegatorValidatorsResponse is the response type for the
Query/DelegatorValidators RPC method.
*/
export interface CosmosDistributionV1Beta1QueryDelegatorValidatorsResponse {
  /** validators defines the validators a delegator is delegating for. */
  validators?: string[];
}

/**
* QueryDelegatorWithdrawAddressResponse is the response type for the
Query/DelegatorWithdrawAddress RPC method.
*/
export interface CosmosDistributionV1Beta1QueryDelegatorWithdrawAddressResponse {
  /** withdraw_address defines the delegator address to query for. */
  withdrawAddress?: string;
}

/**
 * QueryParamsResponse is the response type for the Query/Params RPC method.
 */
export interface CosmosDistributionV1Beta1QueryParamsResponse {
  /** params defines the parameters of the module. */
  params?: {
    communityTax?: string;
    baseProposerReward?: string;
    bonusProposerReward?: string;
    withdrawAddrEnabled?: boolean;
  };
}

export interface CosmosDistributionV1Beta1QueryValidatorCommissionResponse {
  /** commission defines the commision the validator received. */
  commission?: { commission?: { denom?: string; amount?: string }[] };
}

/**
* QueryValidatorOutstandingRewardsResponse is the response type for the
Query/ValidatorOutstandingRewards RPC method.
*/
export interface CosmosDistributionV1Beta1QueryValidatorOutstandingRewardsResponse {
  /**
   * ValidatorOutstandingRewards represents outstanding (un-withdrawn) rewards
   * for a validator inexpensive to track, allows simple sanity checks.
   */
  rewards?: { rewards?: { denom?: string; amount?: string }[] };
}

/**
* QueryValidatorSlashesResponse is the response type for the
Query/ValidatorSlashes RPC method.
*/
export interface CosmosDistributionV1Beta1QueryValidatorSlashesResponse {
  /** slashes defines the slashes the validator received. */
  slashes?: { validatorPeriod?: string; fraction?: string }[];

  /** pagination defines the pagination in the response. */
  pagination?: { nextKey?: string; total?: string };
}

/**
* ValidatorAccumulatedCommission represents accumulated commission
for a validator kept as a running counter, can be withdrawn at any time.
*/
export interface CosmosDistributionV1Beta1ValidatorAccumulatedCommission {
  commission?: { denom?: string; amount?: string }[];
}

/**
* ValidatorOutstandingRewards represents outstanding (un-withdrawn) rewards
for a validator inexpensive to track, allows simple sanity checks.
*/
export interface CosmosDistributionV1Beta1ValidatorOutstandingRewards {
  rewards?: { denom?: string; amount?: string }[];
}

/**
* ValidatorSlashEvent represents a validator slash event.
Height is implicit within the store key.
This is needed to calculate appropriate amount of staking tokens
for delegations which are withdrawn after a slash has occurred.
*/
export interface CosmosDistributionV1Beta1ValidatorSlashEvent {
  /** @format uint64 */
  validatorPeriod?: string;
  fraction?: string;
}

/**
 * MsgSubmitEvidenceResponse defines the Msg/SubmitEvidence response type.
 */
export interface CosmosEvidenceV1Beta1MsgSubmitEvidenceResponse {
  /**
   * hash defines the hash of the evidence.
   * @format byte
   */
  hash?: string;
}

/**
* QueryAllEvidenceResponse is the response type for the Query/AllEvidence RPC
method.
*/
export interface CosmosEvidenceV1Beta1QueryAllEvidenceResponse {
  /** evidence returns all evidences. */
  evidence?: { "@type"?: string }[];

  /** pagination defines the pagination in the response. */
  pagination?: { nextKey?: string; total?: string };
}

/**
 * QueryEvidenceResponse is the response type for the Query/Evidence RPC method.
 */
export interface CosmosEvidenceV1Beta1QueryEvidenceResponse {
  /**
   * `Any` contains an arbitrary serialized protocol buffer message along with a
   * URL that describes the type of the serialized message.
   *
   * Protobuf library provides support to pack/unpack Any values in the form
   * of utility functions or additional generated methods of the Any type.
   * Example 1: Pack and unpack a message in C++.
   *     Foo foo = ...;
   *     Any any;
   *     any.PackFrom(foo);
   *     ...
   *     if (any.UnpackTo(&foo)) {
   *       ...
   *     }
   * Example 2: Pack and unpack a message in Java.
   *     Any any = Any.pack(foo);
   *     if (any.is(Foo.class)) {
   *       foo = any.unpack(Foo.class);
   *  Example 3: Pack and unpack a message in Python.
   *     foo = Foo(...)
   *     any = Any()
   *     any.Pack(foo)
   *     if any.Is(Foo.DESCRIPTOR):
   *       any.Unpack(foo)
   *  Example 4: Pack and unpack a message in Go
   *      foo := &pb.Foo{...}
   *      any, err := anypb.New(foo)
   *      if err != nil {
   *        ...
   *      }
   *      ...
   *      foo := &pb.Foo{}
   *      if err := any.UnmarshalTo(foo); err != nil {
   * The pack methods provided by protobuf library will by default use
   * 'type.googleapis.com/full.type.name' as the type URL and the unpack
   * methods only use the fully qualified type name after the last '/'
   * in the type URL, for example "foo.bar.com/x/y.z" will yield type
   * name "y.z".
   * JSON
   * ====
   * The JSON representation of an `Any` value uses the regular
   * representation of the deserialized, embedded message, with an
   * additional field `@type` which contains the type URL. Example:
   *     package google.profile;
   *     message Person {
   *       string first_name = 1;
   *       string last_name = 2;
   *     {
   *       "@type": "type.googleapis.com/google.profile.Person",
   *       "firstName": <string>,
   *       "lastName": <string>
   * If the embedded message type is well-known and has a custom JSON
   * representation, that representation will be embedded adding a field
   * `value` which holds the custom JSON in addition to the `@type`
   * field. Example (for message [google.protobuf.Duration][]):
   *       "@type": "type.googleapis.com/google.protobuf.Duration",
   *       "value": "1.212s"
   */
  evidence?: { "@type"?: string };
}

export interface CosmosFeegrantV1Beta1Grant {
  /** granter is the address of the user granting an allowance of their funds. */
  granter?: string;

  /** grantee is the address of the user being granted an allowance of another user's funds. */
  grantee?: string;

  /** allowance can be any of basic and filtered fee allowance. */
  allowance?: { "@type"?: string };
}

/**
 * MsgGrantAllowanceResponse defines the Msg/GrantAllowanceResponse response type.
 */
export type CosmosFeegrantV1Beta1MsgGrantAllowanceResponse = object;

/**
 * MsgRevokeAllowanceResponse defines the Msg/RevokeAllowanceResponse response type.
 */
export type CosmosFeegrantV1Beta1MsgRevokeAllowanceResponse = object;

/**
 * QueryAllowanceResponse is the response type for the Query/Allowance RPC method.
 */
export interface CosmosFeegrantV1Beta1QueryAllowanceResponse {
  /**
   * Grant is stored in the KVStore to record a grant with full context
   * allowance is a allowance granted for grantee by granter.
   */
  allowance?: { granter?: string; grantee?: string; allowance?: { "@type"?: string } };
}

/**
 * QueryAllowancesResponse is the response type for the Query/Allowances RPC method.
 */
export interface CosmosFeegrantV1Beta1QueryAllowancesResponse {
  /** allowances are allowance's granted for grantee by granter. */
  allowances?: { granter?: string; grantee?: string; allowance?: { "@type"?: string } }[];

  /** pagination defines an pagination for the response. */
  pagination?: { nextKey?: string; total?: string };
}

/**
* Deposit defines an amount deposited by an account address to an active
proposal.
*/
export interface CosmosGovV1Beta1Deposit {
  /** @format uint64 */
  proposalId?: string;
  depositor?: string;
  amount?: { denom?: string; amount?: string }[];
}

/**
 * DepositParams defines the params for deposits on governance proposals.
 */
export interface CosmosGovV1Beta1DepositParams {
  /** Minimum deposit for a proposal to enter voting period. */
  minDeposit?: { denom?: string; amount?: string }[];

  /**
   * Maximum period for Atom holders to deposit on a proposal. Initial value: 2
   *  months.
   */
  maxDepositPeriod?: string;
}

/**
 * MsgDepositResponse defines the Msg/Deposit response type.
 */
export type CosmosGovV1Beta1MsgDepositResponse = object;

/**
 * MsgSubmitProposalResponse defines the Msg/SubmitProposal response type.
 */
export interface CosmosGovV1Beta1MsgSubmitProposalResponse {
  /** @format uint64 */
  proposalId?: string;
}

/**
 * MsgVoteResponse defines the Msg/Vote response type.
 */
export type CosmosGovV1Beta1MsgVoteResponse = object;

/**
* MsgVoteWeightedResponse defines the Msg/VoteWeighted response type.

Since: cosmos-sdk 0.43
*/
export type CosmosGovV1Beta1MsgVoteWeightedResponse = object;

/**
 * Proposal defines the core field members of a governance proposal.
 */
export interface CosmosGovV1Beta1Proposal {
  /** @format uint64 */
  proposalId?: string;

  /**
   * `Any` contains an arbitrary serialized protocol buffer message along with a
   * URL that describes the type of the serialized message.
   *
   * Protobuf library provides support to pack/unpack Any values in the form
   * of utility functions or additional generated methods of the Any type.
   * Example 1: Pack and unpack a message in C++.
   *     Foo foo = ...;
   *     Any any;
   *     any.PackFrom(foo);
   *     ...
   *     if (any.UnpackTo(&foo)) {
   *       ...
   *     }
   * Example 2: Pack and unpack a message in Java.
   *     Any any = Any.pack(foo);
   *     if (any.is(Foo.class)) {
   *       foo = any.unpack(Foo.class);
   *  Example 3: Pack and unpack a message in Python.
   *     foo = Foo(...)
   *     any = Any()
   *     any.Pack(foo)
   *     if any.Is(Foo.DESCRIPTOR):
   *       any.Unpack(foo)
   *  Example 4: Pack and unpack a message in Go
   *      foo := &pb.Foo{...}
   *      any, err := anypb.New(foo)
   *      if err != nil {
   *        ...
   *      }
   *      ...
   *      foo := &pb.Foo{}
   *      if err := any.UnmarshalTo(foo); err != nil {
   * The pack methods provided by protobuf library will by default use
   * 'type.googleapis.com/full.type.name' as the type URL and the unpack
   * methods only use the fully qualified type name after the last '/'
   * in the type URL, for example "foo.bar.com/x/y.z" will yield type
   * name "y.z".
   * JSON
   * ====
   * The JSON representation of an `Any` value uses the regular
   * representation of the deserialized, embedded message, with an
   * additional field `@type` which contains the type URL. Example:
   *     package google.profile;
   *     message Person {
   *       string first_name = 1;
   *       string last_name = 2;
   *     {
   *       "@type": "type.googleapis.com/google.profile.Person",
   *       "firstName": <string>,
   *       "lastName": <string>
   * If the embedded message type is well-known and has a custom JSON
   * representation, that representation will be embedded adding a field
   * `value` which holds the custom JSON in addition to the `@type`
   * field. Example (for message [google.protobuf.Duration][]):
   *       "@type": "type.googleapis.com/google.protobuf.Duration",
   *       "value": "1.212s"
   */
  content?: { "@type"?: string };

  /**
   * ProposalStatus enumerates the valid statuses of a proposal.
   *
   *  - PROPOSAL_STATUS_UNSPECIFIED: PROPOSAL_STATUS_UNSPECIFIED defines the default propopsal status.
   *  - PROPOSAL_STATUS_DEPOSIT_PERIOD: PROPOSAL_STATUS_DEPOSIT_PERIOD defines a proposal status during the deposit
   * period.
   *  - PROPOSAL_STATUS_VOTING_PERIOD: PROPOSAL_STATUS_VOTING_PERIOD defines a proposal status during the voting
   *  - PROPOSAL_STATUS_PASSED: PROPOSAL_STATUS_PASSED defines a proposal status of a proposal that has
   * passed.
   *  - PROPOSAL_STATUS_REJECTED: PROPOSAL_STATUS_REJECTED defines a proposal status of a proposal that has
   * been rejected.
   *  - PROPOSAL_STATUS_FAILED: PROPOSAL_STATUS_FAILED defines a proposal status of a proposal that has
   * failed.
   */
  status?:
    | "PROPOSAL_STATUS_UNSPECIFIED"
    | "PROPOSAL_STATUS_DEPOSIT_PERIOD"
    | "PROPOSAL_STATUS_VOTING_PERIOD"
    | "PROPOSAL_STATUS_PASSED"
    | "PROPOSAL_STATUS_REJECTED"
    | "PROPOSAL_STATUS_FAILED";

  /** TallyResult defines a standard tally for a governance proposal. */
  finalTallyResult?: { yes?: string; abstain?: string; no?: string; noWithVeto?: string };

  /** @format date-time */
  submitTime?: string;

  /** @format date-time */
  depositEndTime?: string;
  totalDeposit?: { denom?: string; amount?: string }[];

  /** @format date-time */
  votingStartTime?: string;

  /** @format date-time */
  votingEndTime?: string;
}

/**
* ProposalStatus enumerates the valid statuses of a proposal.

 - PROPOSAL_STATUS_UNSPECIFIED: PROPOSAL_STATUS_UNSPECIFIED defines the default propopsal status.
 - PROPOSAL_STATUS_DEPOSIT_PERIOD: PROPOSAL_STATUS_DEPOSIT_PERIOD defines a proposal status during the deposit
period.
 - PROPOSAL_STATUS_VOTING_PERIOD: PROPOSAL_STATUS_VOTING_PERIOD defines a proposal status during the voting
period.
 - PROPOSAL_STATUS_PASSED: PROPOSAL_STATUS_PASSED defines a proposal status of a proposal that has
passed.
 - PROPOSAL_STATUS_REJECTED: PROPOSAL_STATUS_REJECTED defines a proposal status of a proposal that has
been rejected.
 - PROPOSAL_STATUS_FAILED: PROPOSAL_STATUS_FAILED defines a proposal status of a proposal that has
failed.
*/
export enum CosmosGovV1Beta1ProposalStatus {
  PROPOSAL_STATUS_UNSPECIFIED = "PROPOSAL_STATUS_UNSPECIFIED",
  PROPOSAL_STATUS_DEPOSIT_PERIOD = "PROPOSAL_STATUS_DEPOSIT_PERIOD",
  PROPOSAL_STATUS_VOTING_PERIOD = "PROPOSAL_STATUS_VOTING_PERIOD",
  PROPOSAL_STATUS_PASSED = "PROPOSAL_STATUS_PASSED",
  PROPOSAL_STATUS_REJECTED = "PROPOSAL_STATUS_REJECTED",
  PROPOSAL_STATUS_FAILED = "PROPOSAL_STATUS_FAILED",
}

/**
 * QueryDepositResponse is the response type for the Query/Deposit RPC method.
 */
export interface CosmosGovV1Beta1QueryDepositResponse {
  /**
   * Deposit defines an amount deposited by an account address to an active
   * proposal.
   */
  deposit?: { proposalId?: string; depositor?: string; amount?: { denom?: string; amount?: string }[] };
}

/**
 * QueryDepositsResponse is the response type for the Query/Deposits RPC method.
 */
export interface CosmosGovV1Beta1QueryDepositsResponse {
  deposits?: { proposalId?: string; depositor?: string; amount?: { denom?: string; amount?: string }[] }[];

  /** pagination defines the pagination in the response. */
  pagination?: { nextKey?: string; total?: string };
}

/**
 * QueryParamsResponse is the response type for the Query/Params RPC method.
 */
export interface CosmosGovV1Beta1QueryParamsResponse {
  /** voting_params defines the parameters related to voting. */
  votingParams?: { votingPeriod?: string };

  /** deposit_params defines the parameters related to deposit. */
  depositParams?: { minDeposit?: { denom?: string; amount?: string }[]; maxDepositPeriod?: string };

  /** tally_params defines the parameters related to tally. */
  tallyParams?: { quorum?: string; threshold?: string; vetoThreshold?: string };
}

/**
 * QueryProposalResponse is the response type for the Query/Proposal RPC method.
 */
export interface CosmosGovV1Beta1QueryProposalResponse {
  /** Proposal defines the core field members of a governance proposal. */
  proposal?: {
    proposalId?: string;
    content?: { "@type"?: string };
    status?:
      | "PROPOSAL_STATUS_UNSPECIFIED"
      | "PROPOSAL_STATUS_DEPOSIT_PERIOD"
      | "PROPOSAL_STATUS_VOTING_PERIOD"
      | "PROPOSAL_STATUS_PASSED"
      | "PROPOSAL_STATUS_REJECTED"
      | "PROPOSAL_STATUS_FAILED";
    finalTallyResult?: { yes?: string; abstain?: string; no?: string; noWithVeto?: string };
    submitTime?: string;
    depositEndTime?: string;
    totalDeposit?: { denom?: string; amount?: string }[];
    votingStartTime?: string;
    votingEndTime?: string;
  };
}

/**
* QueryProposalsResponse is the response type for the Query/Proposals RPC
method.
*/
export interface CosmosGovV1Beta1QueryProposalsResponse {
  proposals?: {
    proposalId?: string;
    content?: { "@type"?: string };
    status?:
      | "PROPOSAL_STATUS_UNSPECIFIED"
      | "PROPOSAL_STATUS_DEPOSIT_PERIOD"
      | "PROPOSAL_STATUS_VOTING_PERIOD"
      | "PROPOSAL_STATUS_PASSED"
      | "PROPOSAL_STATUS_REJECTED"
      | "PROPOSAL_STATUS_FAILED";
    finalTallyResult?: { yes?: string; abstain?: string; no?: string; noWithVeto?: string };
    submitTime?: string;
    depositEndTime?: string;
    totalDeposit?: { denom?: string; amount?: string }[];
    votingStartTime?: string;
    votingEndTime?: string;
  }[];

  /** pagination defines the pagination in the response. */
  pagination?: { nextKey?: string; total?: string };
}

/**
 * QueryTallyResultResponse is the response type for the Query/Tally RPC method.
 */
export interface CosmosGovV1Beta1QueryTallyResultResponse {
  /** TallyResult defines a standard tally for a governance proposal. */
  tally?: { yes?: string; abstain?: string; no?: string; noWithVeto?: string };
}

/**
 * QueryVoteResponse is the response type for the Query/Vote RPC method.
 */
export interface CosmosGovV1Beta1QueryVoteResponse {
  /**
   * Vote defines a vote on a governance proposal.
   * A Vote consists of a proposal ID, the voter, and the vote option.
   */
  vote?: {
    proposalId?: string;
    voter?: string;
    option?:
      | "VOTE_OPTION_UNSPECIFIED"
      | "VOTE_OPTION_YES"
      | "VOTE_OPTION_ABSTAIN"
      | "VOTE_OPTION_NO"
      | "VOTE_OPTION_NO_WITH_VETO";
    options?: {
      option?:
        | "VOTE_OPTION_UNSPECIFIED"
        | "VOTE_OPTION_YES"
        | "VOTE_OPTION_ABSTAIN"
        | "VOTE_OPTION_NO"
        | "VOTE_OPTION_NO_WITH_VETO";
      weight?: string;
    }[];
  };
}

/**
 * QueryVotesResponse is the response type for the Query/Votes RPC method.
 */
export interface CosmosGovV1Beta1QueryVotesResponse {
  /** votes defined the queried votes. */
  votes?: {
    proposalId?: string;
    voter?: string;
    option?:
      | "VOTE_OPTION_UNSPECIFIED"
      | "VOTE_OPTION_YES"
      | "VOTE_OPTION_ABSTAIN"
      | "VOTE_OPTION_NO"
      | "VOTE_OPTION_NO_WITH_VETO";
    options?: {
      option?:
        | "VOTE_OPTION_UNSPECIFIED"
        | "VOTE_OPTION_YES"
        | "VOTE_OPTION_ABSTAIN"
        | "VOTE_OPTION_NO"
        | "VOTE_OPTION_NO_WITH_VETO";
      weight?: string;
    }[];
  }[];

  /** pagination defines the pagination in the response. */
  pagination?: { nextKey?: string; total?: string };
}

/**
 * TallyParams defines the params for tallying votes on governance proposals.
 */
export interface CosmosGovV1Beta1TallyParams {
  /**
   * Minimum percentage of total stake needed to vote for a result to be
   *  considered valid.
   * @format byte
   */
  quorum?: string;

  /**
   * Minimum proportion of Yes votes for proposal to pass. Default value: 0.5.
   * @format byte
   */
  threshold?: string;

  /**
   * Minimum value of Veto votes to Total votes ratio for proposal to be
   *  vetoed. Default value: 1/3.
   * @format byte
   */
  vetoThreshold?: string;
}

/**
 * TallyResult defines a standard tally for a governance proposal.
 */
export interface CosmosGovV1Beta1TallyResult {
  yes?: string;
  abstain?: string;
  no?: string;
  noWithVeto?: string;
}

/**
* Vote defines a vote on a governance proposal.
A Vote consists of a proposal ID, the voter, and the vote option.
*/
export interface CosmosGovV1Beta1Vote {
  /** @format uint64 */
  proposalId?: string;
  voter?: string;

  /**
   * Deprecated: Prefer to use `options` instead. This field is set in queries
   * if and only if `len(options) == 1` and that option has weight 1. In all
   * other cases, this field will default to VOTE_OPTION_UNSPECIFIED.
   */
  option?:
    | "VOTE_OPTION_UNSPECIFIED"
    | "VOTE_OPTION_YES"
    | "VOTE_OPTION_ABSTAIN"
    | "VOTE_OPTION_NO"
    | "VOTE_OPTION_NO_WITH_VETO";

  /** Since: cosmos-sdk 0.43 */
  options?: {
    option?:
      | "VOTE_OPTION_UNSPECIFIED"
      | "VOTE_OPTION_YES"
      | "VOTE_OPTION_ABSTAIN"
      | "VOTE_OPTION_NO"
      | "VOTE_OPTION_NO_WITH_VETO";
    weight?: string;
  }[];
}

/**
* VoteOption enumerates the valid vote options for a given governance proposal.

 - VOTE_OPTION_UNSPECIFIED: VOTE_OPTION_UNSPECIFIED defines a no-op vote option.
 - VOTE_OPTION_YES: VOTE_OPTION_YES defines a yes vote option.
 - VOTE_OPTION_ABSTAIN: VOTE_OPTION_ABSTAIN defines an abstain vote option.
 - VOTE_OPTION_NO: VOTE_OPTION_NO defines a no vote option.
 - VOTE_OPTION_NO_WITH_VETO: VOTE_OPTION_NO_WITH_VETO defines a no with veto vote option.
*/
export enum CosmosGovV1Beta1VoteOption {
  VOTE_OPTION_UNSPECIFIED = "VOTE_OPTION_UNSPECIFIED",
  VOTE_OPTION_YES = "VOTE_OPTION_YES",
  VOTE_OPTION_ABSTAIN = "VOTE_OPTION_ABSTAIN",
  VOTE_OPTION_NO = "VOTE_OPTION_NO",
  VOTE_OPTION_NO_WITH_VETO = "VOTE_OPTION_NO_WITH_VETO",
}

/**
 * VotingParams defines the params for voting on governance proposals.
 */
export interface CosmosGovV1Beta1VotingParams {
  /** Length of the voting period. */
  votingPeriod?: string;
}

/**
* WeightedVoteOption defines a unit of vote for vote split.

Since: cosmos-sdk 0.43
*/
export interface CosmosGovV1Beta1WeightedVoteOption {
  /**
   * VoteOption enumerates the valid vote options for a given governance proposal.
   *
   *  - VOTE_OPTION_UNSPECIFIED: VOTE_OPTION_UNSPECIFIED defines a no-op vote option.
   *  - VOTE_OPTION_YES: VOTE_OPTION_YES defines a yes vote option.
   *  - VOTE_OPTION_ABSTAIN: VOTE_OPTION_ABSTAIN defines an abstain vote option.
   *  - VOTE_OPTION_NO: VOTE_OPTION_NO defines a no vote option.
   *  - VOTE_OPTION_NO_WITH_VETO: VOTE_OPTION_NO_WITH_VETO defines a no with veto vote option.
   */
  option?:
    | "VOTE_OPTION_UNSPECIFIED"
    | "VOTE_OPTION_YES"
    | "VOTE_OPTION_ABSTAIN"
    | "VOTE_OPTION_NO"
    | "VOTE_OPTION_NO_WITH_VETO";
  weight?: string;
}

export type CosmosSlashingV1Beta1MsgUnjailResponse = object;

/**
 * Params represents the parameters used for by the slashing module.
 */
export interface CosmosSlashingV1Beta1Params {
  /** @format int64 */
  signedBlocksWindow?: string;

  /** @format byte */
  minSignedPerWindow?: string;
  downtimeJailDuration?: string;

  /** @format byte */
  slashFractionDoubleSign?: string;

  /** @format byte */
  slashFractionDowntime?: string;
}

export interface CosmosSlashingV1Beta1QueryParamsResponse {
  /** Params represents the parameters used for by the slashing module. */
  params?: {
    signedBlocksWindow?: string;
    minSignedPerWindow?: string;
    downtimeJailDuration?: string;
    slashFractionDoubleSign?: string;
    slashFractionDowntime?: string;
  };
}

export interface CosmosSlashingV1Beta1QuerySigningInfoResponse {
  /**
   * val_signing_info is the signing info of requested val cons address
   * ValidatorSigningInfo defines a validator's signing info for monitoring their
   * liveness activity.
   */
  valSigningInfo?: {
    address?: string;
    startHeight?: string;
    indexOffset?: string;
    jailedUntil?: string;
    tombstoned?: boolean;
    missedBlocksCounter?: string;
  };
}

export interface CosmosSlashingV1Beta1QuerySigningInfosResponse {
  /** info is the signing info of all validators */
  info?: {
    address?: string;
    startHeight?: string;
    indexOffset?: string;
    jailedUntil?: string;
    tombstoned?: boolean;
    missedBlocksCounter?: string;
  }[];

  /**
   * PageResponse is to be embedded in gRPC response messages where the
   * corresponding request message has used PageRequest.
   *
   *  message SomeResponse {
   *          repeated Bar results = 1;
   *          PageResponse page = 2;
   *  }
   */
  pagination?: { nextKey?: string; total?: string };
}

/**
* ValidatorSigningInfo defines a validator's signing info for monitoring their
liveness activity.
*/
export interface CosmosSlashingV1Beta1ValidatorSigningInfo {
  address?: string;

  /**
   * Height at which validator was first a candidate OR was unjailed
   * @format int64
   */
  startHeight?: string;

  /**
   * Index which is incremented each time the validator was a bonded
   * in a block and may have signed a precommit or not. This in conjunction with the
   * `SignedBlocksWindow` param determines the index in the `MissedBlocksBitArray`.
   * @format int64
   */
  indexOffset?: string;

  /**
   * Timestamp until which the validator is jailed due to liveness downtime.
   * @format date-time
   */
  jailedUntil?: string;

  /**
   * Whether or not a validator has been tombstoned (killed out of validator set). It is set
   * once the validator commits an equivocation or for any other configured misbehiavor.
   */
  tombstoned?: boolean;

  /**
   * A counter kept to avoid unnecessary array reads.
   * Note that `Sum(MissedBlocksBitArray)` always equals `MissedBlocksCounter`.
   * @format int64
   */
  missedBlocksCounter?: string;
}

/**
* BondStatus is the status of a validator.

 - BOND_STATUS_UNSPECIFIED: UNSPECIFIED defines an invalid validator status.
 - BOND_STATUS_UNBONDED: UNBONDED defines a validator that is not bonded.
 - BOND_STATUS_UNBONDING: UNBONDING defines a validator that is unbonding.
 - BOND_STATUS_BONDED: BONDED defines a validator that is bonded.
*/
export enum CosmosStakingV1Beta1BondStatus {
  BOND_STATUS_UNSPECIFIED = "BOND_STATUS_UNSPECIFIED",
  BOND_STATUS_UNBONDED = "BOND_STATUS_UNBONDED",
  BOND_STATUS_UNBONDING = "BOND_STATUS_UNBONDING",
  BOND_STATUS_BONDED = "BOND_STATUS_BONDED",
}

/**
 * Commission defines commission parameters for a given validator.
 */
export interface CosmosStakingV1Beta1Commission {
  /** commission_rates defines the initial commission rates to be used for creating a validator. */
  commissionRates?: { rate?: string; maxRate?: string; maxChangeRate?: string };

  /**
   * update_time is the last time the commission rate was changed.
   * @format date-time
   */
  updateTime?: string;
}

/**
* CommissionRates defines the initial commission rates to be used for creating
a validator.
*/
export interface CosmosStakingV1Beta1CommissionRates {
  /** rate is the commission rate charged to delegators, as a fraction. */
  rate?: string;

  /** max_rate defines the maximum commission rate which validator can ever charge, as a fraction. */
  maxRate?: string;

  /** max_change_rate defines the maximum daily increase of the validator commission, as a fraction. */
  maxChangeRate?: string;
}

/**
* Delegation represents the bond with tokens held by an account. It is
owned by one delegator, and is associated with the voting power of one
validator.
*/
export interface CosmosStakingV1Beta1Delegation {
  /** delegator_address is the bech32-encoded address of the delegator. */
  delegatorAddress?: string;

  /** validator_address is the bech32-encoded address of the validator. */
  validatorAddress?: string;

  /** shares define the delegation shares received. */
  shares?: string;
}

/**
* DelegationResponse is equivalent to Delegation except that it contains a
balance in addition to shares which is more suitable for client responses.
*/
export interface CosmosStakingV1Beta1DelegationResponse {
  /**
   * Delegation represents the bond with tokens held by an account. It is
   * owned by one delegator, and is associated with the voting power of one
   * validator.
   */
  delegation?: { delegatorAddress?: string; validatorAddress?: string; shares?: string };

  /**
   * Coin defines a token with a denomination and an amount.
   *
   * NOTE: The amount field is an Int which implements the custom method
   * signatures required by gogoproto.
   */
  balance?: { denom?: string; amount?: string };
}

/**
 * Description defines a validator description.
 */
export interface CosmosStakingV1Beta1Description {
  /** moniker defines a human-readable name for the validator. */
  moniker?: string;

  /** identity defines an optional identity signature (ex. UPort or Keybase). */
  identity?: string;

  /** website defines an optional website link. */
  website?: string;

  /** security_contact defines an optional email for security contact. */
  securityContact?: string;

  /** details define other optional details. */
  details?: string;
}

/**
* HistoricalInfo contains header and validator information for a given block.
It is stored as part of staking module's state, which persists the `n` most
recent HistoricalInfo
(`n` is set by the staking module's `historical_entries` parameter).
*/
export interface CosmosStakingV1Beta1HistoricalInfo {
  /** Header defines the structure of a Tendermint block header. */
  header?: {
    version?: { block?: string; app?: string };
    chainId?: string;
    height?: string;
    time?: string;
    lastBlockId?: { hash?: string; partSetHeader?: { total?: number; hash?: string } };
    lastCommitHash?: string;
    dataHash?: string;
    validatorsHash?: string;
    nextValidatorsHash?: string;
    consensusHash?: string;
    appHash?: string;
    lastResultsHash?: string;
    evidenceHash?: string;
    proposerAddress?: string;
  };
  valset?: {
    operatorAddress?: string;
    consensusPubkey?: { "@type"?: string };
    jailed?: boolean;
    status?: "BOND_STATUS_UNSPECIFIED" | "BOND_STATUS_UNBONDED" | "BOND_STATUS_UNBONDING" | "BOND_STATUS_BONDED";
    tokens?: string;
    delegatorShares?: string;
    description?: { moniker?: string; identity?: string; website?: string; securityContact?: string; details?: string };
    unbondingHeight?: string;
    unbondingTime?: string;
    commission?: { commissionRates?: { rate?: string; maxRate?: string; maxChangeRate?: string }; updateTime?: string };
    minSelfDelegation?: string;
  }[];
}

/**
 * MsgBeginRedelegateResponse defines the Msg/BeginRedelegate response type.
 */
export interface CosmosStakingV1Beta1MsgBeginRedelegateResponse {
  /** @format date-time */
  completionTime?: string;
}

/**
 * MsgCreateValidatorResponse defines the Msg/CreateValidator response type.
 */
export type CosmosStakingV1Beta1MsgCreateValidatorResponse = object;

/**
 * MsgDelegateResponse defines the Msg/Delegate response type.
 */
export type CosmosStakingV1Beta1MsgDelegateResponse = object;

/**
 * MsgEditValidatorResponse defines the Msg/EditValidator response type.
 */
export type CosmosStakingV1Beta1MsgEditValidatorResponse = object;

/**
 * MsgUndelegateResponse defines the Msg/Undelegate response type.
 */
export interface CosmosStakingV1Beta1MsgUndelegateResponse {
  /** @format date-time */
  completionTime?: string;
}

/**
 * Params defines the parameters for the staking module.
 */
export interface CosmosStakingV1Beta1Params {
  /** unbonding_time is the time duration of unbonding. */
  unbondingTime?: string;

  /**
   * max_validators is the maximum number of validators.
   * @format int64
   */
  maxValidators?: number;

  /**
   * max_entries is the max entries for either unbonding delegation or redelegation (per pair/trio).
   * @format int64
   */
  maxEntries?: number;

  /**
   * historical_entries is the number of historical entries to persist.
   * @format int64
   */
  historicalEntries?: number;

  /** bond_denom defines the bondable coin denomination. */
  bondDenom?: string;
}

/**
* Pool is used for tracking bonded and not-bonded token supply of the bond
denomination.
*/
export interface CosmosStakingV1Beta1Pool {
  notBondedTokens?: string;
  bondedTokens?: string;
}

/**
 * QueryDelegationResponse is response type for the Query/Delegation RPC method.
 */
export interface CosmosStakingV1Beta1QueryDelegationResponse {
  /**
   * DelegationResponse is equivalent to Delegation except that it contains a
   * balance in addition to shares which is more suitable for client responses.
   */
  delegationResponse?: {
    delegation?: { delegatorAddress?: string; validatorAddress?: string; shares?: string };
    balance?: { denom?: string; amount?: string };
  };
}

/**
* QueryDelegatorDelegationsResponse is response type for the
Query/DelegatorDelegations RPC method.
*/
export interface CosmosStakingV1Beta1QueryDelegatorDelegationsResponse {
  /** delegation_responses defines all the delegations' info of a delegator. */
  delegationResponses?: {
    delegation?: { delegatorAddress?: string; validatorAddress?: string; shares?: string };
    balance?: { denom?: string; amount?: string };
  }[];

  /** pagination defines the pagination in the response. */
  pagination?: { nextKey?: string; total?: string };
}

/**
* QueryUnbondingDelegatorDelegationsResponse is response type for the
Query/UnbondingDelegatorDelegations RPC method.
*/
export interface CosmosStakingV1Beta1QueryDelegatorUnbondingDelegationsResponse {
  unbondingResponses?: {
    delegatorAddress?: string;
    validatorAddress?: string;
    entries?: { creationHeight?: string; completionTime?: string; initialBalance?: string; balance?: string }[];
  }[];

  /** pagination defines the pagination in the response. */
  pagination?: { nextKey?: string; total?: string };
}

/**
* QueryDelegatorValidatorResponse response type for the
Query/DelegatorValidator RPC method.
*/
export interface CosmosStakingV1Beta1QueryDelegatorValidatorResponse {
  /**
   * Validator defines a validator, together with the total amount of the
   * Validator's bond shares and their exchange rate to coins. Slashing results in
   * a decrease in the exchange rate, allowing correct calculation of future
   * undelegations without iterating over delegators. When coins are delegated to
   * this validator, the validator is credited with a delegation whose number of
   * bond shares is based on the amount of coins delegated divided by the current
   * exchange rate. Voting power can be calculated as total bonded shares
   * multiplied by exchange rate.
   */
  validator?: {
    operatorAddress?: string;
    consensusPubkey?: { "@type"?: string };
    jailed?: boolean;
    status?: "BOND_STATUS_UNSPECIFIED" | "BOND_STATUS_UNBONDED" | "BOND_STATUS_UNBONDING" | "BOND_STATUS_BONDED";
    tokens?: string;
    delegatorShares?: string;
    description?: { moniker?: string; identity?: string; website?: string; securityContact?: string; details?: string };
    unbondingHeight?: string;
    unbondingTime?: string;
    commission?: { commissionRates?: { rate?: string; maxRate?: string; maxChangeRate?: string }; updateTime?: string };
    minSelfDelegation?: string;
  };
}

/**
* QueryDelegatorValidatorsResponse is response type for the
Query/DelegatorValidators RPC method.
*/
export interface CosmosStakingV1Beta1QueryDelegatorValidatorsResponse {
  /** validators defines the the validators' info of a delegator. */
  validators?: {
    operatorAddress?: string;
    consensusPubkey?: { "@type"?: string };
    jailed?: boolean;
    status?: "BOND_STATUS_UNSPECIFIED" | "BOND_STATUS_UNBONDED" | "BOND_STATUS_UNBONDING" | "BOND_STATUS_BONDED";
    tokens?: string;
    delegatorShares?: string;
    description?: { moniker?: string; identity?: string; website?: string; securityContact?: string; details?: string };
    unbondingHeight?: string;
    unbondingTime?: string;
    commission?: { commissionRates?: { rate?: string; maxRate?: string; maxChangeRate?: string }; updateTime?: string };
    minSelfDelegation?: string;
  }[];

  /** pagination defines the pagination in the response. */
  pagination?: { nextKey?: string; total?: string };
}

/**
* QueryHistoricalInfoResponse is response type for the Query/HistoricalInfo RPC
method.
*/
export interface CosmosStakingV1Beta1QueryHistoricalInfoResponse {
  /** hist defines the historical info at the given height. */
  hist?: {
    header?: {
      version?: { block?: string; app?: string };
      chainId?: string;
      height?: string;
      time?: string;
      lastBlockId?: { hash?: string; partSetHeader?: { total?: number; hash?: string } };
      lastCommitHash?: string;
      dataHash?: string;
      validatorsHash?: string;
      nextValidatorsHash?: string;
      consensusHash?: string;
      appHash?: string;
      lastResultsHash?: string;
      evidenceHash?: string;
      proposerAddress?: string;
    };
    valset?: {
      operatorAddress?: string;
      consensusPubkey?: { "@type"?: string };
      jailed?: boolean;
      status?: "BOND_STATUS_UNSPECIFIED" | "BOND_STATUS_UNBONDED" | "BOND_STATUS_UNBONDING" | "BOND_STATUS_BONDED";
      tokens?: string;
      delegatorShares?: string;
      description?: {
        moniker?: string;
        identity?: string;
        website?: string;
        securityContact?: string;
        details?: string;
      };
      unbondingHeight?: string;
      unbondingTime?: string;
      commission?: {
        commissionRates?: { rate?: string; maxRate?: string; maxChangeRate?: string };
        updateTime?: string;
      };
      minSelfDelegation?: string;
    }[];
  };
}

/**
 * QueryParamsResponse is response type for the Query/Params RPC method.
 */
export interface CosmosStakingV1Beta1QueryParamsResponse {
  /** params holds all the parameters of this module. */
  params?: {
    unbondingTime?: string;
    maxValidators?: number;
    maxEntries?: number;
    historicalEntries?: number;
    bondDenom?: string;
  };
}

/**
 * QueryPoolResponse is response type for the Query/Pool RPC method.
 */
export interface CosmosStakingV1Beta1QueryPoolResponse {
  /** pool defines the pool info. */
  pool?: { notBondedTokens?: string; bondedTokens?: string };
}

/**
* QueryRedelegationsResponse is response type for the Query/Redelegations RPC
method.
*/
export interface CosmosStakingV1Beta1QueryRedelegationsResponse {
  redelegationResponses?: {
    redelegation?: {
      delegatorAddress?: string;
      validatorSrcAddress?: string;
      validatorDstAddress?: string;
      entries?: { creationHeight?: string; completionTime?: string; initialBalance?: string; sharesDst?: string }[];
    };
    entries?: {
      redelegationEntry?: {
        creationHeight?: string;
        completionTime?: string;
        initialBalance?: string;
        sharesDst?: string;
      };
      balance?: string;
    }[];
  }[];

  /** pagination defines the pagination in the response. */
  pagination?: { nextKey?: string; total?: string };
}

/**
* QueryDelegationResponse is response type for the Query/UnbondingDelegation
RPC method.
*/
export interface CosmosStakingV1Beta1QueryUnbondingDelegationResponse {
  /**
   * UnbondingDelegation stores all of a single delegator's unbonding bonds
   * for a single validator in an time-ordered list.
   */
  unbond?: {
    delegatorAddress?: string;
    validatorAddress?: string;
    entries?: { creationHeight?: string; completionTime?: string; initialBalance?: string; balance?: string }[];
  };
}

export interface CosmosStakingV1Beta1QueryValidatorDelegationsResponse {
  delegationResponses?: {
    delegation?: { delegatorAddress?: string; validatorAddress?: string; shares?: string };
    balance?: { denom?: string; amount?: string };
  }[];

  /** pagination defines the pagination in the response. */
  pagination?: { nextKey?: string; total?: string };
}

export interface CosmosStakingV1Beta1QueryValidatorResponse {
  /**
   * Validator defines a validator, together with the total amount of the
   * Validator's bond shares and their exchange rate to coins. Slashing results in
   * a decrease in the exchange rate, allowing correct calculation of future
   * undelegations without iterating over delegators. When coins are delegated to
   * this validator, the validator is credited with a delegation whose number of
   * bond shares is based on the amount of coins delegated divided by the current
   * exchange rate. Voting power can be calculated as total bonded shares
   * multiplied by exchange rate.
   */
  validator?: {
    operatorAddress?: string;
    consensusPubkey?: { "@type"?: string };
    jailed?: boolean;
    status?: "BOND_STATUS_UNSPECIFIED" | "BOND_STATUS_UNBONDED" | "BOND_STATUS_UNBONDING" | "BOND_STATUS_BONDED";
    tokens?: string;
    delegatorShares?: string;
    description?: { moniker?: string; identity?: string; website?: string; securityContact?: string; details?: string };
    unbondingHeight?: string;
    unbondingTime?: string;
    commission?: { commissionRates?: { rate?: string; maxRate?: string; maxChangeRate?: string }; updateTime?: string };
    minSelfDelegation?: string;
  };
}

/**
* QueryValidatorUnbondingDelegationsResponse is response type for the
Query/ValidatorUnbondingDelegations RPC method.
*/
export interface CosmosStakingV1Beta1QueryValidatorUnbondingDelegationsResponse {
  unbondingResponses?: {
    delegatorAddress?: string;
    validatorAddress?: string;
    entries?: { creationHeight?: string; completionTime?: string; initialBalance?: string; balance?: string }[];
  }[];

  /** pagination defines the pagination in the response. */
  pagination?: { nextKey?: string; total?: string };
}

export interface CosmosStakingV1Beta1QueryValidatorsResponse {
  /** validators contains all the queried validators. */
  validators?: {
    operatorAddress?: string;
    consensusPubkey?: { "@type"?: string };
    jailed?: boolean;
    status?: "BOND_STATUS_UNSPECIFIED" | "BOND_STATUS_UNBONDED" | "BOND_STATUS_UNBONDING" | "BOND_STATUS_BONDED";
    tokens?: string;
    delegatorShares?: string;
    description?: { moniker?: string; identity?: string; website?: string; securityContact?: string; details?: string };
    unbondingHeight?: string;
    unbondingTime?: string;
    commission?: { commissionRates?: { rate?: string; maxRate?: string; maxChangeRate?: string }; updateTime?: string };
    minSelfDelegation?: string;
  }[];

  /** pagination defines the pagination in the response. */
  pagination?: { nextKey?: string; total?: string };
}

/**
* Redelegation contains the list of a particular delegator's redelegating bonds
from a particular source validator to a particular destination validator.
*/
export interface CosmosStakingV1Beta1Redelegation {
  /** delegator_address is the bech32-encoded address of the delegator. */
  delegatorAddress?: string;

  /** validator_src_address is the validator redelegation source operator address. */
  validatorSrcAddress?: string;

  /** validator_dst_address is the validator redelegation destination operator address. */
  validatorDstAddress?: string;

  /** entries are the redelegation entries. */
  entries?: { creationHeight?: string; completionTime?: string; initialBalance?: string; sharesDst?: string }[];
}

/**
 * RedelegationEntry defines a redelegation object with relevant metadata.
 */
export interface CosmosStakingV1Beta1RedelegationEntry {
  /**
   * creation_height  defines the height which the redelegation took place.
   * @format int64
   */
  creationHeight?: string;

  /**
   * completion_time defines the unix time for redelegation completion.
   * @format date-time
   */
  completionTime?: string;

  /** initial_balance defines the initial balance when redelegation started. */
  initialBalance?: string;

  /** shares_dst is the amount of destination-validator shares created by redelegation. */
  sharesDst?: string;
}

/**
* RedelegationEntryResponse is equivalent to a RedelegationEntry except that it
contains a balance in addition to shares which is more suitable for client
responses.
*/
export interface CosmosStakingV1Beta1RedelegationEntryResponse {
  /** RedelegationEntry defines a redelegation object with relevant metadata. */
  redelegationEntry?: { creationHeight?: string; completionTime?: string; initialBalance?: string; sharesDst?: string };
  balance?: string;
}

/**
* RedelegationResponse is equivalent to a Redelegation except that its entries
contain a balance in addition to shares which is more suitable for client
responses.
*/
export interface CosmosStakingV1Beta1RedelegationResponse {
  /**
   * Redelegation contains the list of a particular delegator's redelegating bonds
   * from a particular source validator to a particular destination validator.
   */
  redelegation?: {
    delegatorAddress?: string;
    validatorSrcAddress?: string;
    validatorDstAddress?: string;
    entries?: { creationHeight?: string; completionTime?: string; initialBalance?: string; sharesDst?: string }[];
  };
  entries?: {
    redelegationEntry?: {
      creationHeight?: string;
      completionTime?: string;
      initialBalance?: string;
      sharesDst?: string;
    };
    balance?: string;
  }[];
}

/**
* UnbondingDelegation stores all of a single delegator's unbonding bonds
for a single validator in an time-ordered list.
*/
export interface CosmosStakingV1Beta1UnbondingDelegation {
  /** delegator_address is the bech32-encoded address of the delegator. */
  delegatorAddress?: string;

  /** validator_address is the bech32-encoded address of the validator. */
  validatorAddress?: string;

  /** entries are the unbonding delegation entries. */
  entries?: { creationHeight?: string; completionTime?: string; initialBalance?: string; balance?: string }[];
}

/**
 * UnbondingDelegationEntry defines an unbonding object with relevant metadata.
 */
export interface CosmosStakingV1Beta1UnbondingDelegationEntry {
  /**
   * creation_height is the height which the unbonding took place.
   * @format int64
   */
  creationHeight?: string;

  /**
   * completion_time is the unix time for unbonding completion.
   * @format date-time
   */
  completionTime?: string;

  /** initial_balance defines the tokens initially scheduled to receive at completion. */
  initialBalance?: string;

  /** balance defines the tokens to receive at completion. */
  balance?: string;
}

/**
* Validator defines a validator, together with the total amount of the
Validator's bond shares and their exchange rate to coins. Slashing results in
a decrease in the exchange rate, allowing correct calculation of future
undelegations without iterating over delegators. When coins are delegated to
this validator, the validator is credited with a delegation whose number of
bond shares is based on the amount of coins delegated divided by the current
exchange rate. Voting power can be calculated as total bonded shares
multiplied by exchange rate.
*/
export interface CosmosStakingV1Beta1Validator {
  /** operator_address defines the address of the validator's operator; bech encoded in JSON. */
  operatorAddress?: string;

  /**
   * `Any` contains an arbitrary serialized protocol buffer message along with a
   * URL that describes the type of the serialized message.
   *
   * Protobuf library provides support to pack/unpack Any values in the form
   * of utility functions or additional generated methods of the Any type.
   * Example 1: Pack and unpack a message in C++.
   *     Foo foo = ...;
   *     Any any;
   *     any.PackFrom(foo);
   *     ...
   *     if (any.UnpackTo(&foo)) {
   *       ...
   *     }
   * Example 2: Pack and unpack a message in Java.
   *     Any any = Any.pack(foo);
   *     if (any.is(Foo.class)) {
   *       foo = any.unpack(Foo.class);
   *  Example 3: Pack and unpack a message in Python.
   *     foo = Foo(...)
   *     any = Any()
   *     any.Pack(foo)
   *     if any.Is(Foo.DESCRIPTOR):
   *       any.Unpack(foo)
   *  Example 4: Pack and unpack a message in Go
   *      foo := &pb.Foo{...}
   *      any, err := anypb.New(foo)
   *      if err != nil {
   *        ...
   *      }
   *      ...
   *      foo := &pb.Foo{}
   *      if err := any.UnmarshalTo(foo); err != nil {
   * The pack methods provided by protobuf library will by default use
   * 'type.googleapis.com/full.type.name' as the type URL and the unpack
   * methods only use the fully qualified type name after the last '/'
   * in the type URL, for example "foo.bar.com/x/y.z" will yield type
   * name "y.z".
   * JSON
   * ====
   * The JSON representation of an `Any` value uses the regular
   * representation of the deserialized, embedded message, with an
   * additional field `@type` which contains the type URL. Example:
   *     package google.profile;
   *     message Person {
   *       string first_name = 1;
   *       string last_name = 2;
   *     {
   *       "@type": "type.googleapis.com/google.profile.Person",
   *       "firstName": <string>,
   *       "lastName": <string>
   * If the embedded message type is well-known and has a custom JSON
   * representation, that representation will be embedded adding a field
   * `value` which holds the custom JSON in addition to the `@type`
   * field. Example (for message [google.protobuf.Duration][]):
   *       "@type": "type.googleapis.com/google.protobuf.Duration",
   *       "value": "1.212s"
   */
  consensusPubkey?: { "@type"?: string };

  /** jailed defined whether the validator has been jailed from bonded status or not. */
  jailed?: boolean;

  /** status is the validator status (bonded/unbonding/unbonded). */
  status?: "BOND_STATUS_UNSPECIFIED" | "BOND_STATUS_UNBONDED" | "BOND_STATUS_UNBONDING" | "BOND_STATUS_BONDED";

  /** tokens define the delegated tokens (incl. self-delegation). */
  tokens?: string;

  /** delegator_shares defines total shares issued to a validator's delegators. */
  delegatorShares?: string;

  /** description defines the description terms for the validator. */
  description?: { moniker?: string; identity?: string; website?: string; securityContact?: string; details?: string };

  /**
   * unbonding_height defines, if unbonding, the height at which this validator has begun unbonding.
   * @format int64
   */
  unbondingHeight?: string;

  /**
   * unbonding_time defines, if unbonding, the min time for the validator to complete unbonding.
   * @format date-time
   */
  unbondingTime?: string;

  /** commission defines the commission parameters. */
  commission?: { commissionRates?: { rate?: string; maxRate?: string; maxChangeRate?: string }; updateTime?: string };

  /** min_self_delegation is the validator's self declared minimum self delegation. */
  minSelfDelegation?: string;
}

export interface TendermintTypesBlockID {
  /** @format byte */
  hash?: string;

  /** PartsetHeader */
  partSetHeader?: { total?: number; hash?: string };
}

/**
 * Header defines the structure of a Tendermint block header.
 */
export interface TendermintTypesHeader {
  /**
   * basic block info
   * Consensus captures the consensus rules for processing a block in the blockchain,
   * including all blockchain data structures and the rules of the application's
   * state transition machine.
   */
  version?: { block?: string; app?: string };
  chainId?: string;

  /** @format int64 */
  height?: string;

  /** @format date-time */
  time?: string;

  /** prev block info */
  lastBlockId?: { hash?: string; partSetHeader?: { total?: number; hash?: string } };

  /**
   * hashes of block data
   * @format byte
   */
  lastCommitHash?: string;

  /** @format byte */
  dataHash?: string;

  /**
   * hashes from the app output from the prev block
   * @format byte
   */
  validatorsHash?: string;

  /** @format byte */
  nextValidatorsHash?: string;

  /** @format byte */
  consensusHash?: string;

  /** @format byte */
  appHash?: string;

  /** @format byte */
  lastResultsHash?: string;

  /**
   * consensus info
   * @format byte
   */
  evidenceHash?: string;

  /** @format byte */
  proposerAddress?: string;
}

export interface TendermintTypesPartSetHeader {
  /** @format int64 */
  total?: number;

  /** @format byte */
  hash?: string;
}

/**
* Consensus captures the consensus rules for processing a block in the blockchain,
including all blockchain data structures and the rules of the application's
state transition machine.
*/
export interface TendermintVersionConsensus {
  /** @format uint64 */
  block?: string;

  /** @format uint64 */
  app?: string;
}

/**
 * MsgCreateVestingAccountResponse defines the Msg/CreateVestingAccount response type.
 */
export type CosmosVestingV1Beta1MsgCreateVestingAccountResponse = object;

/**
* The actual content of the claims is passed in with the transaction making the claim
and then passed through the call stack alongside the attestation while it is processed
the key in which the attestation is stored is keyed on the exact details of the claim
but there is no reason to store those exact details becuause the next message sender
will kindly provide you with them.
*/
export interface GravityV1Attestation {
  observed?: boolean;
  votes?: string[];

  /** @format uint64 */
  height?: string;

  /**
   * `Any` contains an arbitrary serialized protocol buffer message along with a
   * URL that describes the type of the serialized message.
   *
   * Protobuf library provides support to pack/unpack Any values in the form
   * of utility functions or additional generated methods of the Any type.
   * Example 1: Pack and unpack a message in C++.
   *     Foo foo = ...;
   *     Any any;
   *     any.PackFrom(foo);
   *     ...
   *     if (any.UnpackTo(&foo)) {
   *       ...
   *     }
   * Example 2: Pack and unpack a message in Java.
   *     Any any = Any.pack(foo);
   *     if (any.is(Foo.class)) {
   *       foo = any.unpack(Foo.class);
   *  Example 3: Pack and unpack a message in Python.
   *     foo = Foo(...)
   *     any = Any()
   *     any.Pack(foo)
   *     if any.Is(Foo.DESCRIPTOR):
   *       any.Unpack(foo)
   *  Example 4: Pack and unpack a message in Go
   *      foo := &pb.Foo{...}
   *      any, err := anypb.New(foo)
   *      if err != nil {
   *        ...
   *      }
   *      ...
   *      foo := &pb.Foo{}
   *      if err := any.UnmarshalTo(foo); err != nil {
   * The pack methods provided by protobuf library will by default use
   * 'type.googleapis.com/full.type.name' as the type URL and the unpack
   * methods only use the fully qualified type name after the last '/'
   * in the type URL, for example "foo.bar.com/x/y.z" will yield type
   * name "y.z".
   * JSON
   * ====
   * The JSON representation of an `Any` value uses the regular
   * representation of the deserialized, embedded message, with an
   * additional field `@type` which contains the type URL. Example:
   *     package google.profile;
   *     message Person {
   *       string first_name = 1;
   *       string last_name = 2;
   *     {
   *       "@type": "type.googleapis.com/google.profile.Person",
   *       "firstName": <string>,
   *       "lastName": <string>
   * If the embedded message type is well-known and has a custom JSON
   * representation, that representation will be embedded adding a field
   * `value` which holds the custom JSON in addition to the `@type`
   * field. Example (for message [google.protobuf.Duration][]):
   *       "@type": "type.googleapis.com/google.protobuf.Duration",
   *       "value": "1.212s"
   */
  claim?: { "@type"?: string };
}

export interface GravityV1BatchFees {
  token?: string;
  totalFees?: string;

  /** @format uint64 */
  txCount?: string;
}

export interface GravityV1BridgeValidator {
  /** @format uint64 */
  power?: string;
  ethereumAddress?: string;
}

export interface GravityV1ERC20Token {
  contract?: string;
  amount?: string;
}

export type GravityV1MsgBatchSendToEthClaimResponse = object;

export type GravityV1MsgCancelSendToEthResponse = object;

export interface GravityV1MsgConfirmBatch {
  /** @format uint64 */
  nonce?: string;
  tokenContract?: string;
  ethSigner?: string;
  orchestrator?: string;
  signature?: string;
}

export type GravityV1MsgConfirmBatchResponse = object;

export interface GravityV1MsgConfirmLogicCall {
  invalidationId?: string;

  /** @format uint64 */
  invalidationNonce?: string;
  ethSigner?: string;
  orchestrator?: string;
  signature?: string;
}

export type GravityV1MsgConfirmLogicCallResponse = object;

export type GravityV1MsgERC20DeployedClaimResponse = object;

export type GravityV1MsgLogicCallExecutedClaimResponse = object;

export type GravityV1MsgRequestBatchResponse = object;

export type GravityV1MsgSendToCosmosClaimResponse = object;

export type GravityV1MsgSendToEthResponse = object;

export type GravityV1MsgSetOrchestratorAddressResponse = object;

export type GravityV1MsgSubmitBadSignatureEvidenceResponse = object;

/**
* MsgValsetConfirm
this is the message sent by the validators when they wish to submit their
signatures over the validator set at a given block height. A validator must
first call MsgSetEthAddress to set their Ethereum address to be used for
signing. Then someone (anyone) must make a ValsetRequest, the request is
essentially a messaging mechanism to determine which block all validators
should submit signatures over. Finally validators sign the validator set,
powers, and Ethereum addresses of the entire validator set at the height of a
ValsetRequest and submit that signature with this message.

If a sufficient number of validators (66% of voting power) (A) have set
Ethereum addresses and (B) submit ValsetConfirm messages with their
signatures it is then possible for anyone to view these signatures in the
chain store and submit them to Ethereum to update the validator set
-------------
*/
export interface GravityV1MsgValsetConfirm {
  /** @format uint64 */
  nonce?: string;
  orchestrator?: string;
  ethAddress?: string;
  signature?: string;
}

export type GravityV1MsgValsetConfirmResponse = object;

export type GravityV1MsgValsetUpdatedClaimResponse = object;

export interface GravityV1OutgoingLogicCall {
  transfers?: { contract?: string; amount?: string }[];
  fees?: { contract?: string; amount?: string }[];
  logicContractAddress?: string;

  /** @format byte */
  payload?: string;

  /** @format uint64 */
  timeout?: string;

  /** @format byte */
  invalidationId?: string;

  /** @format uint64 */
  invalidationNonce?: string;

  /** @format uint64 */
  block?: string;
}

export interface GravityV1OutgoingTransferTx {
  /** @format uint64 */
  id?: string;
  sender?: string;
  destAddress?: string;

  /**
   * ERC20Token unique identifier for an Ethereum ERC20 token.
   * CONTRACT:
   * The contract address on ETH of the token, this could be a Cosmos
   * originated token, if so it will be the ERC20 address of the representation
   * (note: developers should look up the token symbol using the address on ETH to display for UI)
   */
  erc20Token?: { contract?: string; amount?: string };

  /**
   * ERC20Token unique identifier for an Ethereum ERC20 token.
   * CONTRACT:
   * The contract address on ETH of the token, this could be a Cosmos
   * originated token, if so it will be the ERC20 address of the representation
   * (note: developers should look up the token symbol using the address on ETH to display for UI)
   */
  erc20Fee?: { contract?: string; amount?: string };
}

export interface GravityV1OutgoingTxBatch {
  /** @format uint64 */
  batchNonce?: string;

  /** @format uint64 */
  batchTimeout?: string;
  transactions?: {
    id?: string;
    sender?: string;
    destAddress?: string;
    erc20Token?: { contract?: string; amount?: string };
    erc20Fee?: { contract?: string; amount?: string };
  }[];
  tokenContract?: string;

  /** @format uint64 */
  block?: string;
}

/**
* unbond_slashing_valsets_window

The unbond slashing valsets window is used to determine how many blocks after starting to unbond
a validator needs to continue signing blocks. The goal of this paramater is that when a validator leaves
the set, if their leaving creates enough change in the validator set to justify an update they will sign
a validator set update for the Ethereum bridge that does not include themselves. Allowing us to remove them
from the Ethereum bridge and replace them with the new set gracefully.

valset_reward

These parameters allow for the bridge oracle to resolve a fork on the Ethereum chain without halting
the chain. Once set reset bridge state will roll back events to the nonce provided in reset_bridge_nonce
if and only if those events have not yet been observed (executed on the Cosmos chain). This allows for easy
handling of cases where for example an Ethereum hardfork has occured and more than 1/3 of the vlaidtor set
disagrees with the rest. Normally this would require a chain halt, manual genesis editing and restar to resolve
with this feature a governance proposal can be used instead

bridge_active

This boolean flag can be used by governance to temporarily halt the bridge due to a vulnerability or other issue
In this context halting the bridge means prevent the execution of any oracle events from Ethereum and preventing
the creation of new batches that may be relayed to Ethereum.
This does not prevent the creation of validator sets
or slashing for not submitting validator set signatures as either of these might allow key signers to leave the validator
set and steal funds on Ethereum without consequence.
The practical outcome of this flag being set to 'false' is that deposits from Ethereum will not show up and withdraws from
Cosmos will not execute on Ethereum.
*/
export interface GravityV1Params {
  gravityId?: string;
  contractSourceHash?: string;
  bridgeEthereumAddress?: string;

  /** @format uint64 */
  bridgeChainId?: string;

  /** @format uint64 */
  signedValsetsWindow?: string;

  /** @format uint64 */
  signedBatchesWindow?: string;

  /** @format uint64 */
  signedLogicCallsWindow?: string;

  /** @format uint64 */
  targetBatchTimeout?: string;

  /** @format uint64 */
  averageBlockTime?: string;

  /** @format uint64 */
  averageEthereumBlockTime?: string;

  /** @format byte */
  slashFractionValset?: string;

  /** @format byte */
  slashFractionBatch?: string;

  /** @format byte */
  slashFractionLogicCall?: string;

  /** @format uint64 */
  unbondSlashingValsetsWindow?: string;

  /** @format byte */
  slashFractionBadEthSignature?: string;

  /**
   * Coin defines a token with a denomination and an amount.
   *
   * NOTE: The amount field is an Int which implements the custom method
   * signatures required by gogoproto.
   */
  valsetReward?: { denom?: string; amount?: string };
  bridgeActive?: boolean;

  /**
   * addresses on this blacklist are forbidden from depositing or withdrawing
   * from Ethereum to the bridge
   */
  ethereumBlacklist?: string[];
}

export interface GravityV1QueryAttestationsResponse {
  attestations?: { observed?: boolean; votes?: string[]; height?: string; claim?: { "@type"?: string } }[];
}

export interface GravityV1QueryBatchConfirmsResponse {
  confirms?: {
    nonce?: string;
    tokenContract?: string;
    ethSigner?: string;
    orchestrator?: string;
    signature?: string;
  }[];
}

export interface GravityV1QueryBatchFeeResponse {
  batchFees?: { token?: string; totalFees?: string; txCount?: string }[];
}

export interface GravityV1QueryBatchRequestByNonceResponse {
  /** OutgoingTxBatch represents a batch of transactions going from gravity to ETH */
  batch?: {
    batchNonce?: string;
    batchTimeout?: string;
    transactions?: {
      id?: string;
      sender?: string;
      destAddress?: string;
      erc20Token?: { contract?: string; amount?: string };
      erc20Fee?: { contract?: string; amount?: string };
    }[];
    tokenContract?: string;
    block?: string;
  };
}

export interface GravityV1QueryCurrentValsetResponse {
  /**
   * Valset is the Ethereum Bridge Multsig Set, each gravity validator also
   * maintains an ETH key to sign messages, these are used to check signatures on
   * ETH because of the significant gas savings
   */
  valset?: {
    nonce?: string;
    members?: { power?: string; ethereumAddress?: string }[];
    height?: string;
    rewardAmount?: string;
    rewardToken?: string;
  };
}

export interface GravityV1QueryDelegateKeysByEthAddressResponse {
  validatorAddress?: string;
  orchestratorAddress?: string;
}

export interface GravityV1QueryDelegateKeysByOrchestratorAddressResponse {
  validatorAddress?: string;
  ethAddress?: string;
}

export interface GravityV1QueryDelegateKeysByValidatorAddressResponse {
  ethAddress?: string;
  orchestratorAddress?: string;
}

export interface GravityV1QueryDenomToERC20Response {
  erc20?: string;
  cosmosOriginated?: boolean;
}

export interface GravityV1QueryERC20ToDenomResponse {
  denom?: string;
  cosmosOriginated?: boolean;
}

export interface GravityV1QueryLastEventNonceByAddrResponse {
  /** @format uint64 */
  eventNonce?: string;
}

export interface GravityV1QueryLastPendingBatchRequestByAddrResponse {
  batch?: {
    batchNonce?: string;
    batchTimeout?: string;
    transactions?: {
      id?: string;
      sender?: string;
      destAddress?: string;
      erc20Token?: { contract?: string; amount?: string };
      erc20Fee?: { contract?: string; amount?: string };
    }[];
    tokenContract?: string;
    block?: string;
  }[];
}

export interface GravityV1QueryLastPendingLogicCallByAddrResponse {
  call?: {
    transfers?: { contract?: string; amount?: string }[];
    fees?: { contract?: string; amount?: string }[];
    logicContractAddress?: string;
    payload?: string;
    timeout?: string;
    invalidationId?: string;
    invalidationNonce?: string;
    block?: string;
  }[];
}

export interface GravityV1QueryLastPendingValsetRequestByAddrResponse {
  valsets?: {
    nonce?: string;
    members?: { power?: string; ethereumAddress?: string }[];
    height?: string;
    rewardAmount?: string;
    rewardToken?: string;
  }[];
}

export interface GravityV1QueryLastValsetRequestsResponse {
  valsets?: {
    nonce?: string;
    members?: { power?: string; ethereumAddress?: string }[];
    height?: string;
    rewardAmount?: string;
    rewardToken?: string;
  }[];
}

export interface GravityV1QueryLogicConfirmsResponse {
  confirms?: {
    invalidationId?: string;
    invalidationNonce?: string;
    ethSigner?: string;
    orchestrator?: string;
    signature?: string;
  }[];
}

export interface GravityV1QueryOutgoingLogicCallsResponse {
  calls?: {
    transfers?: { contract?: string; amount?: string }[];
    fees?: { contract?: string; amount?: string }[];
    logicContractAddress?: string;
    payload?: string;
    timeout?: string;
    invalidationId?: string;
    invalidationNonce?: string;
    block?: string;
  }[];
}

export interface GravityV1QueryOutgoingTxBatchesResponse {
  batches?: {
    batchNonce?: string;
    batchTimeout?: string;
    transactions?: {
      id?: string;
      sender?: string;
      destAddress?: string;
      erc20Token?: { contract?: string; amount?: string };
      erc20Fee?: { contract?: string; amount?: string };
    }[];
    tokenContract?: string;
    block?: string;
  }[];
}

export interface GravityV1QueryParamsResponse {
  /**
   * The slashing fractions for the various gravity related slashing conditions. The first three
   * refer to not submitting a particular message, the third for submitting a different claim
   * for the same Ethereum event
   * unbond_slashing_valsets_window
   *
   * The unbond slashing valsets window is used to determine how many blocks after starting to unbond
   * a validator needs to continue signing blocks. The goal of this paramater is that when a validator leaves
   * the set, if their leaving creates enough change in the validator set to justify an update they will sign
   * a validator set update for the Ethereum bridge that does not include themselves. Allowing us to remove them
   * from the Ethereum bridge and replace them with the new set gracefully.
   * valset_reward
   * These parameters allow for the bridge oracle to resolve a fork on the Ethereum chain without halting
   * the chain. Once set reset bridge state will roll back events to the nonce provided in reset_bridge_nonce
   * if and only if those events have not yet been observed (executed on the Cosmos chain). This allows for easy
   * handling of cases where for example an Ethereum hardfork has occured and more than 1/3 of the vlaidtor set
   * disagrees with the rest. Normally this would require a chain halt, manual genesis editing and restar to resolve
   * with this feature a governance proposal can be used instead
   * bridge_active
   * This boolean flag can be used by governance to temporarily halt the bridge due to a vulnerability or other issue
   * In this context halting the bridge means prevent the execution of any oracle events from Ethereum and preventing
   * the creation of new batches that may be relayed to Ethereum.
   * This does not prevent the creation of validator sets
   * or slashing for not submitting validator set signatures as either of these might allow key signers to leave the validator
   * set and steal funds on Ethereum without consequence.
   * The practical outcome of this flag being set to 'false' is that deposits from Ethereum will not show up and withdraws from
   * Cosmos will not execute on Ethereum.
   */
  params?: {
    gravityId?: string;
    contractSourceHash?: string;
    bridgeEthereumAddress?: string;
    bridgeChainId?: string;
    signedValsetsWindow?: string;
    signedBatchesWindow?: string;
    signedLogicCallsWindow?: string;
    targetBatchTimeout?: string;
    averageBlockTime?: string;
    averageEthereumBlockTime?: string;
    slashFractionValset?: string;
    slashFractionBatch?: string;
    slashFractionLogicCall?: string;
    unbondSlashingValsetsWindow?: string;
    slashFractionBadEthSignature?: string;
    valsetReward?: { denom?: string; amount?: string };
    bridgeActive?: boolean;
    ethereumBlacklist?: string[];
  };
}

export interface GravityV1QueryPendingSendToEthResponse {
  transfersInBatches?: {
    id?: string;
    sender?: string;
    destAddress?: string;
    erc20Token?: { contract?: string; amount?: string };
    erc20Fee?: { contract?: string; amount?: string };
  }[];
  unbatchedTransfers?: {
    id?: string;
    sender?: string;
    destAddress?: string;
    erc20Token?: { contract?: string; amount?: string };
    erc20Fee?: { contract?: string; amount?: string };
  }[];
}

export interface GravityV1QueryValsetConfirmResponse {
  /**
   * MsgValsetConfirm
   * this is the message sent by the validators when they wish to submit their
   * signatures over the validator set at a given block height. A validator must
   * first call MsgSetEthAddress to set their Ethereum address to be used for
   * signing. Then someone (anyone) must make a ValsetRequest, the request is
   * essentially a messaging mechanism to determine which block all validators
   * should submit signatures over. Finally validators sign the validator set,
   * powers, and Ethereum addresses of the entire validator set at the height of a
   * ValsetRequest and submit that signature with this message.
   *
   * If a sufficient number of validators (66% of voting power) (A) have set
   * Ethereum addresses and (B) submit ValsetConfirm messages with their
   * signatures it is then possible for anyone to view these signatures in the
   * chain store and submit them to Ethereum to update the validator set
   * -------------
   */
  confirm?: { nonce?: string; orchestrator?: string; ethAddress?: string; signature?: string };
}

export interface GravityV1QueryValsetConfirmsByNonceResponse {
  confirms?: { nonce?: string; orchestrator?: string; ethAddress?: string; signature?: string }[];
}

export interface GravityV1QueryValsetRequestResponse {
  /**
   * Valset is the Ethereum Bridge Multsig Set, each gravity validator also
   * maintains an ETH key to sign messages, these are used to check signatures on
   * ETH because of the significant gas savings
   */
  valset?: {
    nonce?: string;
    members?: { power?: string; ethereumAddress?: string }[];
    height?: string;
    rewardAmount?: string;
    rewardToken?: string;
  };
}

export interface GravityV1Valset {
  /** @format uint64 */
  nonce?: string;
  members?: { power?: string; ethereumAddress?: string }[];

  /** @format uint64 */
  height?: string;
  rewardAmount?: string;

  /** the reward token in it's Ethereum hex address representation */
  rewardToken?: string;
}

/**
* DenomTrace contains the base denomination for ICS20 fungible tokens and the
source tracing information path.
*/
export interface IbcApplicationsTransferV1DenomTrace {
  /**
   * path defines the chain of port/channel identifiers used for tracing the
   * source of the fungible token.
   */
  path?: string;

  /** base denomination of the relayed fungible token. */
  baseDenom?: string;
}

/**
 * MsgTransferResponse defines the Msg/Transfer response type.
 */
export type IbcApplicationsTransferV1MsgTransferResponse = object;

/**
* Params defines the set of IBC transfer parameters.
NOTE: To prevent a single token from being transferred, set the
TransfersEnabled parameter to true and then set the bank module's SendEnabled
parameter for the denomination to false.
*/
export interface IbcApplicationsTransferV1Params {
  /**
   * send_enabled enables or disables all cross-chain token transfers from this
   * chain.
   */
  sendEnabled?: boolean;

  /**
   * receive_enabled enables or disables all cross-chain token transfers to this
   * chain.
   */
  receiveEnabled?: boolean;
}

/**
* QueryDenomTraceResponse is the response type for the Query/DenomTrace RPC
method.
*/
export interface IbcApplicationsTransferV1QueryDenomTraceResponse {
  /**
   * DenomTrace contains the base denomination for ICS20 fungible tokens and the
   * source tracing information path.
   */
  denomTrace?: { path?: string; baseDenom?: string };
}

/**
* QueryConnectionsResponse is the response type for the Query/DenomTraces RPC
method.
*/
export interface IbcApplicationsTransferV1QueryDenomTracesResponse {
  /** denom_traces returns all denominations trace information. */
  denomTraces?: { path?: string; baseDenom?: string }[];

  /** pagination defines the pagination in the response. */
  pagination?: { nextKey?: string; total?: string };
}

/**
 * QueryParamsResponse is the response type for the Query/Params RPC method.
 */
export interface IbcApplicationsTransferV1QueryParamsResponse {
  /** params defines the parameters of the module. */
  params?: { sendEnabled?: boolean; receiveEnabled?: boolean };
}

/**
* Normally the RevisionHeight is incremented at each height while keeping
RevisionNumber the same. However some consensus algorithms may choose to
reset the height in certain conditions e.g. hard forks, state-machine
breaking changes In these cases, the RevisionNumber is incremented so that
height continues to be monitonically increasing even as the RevisionHeight
gets reset
*/
export interface IbcCoreClientV1Height {
  /**
   * the revision that the client is currently on
   * @format uint64
   */
  revisionNumber?: string;

  /**
   * the height within the given revision
   * @format uint64
   */
  revisionHeight?: string;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  private encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  private addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  private addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(key => "undefined" !== typeof query[key]);
    return keys
      .map(key => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string") ? JSON.stringify(input) : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
            ? JSON.stringify(property)
            : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  private mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  private createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(`${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`, {
      ...requestParams,
      headers: {
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
        ...(requestParams.headers || {}),
      },
      signal: cancelToken ? this.createAbortSignal(cancelToken) : void 0,
      body: typeof body === "undefined" || body === null ? null : payloadFormatter(body),
    }).then(async response => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then(data => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch(e => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title HTTP API Console
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  cosmos = {
    /**
     * No description
     *
     * @tags Query
     * @name CosmosAuthzV1Beta1Grants
     * @summary Returns list of `Authorization`, granted to the grantee by the granter.
     * @request GET:/cosmos/authz/v1beta1/grants
     */
    cosmosAuthzV1Beta1Grants: (
      query?: {
        granter?: string;
        grantee?: string;
        msgTypeUrl?: string;
        "pagination.key"?: string;
        "pagination.offset"?: string;
        "pagination.limit"?: string;
        "pagination.countTotal"?: boolean;
        "pagination.reverse"?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          grants?: { authorization?: { "@type"?: string }; expiration?: string }[];
          pagination?: { nextKey?: string; total?: string };
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/authz/v1beta1/grants`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosBankV1Beta1AllBalances
     * @summary AllBalances queries the balance of all coins for a single account.
     * @request GET:/cosmos/bank/v1beta1/balances/{address}
     */
    cosmosBankV1Beta1AllBalances: (
      address: string,
      query?: {
        "pagination.key"?: string;
        "pagination.offset"?: string;
        "pagination.limit"?: string;
        "pagination.countTotal"?: boolean;
        "pagination.reverse"?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        { balances?: { denom?: string; amount?: string }[]; pagination?: { nextKey?: string; total?: string } },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/bank/v1beta1/balances/${address}`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosBankV1Beta1Balance
     * @summary Balance queries the balance of a single coin for a single account.
     * @request GET:/cosmos/bank/v1beta1/balances/{address}/by_denom
     */
    cosmosBankV1Beta1Balance: (address: string, query?: { denom?: string }, params: RequestParams = {}) =>
      this.request<
        { balance?: { denom?: string; amount?: string } },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/bank/v1beta1/balances/${address}/by_denom`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosBankV1Beta1DenomsMetadata
     * @summary DenomsMetadata queries the client metadata for all registered coin denominations.
     * @request GET:/cosmos/bank/v1beta1/denoms_metadata
     */
    cosmosBankV1Beta1DenomsMetadata: (
      query?: {
        "pagination.key"?: string;
        "pagination.offset"?: string;
        "pagination.limit"?: string;
        "pagination.countTotal"?: boolean;
        "pagination.reverse"?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          metadatas?: {
            description?: string;
            denomUnits?: { denom?: string; exponent?: number; aliases?: string[] }[];
            base?: string;
            display?: string;
            name?: string;
            symbol?: string;
          }[];
          pagination?: { nextKey?: string; total?: string };
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/bank/v1beta1/denoms_metadata`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosBankV1Beta1DenomMetadata
     * @summary DenomsMetadata queries the client metadata of a given coin denomination.
     * @request GET:/cosmos/bank/v1beta1/denoms_metadata/{denom}
     */
    cosmosBankV1Beta1DenomMetadata: (denom: string, params: RequestParams = {}) =>
      this.request<
        {
          metadata?: {
            description?: string;
            denomUnits?: { denom?: string; exponent?: number; aliases?: string[] }[];
            base?: string;
            display?: string;
            name?: string;
            symbol?: string;
          };
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/bank/v1beta1/denoms_metadata/${denom}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosBankV1Beta1Params
     * @summary Params queries the parameters of x/bank module.
     * @request GET:/cosmos/bank/v1beta1/params
     */
    cosmosBankV1Beta1Params: (params: RequestParams = {}) =>
      this.request<
        { params?: { sendEnabled?: { denom?: string; enabled?: boolean }[]; defaultSendEnabled?: boolean } },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/bank/v1beta1/params`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosBankV1Beta1TotalSupply
     * @summary TotalSupply queries the total supply of all coins.
     * @request GET:/cosmos/bank/v1beta1/supply
     */
    cosmosBankV1Beta1TotalSupply: (
      query?: {
        "pagination.key"?: string;
        "pagination.offset"?: string;
        "pagination.limit"?: string;
        "pagination.countTotal"?: boolean;
        "pagination.reverse"?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        { supply?: { denom?: string; amount?: string }[]; pagination?: { nextKey?: string; total?: string } },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/bank/v1beta1/supply`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosBankV1Beta1SupplyOf
     * @summary SupplyOf queries the supply of a single coin.
     * @request GET:/cosmos/bank/v1beta1/supply/{denom}
     */
    cosmosBankV1Beta1SupplyOf: (denom: string, params: RequestParams = {}) =>
      this.request<
        { amount?: { denom?: string; amount?: string } },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/bank/v1beta1/supply/${denom}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosDistributionV1Beta1CommunityPool
     * @summary CommunityPool queries the community pool coins.
     * @request GET:/cosmos/distribution/v1beta1/community_pool
     */
    cosmosDistributionV1Beta1CommunityPool: (params: RequestParams = {}) =>
      this.request<
        { pool?: { denom?: string; amount?: string }[] },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/distribution/v1beta1/community_pool`,
        method: "GET",
        ...params,
      }),

    /**
 * No description
 * 
 * @tags Query
 * @name CosmosDistributionV1Beta1DelegationTotalRewards
 * @summary DelegationTotalRewards queries the total rewards accrued by a each
validator.
 * @request GET:/cosmos/distribution/v1beta1/delegators/{delegatorAddress}/rewards
 */
    cosmosDistributionV1Beta1DelegationTotalRewards: (delegatorAddress: string, params: RequestParams = {}) =>
      this.request<
        {
          rewards?: { validatorAddress?: string; reward?: { denom?: string; amount?: string }[] }[];
          total?: { denom?: string; amount?: string }[];
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/distribution/v1beta1/delegators/${delegatorAddress}/rewards`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosDistributionV1Beta1DelegationRewards
     * @summary DelegationRewards queries the total rewards accrued by a delegation.
     * @request GET:/cosmos/distribution/v1beta1/delegators/{delegatorAddress}/rewards/{validatorAddress}
     */
    cosmosDistributionV1Beta1DelegationRewards: (
      delegatorAddress: string,
      validatorAddress: string,
      params: RequestParams = {},
    ) =>
      this.request<
        { rewards?: { denom?: string; amount?: string }[] },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/distribution/v1beta1/delegators/${delegatorAddress}/rewards/${validatorAddress}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosDistributionV1Beta1DelegatorValidators
     * @summary DelegatorValidators queries the validators of a delegator.
     * @request GET:/cosmos/distribution/v1beta1/delegators/{delegatorAddress}/validators
     */
    cosmosDistributionV1Beta1DelegatorValidators: (delegatorAddress: string, params: RequestParams = {}) =>
      this.request<{ validators?: string[] }, { code?: number; message?: string; details?: { "@type"?: string }[] }>({
        path: `/cosmos/distribution/v1beta1/delegators/${delegatorAddress}/validators`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosDistributionV1Beta1DelegatorWithdrawAddress
     * @summary DelegatorWithdrawAddress queries withdraw address of a delegator.
     * @request GET:/cosmos/distribution/v1beta1/delegators/{delegatorAddress}/withdraw_address
     */
    cosmosDistributionV1Beta1DelegatorWithdrawAddress: (delegatorAddress: string, params: RequestParams = {}) =>
      this.request<{ withdrawAddress?: string }, { code?: number; message?: string; details?: { "@type"?: string }[] }>(
        {
          path: `/cosmos/distribution/v1beta1/delegators/${delegatorAddress}/withdraw_address`,
          method: "GET",
          ...params,
        },
      ),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosDistributionV1Beta1Params
     * @summary Params queries params of the distribution module.
     * @request GET:/cosmos/distribution/v1beta1/params
     */
    cosmosDistributionV1Beta1Params: (params: RequestParams = {}) =>
      this.request<
        {
          params?: {
            communityTax?: string;
            baseProposerReward?: string;
            bonusProposerReward?: string;
            withdrawAddrEnabled?: boolean;
          };
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/distribution/v1beta1/params`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosDistributionV1Beta1ValidatorCommission
     * @summary ValidatorCommission queries accumulated commission for a validator.
     * @request GET:/cosmos/distribution/v1beta1/validators/{validatorAddress}/commission
     */
    cosmosDistributionV1Beta1ValidatorCommission: (validatorAddress: string, params: RequestParams = {}) =>
      this.request<
        { commission?: { commission?: { denom?: string; amount?: string }[] } },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/distribution/v1beta1/validators/${validatorAddress}/commission`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosDistributionV1Beta1ValidatorOutstandingRewards
     * @summary ValidatorOutstandingRewards queries rewards of a validator address.
     * @request GET:/cosmos/distribution/v1beta1/validators/{validatorAddress}/outstanding_rewards
     */
    cosmosDistributionV1Beta1ValidatorOutstandingRewards: (validatorAddress: string, params: RequestParams = {}) =>
      this.request<
        { rewards?: { rewards?: { denom?: string; amount?: string }[] } },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/distribution/v1beta1/validators/${validatorAddress}/outstanding_rewards`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosDistributionV1Beta1ValidatorSlashes
     * @summary ValidatorSlashes queries slash events of a validator.
     * @request GET:/cosmos/distribution/v1beta1/validators/{validatorAddress}/slashes
     */
    cosmosDistributionV1Beta1ValidatorSlashes: (
      validatorAddress: string,
      query?: {
        startingHeight?: string;
        endingHeight?: string;
        "pagination.key"?: string;
        "pagination.offset"?: string;
        "pagination.limit"?: string;
        "pagination.countTotal"?: boolean;
        "pagination.reverse"?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          slashes?: { validatorPeriod?: string; fraction?: string }[];
          pagination?: { nextKey?: string; total?: string };
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/distribution/v1beta1/validators/${validatorAddress}/slashes`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosEvidenceV1Beta1AllEvidence
     * @summary AllEvidence queries all evidence.
     * @request GET:/cosmos/evidence/v1beta1/evidence
     */
    cosmosEvidenceV1Beta1AllEvidence: (
      query?: {
        "pagination.key"?: string;
        "pagination.offset"?: string;
        "pagination.limit"?: string;
        "pagination.countTotal"?: boolean;
        "pagination.reverse"?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        { evidence?: { "@type"?: string }[]; pagination?: { nextKey?: string; total?: string } },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/evidence/v1beta1/evidence`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosEvidenceV1Beta1Evidence
     * @summary Evidence queries evidence based on evidence hash.
     * @request GET:/cosmos/evidence/v1beta1/evidence/{evidenceHash}
     */
    cosmosEvidenceV1Beta1Evidence: (evidenceHash: string, params: RequestParams = {}) =>
      this.request<
        { evidence?: { "@type"?: string } },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/evidence/v1beta1/evidence/${evidenceHash}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosFeegrantV1Beta1Allowance
     * @summary Allowance returns fee granted to the grantee by the granter.
     * @request GET:/cosmos/feegrant/v1beta1/allowance/{granter}/{grantee}
     */
    cosmosFeegrantV1Beta1Allowance: (granter: string, grantee: string, params: RequestParams = {}) =>
      this.request<
        { allowance?: { granter?: string; grantee?: string; allowance?: { "@type"?: string } } },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/feegrant/v1beta1/allowance/${granter}/${grantee}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosFeegrantV1Beta1Allowances
     * @summary Allowances returns all the grants for address.
     * @request GET:/cosmos/feegrant/v1beta1/allowances/{grantee}
     */
    cosmosFeegrantV1Beta1Allowances: (
      grantee: string,
      query?: {
        "pagination.key"?: string;
        "pagination.offset"?: string;
        "pagination.limit"?: string;
        "pagination.countTotal"?: boolean;
        "pagination.reverse"?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          allowances?: { granter?: string; grantee?: string; allowance?: { "@type"?: string } }[];
          pagination?: { nextKey?: string; total?: string };
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/feegrant/v1beta1/allowances/${grantee}`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosGovV1Beta1Params
     * @summary Params queries all parameters of the gov module.
     * @request GET:/cosmos/gov/v1beta1/params/{paramsType}
     */
    cosmosGovV1Beta1Params: (paramsType: string, params: RequestParams = {}) =>
      this.request<
        {
          votingParams?: { votingPeriod?: string };
          depositParams?: { minDeposit?: { denom?: string; amount?: string }[]; maxDepositPeriod?: string };
          tallyParams?: { quorum?: string; threshold?: string; vetoThreshold?: string };
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/gov/v1beta1/params/${paramsType}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosGovV1Beta1Proposals
     * @summary Proposals queries all proposals based on given status.
     * @request GET:/cosmos/gov/v1beta1/proposals
     */
    cosmosGovV1Beta1Proposals: (
      query?: {
        proposalStatus?:
          | "PROPOSAL_STATUS_UNSPECIFIED"
          | "PROPOSAL_STATUS_DEPOSIT_PERIOD"
          | "PROPOSAL_STATUS_VOTING_PERIOD"
          | "PROPOSAL_STATUS_PASSED"
          | "PROPOSAL_STATUS_REJECTED"
          | "PROPOSAL_STATUS_FAILED";
        voter?: string;
        depositor?: string;
        "pagination.key"?: string;
        "pagination.offset"?: string;
        "pagination.limit"?: string;
        "pagination.countTotal"?: boolean;
        "pagination.reverse"?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          proposals?: {
            proposalId?: string;
            content?: { "@type"?: string };
            status?:
              | "PROPOSAL_STATUS_UNSPECIFIED"
              | "PROPOSAL_STATUS_DEPOSIT_PERIOD"
              | "PROPOSAL_STATUS_VOTING_PERIOD"
              | "PROPOSAL_STATUS_PASSED"
              | "PROPOSAL_STATUS_REJECTED"
              | "PROPOSAL_STATUS_FAILED";
            finalTallyResult?: { yes?: string; abstain?: string; no?: string; noWithVeto?: string };
            submitTime?: string;
            depositEndTime?: string;
            totalDeposit?: { denom?: string; amount?: string }[];
            votingStartTime?: string;
            votingEndTime?: string;
          }[];
          pagination?: { nextKey?: string; total?: string };
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/gov/v1beta1/proposals`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosGovV1Beta1Proposal
     * @summary Proposal queries proposal details based on ProposalID.
     * @request GET:/cosmos/gov/v1beta1/proposals/{proposalId}
     */
    cosmosGovV1Beta1Proposal: (proposalId: string, params: RequestParams = {}) =>
      this.request<
        {
          proposal?: {
            proposalId?: string;
            content?: { "@type"?: string };
            status?:
              | "PROPOSAL_STATUS_UNSPECIFIED"
              | "PROPOSAL_STATUS_DEPOSIT_PERIOD"
              | "PROPOSAL_STATUS_VOTING_PERIOD"
              | "PROPOSAL_STATUS_PASSED"
              | "PROPOSAL_STATUS_REJECTED"
              | "PROPOSAL_STATUS_FAILED";
            finalTallyResult?: { yes?: string; abstain?: string; no?: string; noWithVeto?: string };
            submitTime?: string;
            depositEndTime?: string;
            totalDeposit?: { denom?: string; amount?: string }[];
            votingStartTime?: string;
            votingEndTime?: string;
          };
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/gov/v1beta1/proposals/${proposalId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosGovV1Beta1Deposits
     * @summary Deposits queries all deposits of a single proposal.
     * @request GET:/cosmos/gov/v1beta1/proposals/{proposalId}/deposits
     */
    cosmosGovV1Beta1Deposits: (
      proposalId: string,
      query?: {
        "pagination.key"?: string;
        "pagination.offset"?: string;
        "pagination.limit"?: string;
        "pagination.countTotal"?: boolean;
        "pagination.reverse"?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          deposits?: { proposalId?: string; depositor?: string; amount?: { denom?: string; amount?: string }[] }[];
          pagination?: { nextKey?: string; total?: string };
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/gov/v1beta1/proposals/${proposalId}/deposits`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosGovV1Beta1Deposit
     * @summary Deposit queries single deposit information based proposalID, depositAddr.
     * @request GET:/cosmos/gov/v1beta1/proposals/{proposalId}/deposits/{depositor}
     */
    cosmosGovV1Beta1Deposit: (proposalId: string, depositor: string, params: RequestParams = {}) =>
      this.request<
        { deposit?: { proposalId?: string; depositor?: string; amount?: { denom?: string; amount?: string }[] } },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/gov/v1beta1/proposals/${proposalId}/deposits/${depositor}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosGovV1Beta1TallyResult
     * @summary TallyResult queries the tally of a proposal vote.
     * @request GET:/cosmos/gov/v1beta1/proposals/{proposalId}/tally
     */
    cosmosGovV1Beta1TallyResult: (proposalId: string, params: RequestParams = {}) =>
      this.request<
        { tally?: { yes?: string; abstain?: string; no?: string; noWithVeto?: string } },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/gov/v1beta1/proposals/${proposalId}/tally`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosGovV1Beta1Votes
     * @summary Votes queries votes of a given proposal.
     * @request GET:/cosmos/gov/v1beta1/proposals/{proposalId}/votes
     */
    cosmosGovV1Beta1Votes: (
      proposalId: string,
      query?: {
        "pagination.key"?: string;
        "pagination.offset"?: string;
        "pagination.limit"?: string;
        "pagination.countTotal"?: boolean;
        "pagination.reverse"?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          votes?: {
            proposalId?: string;
            voter?: string;
            option?:
              | "VOTE_OPTION_UNSPECIFIED"
              | "VOTE_OPTION_YES"
              | "VOTE_OPTION_ABSTAIN"
              | "VOTE_OPTION_NO"
              | "VOTE_OPTION_NO_WITH_VETO";
            options?: {
              option?:
                | "VOTE_OPTION_UNSPECIFIED"
                | "VOTE_OPTION_YES"
                | "VOTE_OPTION_ABSTAIN"
                | "VOTE_OPTION_NO"
                | "VOTE_OPTION_NO_WITH_VETO";
              weight?: string;
            }[];
          }[];
          pagination?: { nextKey?: string; total?: string };
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/gov/v1beta1/proposals/${proposalId}/votes`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosGovV1Beta1Vote
     * @summary Vote queries voted information based on proposalID, voterAddr.
     * @request GET:/cosmos/gov/v1beta1/proposals/{proposalId}/votes/{voter}
     */
    cosmosGovV1Beta1Vote: (proposalId: string, voter: string, params: RequestParams = {}) =>
      this.request<
        {
          vote?: {
            proposalId?: string;
            voter?: string;
            option?:
              | "VOTE_OPTION_UNSPECIFIED"
              | "VOTE_OPTION_YES"
              | "VOTE_OPTION_ABSTAIN"
              | "VOTE_OPTION_NO"
              | "VOTE_OPTION_NO_WITH_VETO";
            options?: {
              option?:
                | "VOTE_OPTION_UNSPECIFIED"
                | "VOTE_OPTION_YES"
                | "VOTE_OPTION_ABSTAIN"
                | "VOTE_OPTION_NO"
                | "VOTE_OPTION_NO_WITH_VETO";
              weight?: string;
            }[];
          };
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/gov/v1beta1/proposals/${proposalId}/votes/${voter}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosSlashingV1Beta1Params
     * @summary Params queries the parameters of slashing module
     * @request GET:/cosmos/slashing/v1beta1/params
     */
    cosmosSlashingV1Beta1Params: (params: RequestParams = {}) =>
      this.request<
        {
          params?: {
            signedBlocksWindow?: string;
            minSignedPerWindow?: string;
            downtimeJailDuration?: string;
            slashFractionDoubleSign?: string;
            slashFractionDowntime?: string;
          };
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/slashing/v1beta1/params`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosSlashingV1Beta1SigningInfos
     * @summary SigningInfos queries signing info of all validators
     * @request GET:/cosmos/slashing/v1beta1/signing_infos
     */
    cosmosSlashingV1Beta1SigningInfos: (
      query?: {
        "pagination.key"?: string;
        "pagination.offset"?: string;
        "pagination.limit"?: string;
        "pagination.countTotal"?: boolean;
        "pagination.reverse"?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          info?: {
            address?: string;
            startHeight?: string;
            indexOffset?: string;
            jailedUntil?: string;
            tombstoned?: boolean;
            missedBlocksCounter?: string;
          }[];
          pagination?: { nextKey?: string; total?: string };
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/slashing/v1beta1/signing_infos`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosSlashingV1Beta1SigningInfo
     * @summary SigningInfo queries the signing info of given cons address
     * @request GET:/cosmos/slashing/v1beta1/signing_infos/{consAddress}
     */
    cosmosSlashingV1Beta1SigningInfo: (consAddress: string, params: RequestParams = {}) =>
      this.request<
        {
          valSigningInfo?: {
            address?: string;
            startHeight?: string;
            indexOffset?: string;
            jailedUntil?: string;
            tombstoned?: boolean;
            missedBlocksCounter?: string;
          };
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/slashing/v1beta1/signing_infos/${consAddress}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosStakingV1Beta1DelegatorDelegations
     * @summary DelegatorDelegations queries all delegations of a given delegator address.
     * @request GET:/cosmos/staking/v1beta1/delegations/{delegatorAddr}
     */
    cosmosStakingV1Beta1DelegatorDelegations: (
      delegatorAddr: string,
      query?: {
        "pagination.key"?: string;
        "pagination.offset"?: string;
        "pagination.limit"?: string;
        "pagination.countTotal"?: boolean;
        "pagination.reverse"?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          delegationResponses?: {
            delegation?: { delegatorAddress?: string; validatorAddress?: string; shares?: string };
            balance?: { denom?: string; amount?: string };
          }[];
          pagination?: { nextKey?: string; total?: string };
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/staking/v1beta1/delegations/${delegatorAddr}`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosStakingV1Beta1Redelegations
     * @summary Redelegations queries redelegations of given address.
     * @request GET:/cosmos/staking/v1beta1/delegators/{delegatorAddr}/redelegations
     */
    cosmosStakingV1Beta1Redelegations: (
      delegatorAddr: string,
      query?: {
        srcValidatorAddr?: string;
        dstValidatorAddr?: string;
        "pagination.key"?: string;
        "pagination.offset"?: string;
        "pagination.limit"?: string;
        "pagination.countTotal"?: boolean;
        "pagination.reverse"?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          redelegationResponses?: {
            redelegation?: {
              delegatorAddress?: string;
              validatorSrcAddress?: string;
              validatorDstAddress?: string;
              entries?: {
                creationHeight?: string;
                completionTime?: string;
                initialBalance?: string;
                sharesDst?: string;
              }[];
            };
            entries?: {
              redelegationEntry?: {
                creationHeight?: string;
                completionTime?: string;
                initialBalance?: string;
                sharesDst?: string;
              };
              balance?: string;
            }[];
          }[];
          pagination?: { nextKey?: string; total?: string };
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/staking/v1beta1/delegators/${delegatorAddr}/redelegations`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
 * No description
 * 
 * @tags Query
 * @name CosmosStakingV1Beta1DelegatorUnbondingDelegations
 * @summary DelegatorUnbondingDelegations queries all unbonding delegations of a given
delegator address.
 * @request GET:/cosmos/staking/v1beta1/delegators/{delegatorAddr}/unbonding_delegations
 */
    cosmosStakingV1Beta1DelegatorUnbondingDelegations: (
      delegatorAddr: string,
      query?: {
        "pagination.key"?: string;
        "pagination.offset"?: string;
        "pagination.limit"?: string;
        "pagination.countTotal"?: boolean;
        "pagination.reverse"?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          unbondingResponses?: {
            delegatorAddress?: string;
            validatorAddress?: string;
            entries?: { creationHeight?: string; completionTime?: string; initialBalance?: string; balance?: string }[];
          }[];
          pagination?: { nextKey?: string; total?: string };
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/staking/v1beta1/delegators/${delegatorAddr}/unbonding_delegations`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
 * No description
 * 
 * @tags Query
 * @name CosmosStakingV1Beta1DelegatorValidators
 * @summary DelegatorValidators queries all validators info for given delegator
address.
 * @request GET:/cosmos/staking/v1beta1/delegators/{delegatorAddr}/validators
 */
    cosmosStakingV1Beta1DelegatorValidators: (
      delegatorAddr: string,
      query?: {
        "pagination.key"?: string;
        "pagination.offset"?: string;
        "pagination.limit"?: string;
        "pagination.countTotal"?: boolean;
        "pagination.reverse"?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          validators?: {
            operatorAddress?: string;
            consensusPubkey?: { "@type"?: string };
            jailed?: boolean;
            status?:
              | "BOND_STATUS_UNSPECIFIED"
              | "BOND_STATUS_UNBONDED"
              | "BOND_STATUS_UNBONDING"
              | "BOND_STATUS_BONDED";
            tokens?: string;
            delegatorShares?: string;
            description?: {
              moniker?: string;
              identity?: string;
              website?: string;
              securityContact?: string;
              details?: string;
            };
            unbondingHeight?: string;
            unbondingTime?: string;
            commission?: {
              commissionRates?: { rate?: string; maxRate?: string; maxChangeRate?: string };
              updateTime?: string;
            };
            minSelfDelegation?: string;
          }[];
          pagination?: { nextKey?: string; total?: string };
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/staking/v1beta1/delegators/${delegatorAddr}/validators`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
 * No description
 * 
 * @tags Query
 * @name CosmosStakingV1Beta1DelegatorValidator
 * @summary DelegatorValidator queries validator info for given delegator validator
pair.
 * @request GET:/cosmos/staking/v1beta1/delegators/{delegatorAddr}/validators/{validatorAddr}
 */
    cosmosStakingV1Beta1DelegatorValidator: (
      delegatorAddr: string,
      validatorAddr: string,
      params: RequestParams = {},
    ) =>
      this.request<
        {
          validator?: {
            operatorAddress?: string;
            consensusPubkey?: { "@type"?: string };
            jailed?: boolean;
            status?:
              | "BOND_STATUS_UNSPECIFIED"
              | "BOND_STATUS_UNBONDED"
              | "BOND_STATUS_UNBONDING"
              | "BOND_STATUS_BONDED";
            tokens?: string;
            delegatorShares?: string;
            description?: {
              moniker?: string;
              identity?: string;
              website?: string;
              securityContact?: string;
              details?: string;
            };
            unbondingHeight?: string;
            unbondingTime?: string;
            commission?: {
              commissionRates?: { rate?: string; maxRate?: string; maxChangeRate?: string };
              updateTime?: string;
            };
            minSelfDelegation?: string;
          };
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/staking/v1beta1/delegators/${delegatorAddr}/validators/${validatorAddr}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosStakingV1Beta1HistoricalInfo
     * @summary HistoricalInfo queries the historical info for given height.
     * @request GET:/cosmos/staking/v1beta1/historical_info/{height}
     */
    cosmosStakingV1Beta1HistoricalInfo: (height: string, params: RequestParams = {}) =>
      this.request<
        {
          hist?: {
            header?: {
              version?: { block?: string; app?: string };
              chainId?: string;
              height?: string;
              time?: string;
              lastBlockId?: { hash?: string; partSetHeader?: { total?: number; hash?: string } };
              lastCommitHash?: string;
              dataHash?: string;
              validatorsHash?: string;
              nextValidatorsHash?: string;
              consensusHash?: string;
              appHash?: string;
              lastResultsHash?: string;
              evidenceHash?: string;
              proposerAddress?: string;
            };
            valset?: {
              operatorAddress?: string;
              consensusPubkey?: { "@type"?: string };
              jailed?: boolean;
              status?:
                | "BOND_STATUS_UNSPECIFIED"
                | "BOND_STATUS_UNBONDED"
                | "BOND_STATUS_UNBONDING"
                | "BOND_STATUS_BONDED";
              tokens?: string;
              delegatorShares?: string;
              description?: {
                moniker?: string;
                identity?: string;
                website?: string;
                securityContact?: string;
                details?: string;
              };
              unbondingHeight?: string;
              unbondingTime?: string;
              commission?: {
                commissionRates?: { rate?: string; maxRate?: string; maxChangeRate?: string };
                updateTime?: string;
              };
              minSelfDelegation?: string;
            }[];
          };
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/staking/v1beta1/historical_info/${height}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosStakingV1Beta1Params
     * @summary Parameters queries the staking parameters.
     * @request GET:/cosmos/staking/v1beta1/params
     */
    cosmosStakingV1Beta1Params: (params: RequestParams = {}) =>
      this.request<
        {
          params?: {
            unbondingTime?: string;
            maxValidators?: number;
            maxEntries?: number;
            historicalEntries?: number;
            bondDenom?: string;
          };
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/staking/v1beta1/params`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosStakingV1Beta1Pool
     * @summary Pool queries the pool info.
     * @request GET:/cosmos/staking/v1beta1/pool
     */
    cosmosStakingV1Beta1Pool: (params: RequestParams = {}) =>
      this.request<
        { pool?: { notBondedTokens?: string; bondedTokens?: string } },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/staking/v1beta1/pool`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosStakingV1Beta1Validators
     * @summary Validators queries all validators that match the given status.
     * @request GET:/cosmos/staking/v1beta1/validators
     */
    cosmosStakingV1Beta1Validators: (
      query?: {
        status?: string;
        "pagination.key"?: string;
        "pagination.offset"?: string;
        "pagination.limit"?: string;
        "pagination.countTotal"?: boolean;
        "pagination.reverse"?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          validators?: {
            operatorAddress?: string;
            consensusPubkey?: { "@type"?: string };
            jailed?: boolean;
            status?:
              | "BOND_STATUS_UNSPECIFIED"
              | "BOND_STATUS_UNBONDED"
              | "BOND_STATUS_UNBONDING"
              | "BOND_STATUS_BONDED";
            tokens?: string;
            delegatorShares?: string;
            description?: {
              moniker?: string;
              identity?: string;
              website?: string;
              securityContact?: string;
              details?: string;
            };
            unbondingHeight?: string;
            unbondingTime?: string;
            commission?: {
              commissionRates?: { rate?: string; maxRate?: string; maxChangeRate?: string };
              updateTime?: string;
            };
            minSelfDelegation?: string;
          }[];
          pagination?: { nextKey?: string; total?: string };
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/staking/v1beta1/validators`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosStakingV1Beta1Validator
     * @summary Validator queries validator info for given validator address.
     * @request GET:/cosmos/staking/v1beta1/validators/{validatorAddr}
     */
    cosmosStakingV1Beta1Validator: (validatorAddr: string, params: RequestParams = {}) =>
      this.request<
        {
          validator?: {
            operatorAddress?: string;
            consensusPubkey?: { "@type"?: string };
            jailed?: boolean;
            status?:
              | "BOND_STATUS_UNSPECIFIED"
              | "BOND_STATUS_UNBONDED"
              | "BOND_STATUS_UNBONDING"
              | "BOND_STATUS_BONDED";
            tokens?: string;
            delegatorShares?: string;
            description?: {
              moniker?: string;
              identity?: string;
              website?: string;
              securityContact?: string;
              details?: string;
            };
            unbondingHeight?: string;
            unbondingTime?: string;
            commission?: {
              commissionRates?: { rate?: string; maxRate?: string; maxChangeRate?: string };
              updateTime?: string;
            };
            minSelfDelegation?: string;
          };
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/staking/v1beta1/validators/${validatorAddr}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosStakingV1Beta1ValidatorDelegations
     * @summary ValidatorDelegations queries delegate info for given validator.
     * @request GET:/cosmos/staking/v1beta1/validators/{validatorAddr}/delegations
     */
    cosmosStakingV1Beta1ValidatorDelegations: (
      validatorAddr: string,
      query?: {
        "pagination.key"?: string;
        "pagination.offset"?: string;
        "pagination.limit"?: string;
        "pagination.countTotal"?: boolean;
        "pagination.reverse"?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          delegationResponses?: {
            delegation?: { delegatorAddress?: string; validatorAddress?: string; shares?: string };
            balance?: { denom?: string; amount?: string };
          }[];
          pagination?: { nextKey?: string; total?: string };
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/staking/v1beta1/validators/${validatorAddr}/delegations`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosStakingV1Beta1Delegation
     * @summary Delegation queries delegate info for given validator delegator pair.
     * @request GET:/cosmos/staking/v1beta1/validators/{validatorAddr}/delegations/{delegatorAddr}
     */
    cosmosStakingV1Beta1Delegation: (validatorAddr: string, delegatorAddr: string, params: RequestParams = {}) =>
      this.request<
        {
          delegationResponse?: {
            delegation?: { delegatorAddress?: string; validatorAddress?: string; shares?: string };
            balance?: { denom?: string; amount?: string };
          };
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/staking/v1beta1/validators/${validatorAddr}/delegations/${delegatorAddr}`,
        method: "GET",
        ...params,
      }),

    /**
 * No description
 * 
 * @tags Query
 * @name CosmosStakingV1Beta1UnbondingDelegation
 * @summary UnbondingDelegation queries unbonding info for given validator delegator
pair.
 * @request GET:/cosmos/staking/v1beta1/validators/{validatorAddr}/delegations/{delegatorAddr}/unbonding_delegation
 */
    cosmosStakingV1Beta1UnbondingDelegation: (
      validatorAddr: string,
      delegatorAddr: string,
      params: RequestParams = {},
    ) =>
      this.request<
        {
          unbond?: {
            delegatorAddress?: string;
            validatorAddress?: string;
            entries?: { creationHeight?: string; completionTime?: string; initialBalance?: string; balance?: string }[];
          };
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/staking/v1beta1/validators/${validatorAddr}/delegations/${delegatorAddr}/unbonding_delegation`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name CosmosStakingV1Beta1ValidatorUnbondingDelegations
     * @summary ValidatorUnbondingDelegations queries unbonding delegations of a validator.
     * @request GET:/cosmos/staking/v1beta1/validators/{validatorAddr}/unbonding_delegations
     */
    cosmosStakingV1Beta1ValidatorUnbondingDelegations: (
      validatorAddr: string,
      query?: {
        "pagination.key"?: string;
        "pagination.offset"?: string;
        "pagination.limit"?: string;
        "pagination.countTotal"?: boolean;
        "pagination.reverse"?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          unbondingResponses?: {
            delegatorAddress?: string;
            validatorAddress?: string;
            entries?: { creationHeight?: string; completionTime?: string; initialBalance?: string; balance?: string }[];
          }[];
          pagination?: { nextKey?: string; total?: string };
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/cosmos/staking/v1beta1/validators/${validatorAddr}/unbonding_delegations`,
        method: "GET",
        query: query,
        ...params,
      }),
  };
  gravity = {
    /**
     * No description
     *
     * @tags Msg
     * @name GravityV1BatchSendToEthClaim
     * @request POST:/gravity/v1/batch_send_to_eth_claim
     */
    gravityV1BatchSendToEthClaim: (
      query?: {
        eventNonce?: string;
        blockHeight?: string;
        batchNonce?: string;
        tokenContract?: string;
        orchestrator?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        CosmosAuthzV1Beta1MsgGrantResponse,
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1/batch_send_to_eth_claim`,
        method: "POST",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Msg
     * @name GravityV1CancelSendToEth
     * @request POST:/gravity/v1/cancel_send_to_eth
     */
    gravityV1CancelSendToEth: (query?: { transactionId?: string; sender?: string }, params: RequestParams = {}) =>
      this.request<
        CosmosAuthzV1Beta1MsgGrantResponse,
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1/cancel_send_to_eth`,
        method: "POST",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Msg
     * @name GravityV1ConfirmLogicCall
     * @request POST:/gravity/v1/confim_logic
     */
    gravityV1ConfirmLogicCall: (
      query?: {
        invalidationId?: string;
        invalidationNonce?: string;
        ethSigner?: string;
        orchestrator?: string;
        signature?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        CosmosAuthzV1Beta1MsgGrantResponse,
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1/confim_logic`,
        method: "POST",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Msg
     * @name GravityV1ConfirmBatch
     * @request POST:/gravity/v1/confirm_batch
     */
    gravityV1ConfirmBatch: (
      query?: { nonce?: string; tokenContract?: string; ethSigner?: string; orchestrator?: string; signature?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        CosmosAuthzV1Beta1MsgGrantResponse,
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1/confirm_batch`,
        method: "POST",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Msg
     * @name GravityV1Erc20DeployedClaim
     * @request POST:/gravity/v1/erc20_deployed_claim
     */
    gravityV1Erc20DeployedClaim: (
      query?: {
        eventNonce?: string;
        blockHeight?: string;
        cosmosDenom?: string;
        tokenContract?: string;
        name?: string;
        symbol?: string;
        decimals?: string;
        orchestrator?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        CosmosAuthzV1Beta1MsgGrantResponse,
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1/erc20_deployed_claim`,
        method: "POST",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Msg
     * @name GravityV1LogicCallExecutedClaim
     * @request POST:/gravity/v1/logic_call_executed_claim
     */
    gravityV1LogicCallExecutedClaim: (
      query?: {
        eventNonce?: string;
        blockHeight?: string;
        invalidationId?: string;
        invalidationNonce?: string;
        orchestrator?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        CosmosAuthzV1Beta1MsgGrantResponse,
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1/logic_call_executed_claim`,
        method: "POST",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Msg
     * @name GravityV1RequestBatch
     * @request POST:/gravity/v1/request_batch
     */
    gravityV1RequestBatch: (query?: { sender?: string; denom?: string }, params: RequestParams = {}) =>
      this.request<
        CosmosAuthzV1Beta1MsgGrantResponse,
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1/request_batch`,
        method: "POST",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Msg
     * @name GravityV1SendToCosmosClaim
     * @request POST:/gravity/v1/send_to_cosmos_claim
     */
    gravityV1SendToCosmosClaim: (
      query?: {
        eventNonce?: string;
        blockHeight?: string;
        tokenContract?: string;
        amount?: string;
        ethereumSender?: string;
        cosmosReceiver?: string;
        orchestrator?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        CosmosAuthzV1Beta1MsgGrantResponse,
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1/send_to_cosmos_claim`,
        method: "POST",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Msg
     * @name GravityV1SendToEth
     * @request POST:/gravity/v1/send_to_eth
     */
    gravityV1SendToEth: (
      query?: {
        sender?: string;
        ethDest?: string;
        "amount.denom"?: string;
        "amount.amount"?: string;
        "bridgeFee.denom"?: string;
        "bridgeFee.amount"?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        CosmosAuthzV1Beta1MsgGrantResponse,
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1/send_to_eth`,
        method: "POST",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Msg
     * @name GravityV1SetOrchestratorAddress
     * @request POST:/gravity/v1/set_orchestrator_address
     */
    gravityV1SetOrchestratorAddress: (
      query?: { validator?: string; orchestrator?: string; ethAddress?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        CosmosAuthzV1Beta1MsgGrantResponse,
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1/set_orchestrator_address`,
        method: "POST",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Msg
     * @name GravityV1SubmitBadSignatureEvidence
     * @request POST:/gravity/v1/submit_bad_signature_evidence
     */
    gravityV1SubmitBadSignatureEvidence: (
      query?: { "subject.typeUrl"?: string; "subject.value"?: string; signature?: string; sender?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        CosmosAuthzV1Beta1MsgGrantResponse,
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1/submit_bad_signature_evidence`,
        method: "POST",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Msg
     * @name GravityV1ValsetConfirm
     * @request POST:/gravity/v1/valset_confirm
     */
    gravityV1ValsetConfirm: (
      query?: { nonce?: string; orchestrator?: string; ethAddress?: string; signature?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        CosmosAuthzV1Beta1MsgGrantResponse,
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1/valset_confirm`,
        method: "POST",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Msg
     * @name GravityV1ValsetUpdateClaim
     * @request POST:/gravity/v1/valset_updated_claim
     */
    gravityV1ValsetUpdateClaim: (
      query?: {
        eventNonce?: string;
        valsetNonce?: string;
        blockHeight?: string;
        rewardAmount?: string;
        rewardToken?: string;
        orchestrator?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        CosmosAuthzV1Beta1MsgGrantResponse,
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1/valset_updated_claim`,
        method: "POST",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name GravityV1BatchConfirms
     * @request GET:/gravity/v1beta/batch/confirms
     */
    gravityV1BatchConfirms: (query?: { nonce?: string; contractAddress?: string }, params: RequestParams = {}) =>
      this.request<
        {
          confirms?: {
            nonce?: string;
            tokenContract?: string;
            ethSigner?: string;
            orchestrator?: string;
            signature?: string;
          }[];
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1beta/batch/confirms`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name GravityV1OutgoingLogicCalls
     * @request GET:/gravity/v1beta/batch/outgoinglogic
     */
    gravityV1OutgoingLogicCalls: (params: RequestParams = {}) =>
      this.request<
        {
          calls?: {
            transfers?: { contract?: string; amount?: string }[];
            fees?: { contract?: string; amount?: string }[];
            logicContractAddress?: string;
            payload?: string;
            timeout?: string;
            invalidationId?: string;
            invalidationNonce?: string;
            block?: string;
          }[];
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1beta/batch/outgoinglogic`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name GravityV1OutgoingTxBatches
     * @request GET:/gravity/v1beta/batch/outgoingtx
     */
    gravityV1OutgoingTxBatches: (params: RequestParams = {}) =>
      this.request<
        {
          batches?: {
            batchNonce?: string;
            batchTimeout?: string;
            transactions?: {
              id?: string;
              sender?: string;
              destAddress?: string;
              erc20Token?: { contract?: string; amount?: string };
              erc20Fee?: { contract?: string; amount?: string };
            }[];
            tokenContract?: string;
            block?: string;
          }[];
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1beta/batch/outgoingtx`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name GravityV1LastPendingBatchRequestByAddr
     * @request GET:/gravity/v1beta/batch/{address}
     */
    gravityV1LastPendingBatchRequestByAddr: (address: string, params: RequestParams = {}) =>
      this.request<
        {
          batch?: {
            batchNonce?: string;
            batchTimeout?: string;
            transactions?: {
              id?: string;
              sender?: string;
              destAddress?: string;
              erc20Token?: { contract?: string; amount?: string };
              erc20Fee?: { contract?: string; amount?: string };
            }[];
            tokenContract?: string;
            block?: string;
          }[];
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1beta/batch/${address}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name GravityV1BatchRequestByNonce
     * @request GET:/gravity/v1beta/batch/{nonce}
     */
    gravityV1BatchRequestByNonce: (nonce: string, query?: { contractAddress?: string }, params: RequestParams = {}) =>
      this.request<
        {
          batch?: {
            batchNonce?: string;
            batchTimeout?: string;
            transactions?: {
              id?: string;
              sender?: string;
              destAddress?: string;
              erc20Token?: { contract?: string; amount?: string };
              erc20Fee?: { contract?: string; amount?: string };
            }[];
            tokenContract?: string;
            block?: string;
          };
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1beta/batch/${nonce}`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name GravityV1BatchFees
     * @request GET:/gravity/v1beta/batchfees
     */
    gravityV1BatchFees: (params: RequestParams = {}) =>
      this.request<
        { batchFees?: { token?: string; totalFees?: string; txCount?: string }[] },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1beta/batchfees`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name GravityV1ValsetConfirmsByNonce
     * @request GET:/gravity/v1beta/confirms/{nonce}
     */
    gravityV1ValsetConfirmsByNonce: (nonce: string, params: RequestParams = {}) =>
      this.request<
        { confirms?: { nonce?: string; orchestrator?: string; ethAddress?: string; signature?: string }[] },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1beta/confirms/${nonce}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name GravityV1DenomToErc20
     * @request GET:/gravity/v1beta/cosmos_originated/denom_to_erc20
     */
    gravityV1DenomToErc20: (query?: { denom?: string }, params: RequestParams = {}) =>
      this.request<
        { erc20?: string; cosmosOriginated?: boolean },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1beta/cosmos_originated/denom_to_erc20`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name GravityV1Erc20ToDenom
     * @request GET:/gravity/v1beta/cosmos_originated/erc20_to_denom
     */
    gravityV1Erc20ToDenom: (query?: { erc20?: string }, params: RequestParams = {}) =>
      this.request<
        { denom?: string; cosmosOriginated?: boolean },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1beta/cosmos_originated/erc20_to_denom`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name GravityV1LogicConfirms
     * @request GET:/gravity/v1beta/logic/confirms
     */
    gravityV1LogicConfirms: (
      query?: { invalidationId?: string; invalidationNonce?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          confirms?: {
            invalidationId?: string;
            invalidationNonce?: string;
            ethSigner?: string;
            orchestrator?: string;
            signature?: string;
          }[];
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1beta/logic/confirms`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name GravityV1LastPendingLogicCallByAddr
     * @request GET:/gravity/v1beta/logic/{address}
     */
    gravityV1LastPendingLogicCallByAddr: (address: string, params: RequestParams = {}) =>
      this.request<
        {
          call?: {
            transfers?: { contract?: string; amount?: string }[];
            fees?: { contract?: string; amount?: string }[];
            logicContractAddress?: string;
            payload?: string;
            timeout?: string;
            invalidationId?: string;
            invalidationNonce?: string;
            block?: string;
          }[];
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1beta/logic/${address}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name GravityV1LastEventNonceByAddr
     * @request GET:/gravity/v1beta/oracle/eventnonce/{address}
     */
    gravityV1LastEventNonceByAddr: (address: string, params: RequestParams = {}) =>
      this.request<{ eventNonce?: string }, { code?: number; message?: string; details?: { "@type"?: string }[] }>({
        path: `/gravity/v1beta/oracle/eventnonce/${address}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name GravityV1Params
     * @summary Deployments queries deployments
     * @request GET:/gravity/v1beta/params
     */
    gravityV1Params: (params: RequestParams = {}) =>
      this.request<
        {
          params?: {
            gravityId?: string;
            contractSourceHash?: string;
            bridgeEthereumAddress?: string;
            bridgeChainId?: string;
            signedValsetsWindow?: string;
            signedBatchesWindow?: string;
            signedLogicCallsWindow?: string;
            targetBatchTimeout?: string;
            averageBlockTime?: string;
            averageEthereumBlockTime?: string;
            slashFractionValset?: string;
            slashFractionBatch?: string;
            slashFractionLogicCall?: string;
            unbondSlashingValsetsWindow?: string;
            slashFractionBadEthSignature?: string;
            valsetReward?: { denom?: string; amount?: string };
            bridgeActive?: boolean;
            ethereumBlacklist?: string[];
          };
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1beta/params`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name GravityV1GetAttestations
     * @request GET:/gravity/v1beta/query_attestations
     */
    gravityV1GetAttestations: (query?: { limit?: string }, params: RequestParams = {}) =>
      this.request<
        { attestations?: { observed?: boolean; votes?: string[]; height?: string; claim?: { "@type"?: string } }[] },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1beta/query_attestations`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name GravityV1GetDelegateKeyByEth
     * @request GET:/gravity/v1beta/query_delegate_keys_by_eth
     */
    gravityV1GetDelegateKeyByEth: (query?: { ethAddress?: string }, params: RequestParams = {}) =>
      this.request<
        { validatorAddress?: string; orchestratorAddress?: string },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1beta/query_delegate_keys_by_eth`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name GravityV1GetDelegateKeyByOrchestrator
     * @request GET:/gravity/v1beta/query_delegate_keys_by_orchestrator
     */
    gravityV1GetDelegateKeyByOrchestrator: (query?: { orchestratorAddress?: string }, params: RequestParams = {}) =>
      this.request<
        { validatorAddress?: string; ethAddress?: string },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1beta/query_delegate_keys_by_orchestrator`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name GravityV1GetDelegateKeyByValidator
     * @request GET:/gravity/v1beta/query_delegate_keys_by_validator
     */
    gravityV1GetDelegateKeyByValidator: (query?: { validatorAddress?: string }, params: RequestParams = {}) =>
      this.request<
        { ethAddress?: string; orchestratorAddress?: string },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1beta/query_delegate_keys_by_validator`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name GravityV1GetPendingSendToEth
     * @request GET:/gravity/v1beta/query_pending_send_to_eth
     */
    gravityV1GetPendingSendToEth: (query?: { senderAddress?: string }, params: RequestParams = {}) =>
      this.request<
        {
          transfersInBatches?: {
            id?: string;
            sender?: string;
            destAddress?: string;
            erc20Token?: { contract?: string; amount?: string };
            erc20Fee?: { contract?: string; amount?: string };
          }[];
          unbatchedTransfers?: {
            id?: string;
            sender?: string;
            destAddress?: string;
            erc20Token?: { contract?: string; amount?: string };
            erc20Fee?: { contract?: string; amount?: string };
          }[];
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1beta/query_pending_send_to_eth`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name GravityV1ValsetRequest
     * @request GET:/gravity/v1beta/valset
     */
    gravityV1ValsetRequest: (query?: { nonce?: string }, params: RequestParams = {}) =>
      this.request<
        {
          valset?: {
            nonce?: string;
            members?: { power?: string; ethereumAddress?: string }[];
            height?: string;
            rewardAmount?: string;
            rewardToken?: string;
          };
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1beta/valset`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name GravityV1ValsetConfirm2
     * @request GET:/gravity/v1beta/valset/confirm
     * @originalName gravityV1ValsetConfirm
     * @duplicate
     */
    gravityV1ValsetConfirm2: (query?: { nonce?: string; address?: string }, params: RequestParams = {}) =>
      this.request<
        { confirm?: { nonce?: string; orchestrator?: string; ethAddress?: string; signature?: string } },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1beta/valset/confirm`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name GravityV1CurrentValset
     * @request GET:/gravity/v1beta/valset/current
     */
    gravityV1CurrentValset: (params: RequestParams = {}) =>
      this.request<
        {
          valset?: {
            nonce?: string;
            members?: { power?: string; ethereumAddress?: string }[];
            height?: string;
            rewardAmount?: string;
            rewardToken?: string;
          };
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1beta/valset/current`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name GravityV1LastPendingValsetRequestByAddr
     * @request GET:/gravity/v1beta/valset/last
     */
    gravityV1LastPendingValsetRequestByAddr: (query?: { address?: string }, params: RequestParams = {}) =>
      this.request<
        {
          valsets?: {
            nonce?: string;
            members?: { power?: string; ethereumAddress?: string }[];
            height?: string;
            rewardAmount?: string;
            rewardToken?: string;
          }[];
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1beta/valset/last`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name GravityV1LastValsetRequests
     * @request GET:/gravity/v1beta/valset/requests
     */
    gravityV1LastValsetRequests: (params: RequestParams = {}) =>
      this.request<
        {
          valsets?: {
            nonce?: string;
            members?: { power?: string; ethereumAddress?: string }[];
            height?: string;
            rewardAmount?: string;
            rewardToken?: string;
          }[];
        },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/gravity/v1beta/valset/requests`,
        method: "GET",
        ...params,
      }),
  };
  ibc = {
    /**
     * No description
     *
     * @tags Query
     * @name IbcApplicationsTransferV1DenomTraces
     * @summary DenomTraces queries all denomination traces.
     * @request GET:/ibc/apps/transfer/v1/denom_traces
     */
    ibcApplicationsTransferV1DenomTraces: (
      query?: {
        "pagination.key"?: string;
        "pagination.offset"?: string;
        "pagination.limit"?: string;
        "pagination.countTotal"?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        { denomTraces?: { path?: string; baseDenom?: string }[]; pagination?: { nextKey?: string; total?: string } },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/ibc/apps/transfer/v1/denom_traces`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name IbcApplicationsTransferV1DenomTrace
     * @summary DenomTrace queries a denomination trace information.
     * @request GET:/ibc/apps/transfer/v1/denom_traces/{hash}
     */
    ibcApplicationsTransferV1DenomTrace: (hash: string, params: RequestParams = {}) =>
      this.request<
        { denomTrace?: { path?: string; baseDenom?: string } },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/ibc/apps/transfer/v1/denom_traces/${hash}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Query
     * @name IbcApplicationsTransferV1Params
     * @summary Params queries all parameters of the ibc-transfer module.
     * @request GET:/ibc/apps/transfer/v1/params
     */
    ibcApplicationsTransferV1Params: (params: RequestParams = {}) =>
      this.request<
        { params?: { sendEnabled?: boolean; receiveEnabled?: boolean } },
        { code?: number; message?: string; details?: { "@type"?: string }[] }
      >({
        path: `/ibc/apps/transfer/v1/params`,
        method: "GET",
        ...params,
      }),
  };
}
