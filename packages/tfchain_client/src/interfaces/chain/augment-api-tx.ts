// Auto-generated via `yarn polkadot-types-from-chain`, do not edit
/* eslint-disable */

// import type lookup before we augment - in some environments
// this is required to allow for ambient/previous definitions
import "@polkadot/api-base/types/submittable";

import type {
  ApiTypes,
  AugmentedSubmittable,
  SubmittableExtrinsic,
  SubmittableExtrinsicFunction,
} from "@polkadot/api-base/types";
import type { Bytes, Compact, Option, U8aFixed, Vec, bool, u128, u16, u32, u64, u8 } from "@polkadot/types-codec";
import type { AnyNumber, IMethod, ITuple } from "@polkadot/types-codec/types";
import type { AccountId32, Call, H256, MultiAddress } from "@polkadot/types/interfaces/runtime";
import type {
  PalletSmartContractContractResources,
  PalletSmartContractNruConsumption,
  PalletSmartContractProvider,
  PalletTfgridLocationInput,
  PalletTfgridPolicy,
  PalletTfgridStorageVersion,
  SpConsensusGrandpaEquivocationProof,
  SpCoreVoid,
  SpWeightsWeightV2Weight,
  TfchainRuntimeOpaqueSessionKeys,
  TfchainRuntimeOriginCaller,
  TfchainSupportFarmCertification,
  TfchainSupportFarmingPolicyLimit,
  TfchainSupportInterfaceBoundedVec,
  TfchainSupportIp4,
  TfchainSupportNodeCertification,
  TfchainSupportPower,
  TfchainSupportPublicConfig,
  TfchainSupportResources,
} from "@polkadot/types/lookup";

export type __AugmentedSubmittable = AugmentedSubmittable<() => unknown>;
export type __SubmittableExtrinsic<ApiType extends ApiTypes> = SubmittableExtrinsic<ApiType>;
export type __SubmittableExtrinsicFunction<ApiType extends ApiTypes> = SubmittableExtrinsicFunction<ApiType>;

declare module "@polkadot/api-base/types/submittable" {
  interface AugmentedSubmittables<ApiType extends ApiTypes> {
    balances: {
      /**
       * See [`Pallet::force_set_balance`].
       **/
      forceSetBalance: AugmentedSubmittable<
        (
          who:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          newFree: Compact<u128> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress, Compact<u128>]
      >;
      /**
       * See [`Pallet::force_transfer`].
       **/
      forceTransfer: AugmentedSubmittable<
        (
          source:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          dest:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          value: Compact<u128> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress, MultiAddress, Compact<u128>]
      >;
      /**
       * See [`Pallet::force_unreserve`].
       **/
      forceUnreserve: AugmentedSubmittable<
        (
          who:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          amount: u128 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress, u128]
      >;
      /**
       * See [`Pallet::set_balance_deprecated`].
       **/
      setBalanceDeprecated: AugmentedSubmittable<
        (
          who:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          newFree: Compact<u128> | AnyNumber | Uint8Array,
          oldReserved: Compact<u128> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress, Compact<u128>, Compact<u128>]
      >;
      /**
       * See [`Pallet::transfer`].
       **/
      transfer: AugmentedSubmittable<
        (
          dest:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          value: Compact<u128> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress, Compact<u128>]
      >;
      /**
       * See [`Pallet::transfer_all`].
       **/
      transferAll: AugmentedSubmittable<
        (
          dest:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          keepAlive: bool | boolean | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress, bool]
      >;
      /**
       * See [`Pallet::transfer_allow_death`].
       **/
      transferAllowDeath: AugmentedSubmittable<
        (
          dest:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          value: Compact<u128> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress, Compact<u128>]
      >;
      /**
       * See [`Pallet::transfer_keep_alive`].
       **/
      transferKeepAlive: AugmentedSubmittable<
        (
          dest:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          value: Compact<u128> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress, Compact<u128>]
      >;
      /**
       * See [`Pallet::upgrade_accounts`].
       **/
      upgradeAccounts: AugmentedSubmittable<
        (who: Vec<AccountId32> | (AccountId32 | string | Uint8Array)[]) => SubmittableExtrinsic<ApiType>,
        [Vec<AccountId32>]
      >;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
    burningModule: {
      /**
       * See [`Pallet::burn_tft`].
       **/
      burnTft: AugmentedSubmittable<
        (amount: u128 | AnyNumber | Uint8Array, message: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u128, Bytes]
      >;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
    council: {
      /**
       * See [`Pallet::close`].
       **/
      close: AugmentedSubmittable<
        (
          proposalHash: H256 | string | Uint8Array,
          index: Compact<u32> | AnyNumber | Uint8Array,
          proposalWeightBound: SpWeightsWeightV2Weight | { refTime?: any; proofSize?: any } | string | Uint8Array,
          lengthBound: Compact<u32> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [H256, Compact<u32>, SpWeightsWeightV2Weight, Compact<u32>]
      >;
      /**
       * See [`Pallet::disapprove_proposal`].
       **/
      disapproveProposal: AugmentedSubmittable<
        (proposalHash: H256 | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [H256]
      >;
      /**
       * See [`Pallet::execute`].
       **/
      execute: AugmentedSubmittable<
        (
          proposal: Call | IMethod | string | Uint8Array,
          lengthBound: Compact<u32> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Call, Compact<u32>]
      >;
      /**
       * See [`Pallet::propose`].
       **/
      propose: AugmentedSubmittable<
        (
          threshold: Compact<u32> | AnyNumber | Uint8Array,
          proposal: Call | IMethod | string | Uint8Array,
          lengthBound: Compact<u32> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, Call, Compact<u32>]
      >;
      /**
       * See [`Pallet::set_members`].
       **/
      setMembers: AugmentedSubmittable<
        (
          newMembers: Vec<AccountId32> | (AccountId32 | string | Uint8Array)[],
          prime: Option<AccountId32> | null | Uint8Array | AccountId32 | string,
          oldCount: u32 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<AccountId32>, Option<AccountId32>, u32]
      >;
      /**
       * See [`Pallet::vote`].
       **/
      vote: AugmentedSubmittable<
        (
          proposal: H256 | string | Uint8Array,
          index: Compact<u32> | AnyNumber | Uint8Array,
          approve: bool | boolean | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [H256, Compact<u32>, bool]
      >;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
    councilMembership: {
      /**
       * See [`Pallet::add_member`].
       **/
      addMember: AugmentedSubmittable<
        (
          who:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress]
      >;
      /**
       * See [`Pallet::change_key`].
       **/
      changeKey: AugmentedSubmittable<
        (
          updated:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress]
      >;
      /**
       * See [`Pallet::clear_prime`].
       **/
      clearPrime: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>, []>;
      /**
       * See [`Pallet::remove_member`].
       **/
      removeMember: AugmentedSubmittable<
        (
          who:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress]
      >;
      /**
       * See [`Pallet::reset_members`].
       **/
      resetMembers: AugmentedSubmittable<
        (members: Vec<AccountId32> | (AccountId32 | string | Uint8Array)[]) => SubmittableExtrinsic<ApiType>,
        [Vec<AccountId32>]
      >;
      /**
       * See [`Pallet::set_prime`].
       **/
      setPrime: AugmentedSubmittable<
        (
          who:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress]
      >;
      /**
       * See [`Pallet::swap_member`].
       **/
      swapMember: AugmentedSubmittable<
        (
          remove:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          add:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress, MultiAddress]
      >;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
    dao: {
      /**
       * See [`Pallet::close`].
       **/
      close: AugmentedSubmittable<
        (
          proposalHash: H256 | string | Uint8Array,
          proposalIndex: Compact<u32> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [H256, Compact<u32>]
      >;
      /**
       * See [`Pallet::propose`].
       **/
      propose: AugmentedSubmittable<
        (
          threshold: Compact<u32> | AnyNumber | Uint8Array,
          action: Call | IMethod | string | Uint8Array,
          description: Bytes | string | Uint8Array,
          link: Bytes | string | Uint8Array,
          duration: Option<u32> | null | Uint8Array | u32 | AnyNumber,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, Call, Bytes, Bytes, Option<u32>]
      >;
      /**
       * See [`Pallet::veto`].
       **/
      veto: AugmentedSubmittable<(proposalHash: H256 | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [H256]>;
      /**
       * See [`Pallet::vote`].
       **/
      vote: AugmentedSubmittable<
        (
          farmId: u32 | AnyNumber | Uint8Array,
          proposalHash: H256 | string | Uint8Array,
          approve: bool | boolean | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, H256, bool]
      >;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
    grandpa: {
      /**
       * See [`Pallet::note_stalled`].
       **/
      noteStalled: AugmentedSubmittable<
        (
          delay: u32 | AnyNumber | Uint8Array,
          bestFinalizedBlockNumber: u32 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, u32]
      >;
      /**
       * See [`Pallet::report_equivocation`].
       **/
      reportEquivocation: AugmentedSubmittable<
        (
          equivocationProof:
            | SpConsensusGrandpaEquivocationProof
            | { setId?: any; equivocation?: any }
            | string
            | Uint8Array,
          keyOwnerProof: SpCoreVoid | null,
        ) => SubmittableExtrinsic<ApiType>,
        [SpConsensusGrandpaEquivocationProof, SpCoreVoid]
      >;
      /**
       * See [`Pallet::report_equivocation_unsigned`].
       **/
      reportEquivocationUnsigned: AugmentedSubmittable<
        (
          equivocationProof:
            | SpConsensusGrandpaEquivocationProof
            | { setId?: any; equivocation?: any }
            | string
            | Uint8Array,
          keyOwnerProof: SpCoreVoid | null,
        ) => SubmittableExtrinsic<ApiType>,
        [SpConsensusGrandpaEquivocationProof, SpCoreVoid]
      >;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
    runtimeUpgrade: {
      /**
       * See [`Pallet::set_code`].
       **/
      setCode: AugmentedSubmittable<(code: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [Bytes]>;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
    scheduler: {
      /**
       * See [`Pallet::cancel`].
       **/
      cancel: AugmentedSubmittable<
        (when: u32 | AnyNumber | Uint8Array, index: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u32, u32]
      >;
      /**
       * See [`Pallet::cancel_named`].
       **/
      cancelNamed: AugmentedSubmittable<
        (id: U8aFixed | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [U8aFixed]
      >;
      /**
       * See [`Pallet::schedule`].
       **/
      schedule: AugmentedSubmittable<
        (
          when: u32 | AnyNumber | Uint8Array,
          maybePeriodic:
            | Option<ITuple<[u32, u32]>>
            | null
            | Uint8Array
            | ITuple<[u32, u32]>
            | [u32 | AnyNumber | Uint8Array, u32 | AnyNumber | Uint8Array],
          priority: u8 | AnyNumber | Uint8Array,
          call: Call | IMethod | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, Option<ITuple<[u32, u32]>>, u8, Call]
      >;
      /**
       * See [`Pallet::schedule_after`].
       **/
      scheduleAfter: AugmentedSubmittable<
        (
          after: u32 | AnyNumber | Uint8Array,
          maybePeriodic:
            | Option<ITuple<[u32, u32]>>
            | null
            | Uint8Array
            | ITuple<[u32, u32]>
            | [u32 | AnyNumber | Uint8Array, u32 | AnyNumber | Uint8Array],
          priority: u8 | AnyNumber | Uint8Array,
          call: Call | IMethod | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, Option<ITuple<[u32, u32]>>, u8, Call]
      >;
      /**
       * See [`Pallet::schedule_named`].
       **/
      scheduleNamed: AugmentedSubmittable<
        (
          id: U8aFixed | string | Uint8Array,
          when: u32 | AnyNumber | Uint8Array,
          maybePeriodic:
            | Option<ITuple<[u32, u32]>>
            | null
            | Uint8Array
            | ITuple<[u32, u32]>
            | [u32 | AnyNumber | Uint8Array, u32 | AnyNumber | Uint8Array],
          priority: u8 | AnyNumber | Uint8Array,
          call: Call | IMethod | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [U8aFixed, u32, Option<ITuple<[u32, u32]>>, u8, Call]
      >;
      /**
       * See [`Pallet::schedule_named_after`].
       **/
      scheduleNamedAfter: AugmentedSubmittable<
        (
          id: U8aFixed | string | Uint8Array,
          after: u32 | AnyNumber | Uint8Array,
          maybePeriodic:
            | Option<ITuple<[u32, u32]>>
            | null
            | Uint8Array
            | ITuple<[u32, u32]>
            | [u32 | AnyNumber | Uint8Array, u32 | AnyNumber | Uint8Array],
          priority: u8 | AnyNumber | Uint8Array,
          call: Call | IMethod | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [U8aFixed, u32, Option<ITuple<[u32, u32]>>, u8, Call]
      >;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
    session: {
      /**
       * See [`Pallet::purge_keys`].
       **/
      purgeKeys: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>, []>;
      /**
       * See [`Pallet::set_keys`].
       **/
      setKeys: AugmentedSubmittable<
        (
          keys: TfchainRuntimeOpaqueSessionKeys | { aura?: any; grandpa?: any } | string | Uint8Array,
          proof: Bytes | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [TfchainRuntimeOpaqueSessionKeys, Bytes]
      >;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
    smartContractModule: {
      /**
       * See [`Pallet::add_nru_reports`].
       **/
      addNruReports: AugmentedSubmittable<
        (
          reports:
            | Vec<PalletSmartContractNruConsumption>
            | (
                | PalletSmartContractNruConsumption
                | { contractId?: any; timestamp?: any; window?: any; nru?: any }
                | string
                | Uint8Array
              )[],
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<PalletSmartContractNruConsumption>]
      >;
      /**
       * See [`Pallet::approve_solution_provider`].
       **/
      approveSolutionProvider: AugmentedSubmittable<
        (
          solutionProviderId: u64 | AnyNumber | Uint8Array,
          approve: bool | boolean | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u64, bool]
      >;
      /**
       * See [`Pallet::attach_solution_provider_id`].
       **/
      attachSolutionProviderId: AugmentedSubmittable<
        (
          contractId: u64 | AnyNumber | Uint8Array,
          solutionProviderId: u64 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u64, u64]
      >;
      /**
       * See [`Pallet::bill_contract_for_block`].
       **/
      billContractForBlock: AugmentedSubmittable<
        (contractId: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u64]
      >;
      /**
       * See [`Pallet::cancel_contract`].
       **/
      cancelContract: AugmentedSubmittable<
        (contractId: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u64]
      >;
      /**
       * See [`Pallet::cancel_contract_collective`].
       **/
      cancelContractCollective: AugmentedSubmittable<
        (contractId: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u64]
      >;
      /**
       * See [`Pallet::change_billing_frequency`].
       **/
      changeBillingFrequency: AugmentedSubmittable<
        (frequency: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u64]
      >;
      /**
       * See [`Pallet::create_name_contract`].
       **/
      createNameContract: AugmentedSubmittable<
        (name: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Bytes]
      >;
      /**
       * See [`Pallet::create_node_contract`].
       **/
      createNodeContract: AugmentedSubmittable<
        (
          nodeId: u32 | AnyNumber | Uint8Array,
          deploymentHash: U8aFixed | string | Uint8Array,
          deploymentData: Bytes | string | Uint8Array,
          publicIps: u32 | AnyNumber | Uint8Array,
          solutionProviderId: Option<u64> | null | Uint8Array | u64 | AnyNumber,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, U8aFixed, Bytes, u32, Option<u64>]
      >;
      /**
       * See [`Pallet::create_rent_contract`].
       **/
      createRentContract: AugmentedSubmittable<
        (
          nodeId: u32 | AnyNumber | Uint8Array,
          solutionProviderId: Option<u64> | null | Uint8Array | u64 | AnyNumber,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, Option<u64>]
      >;
      /**
       * See [`Pallet::create_solution_provider`].
       **/
      createSolutionProvider: AugmentedSubmittable<
        (
          description: Bytes | string | Uint8Array,
          link: Bytes | string | Uint8Array,
          providers:
            | Vec<PalletSmartContractProvider>
            | (PalletSmartContractProvider | { who?: any; take?: any } | string | Uint8Array)[],
        ) => SubmittableExtrinsic<ApiType>,
        [Bytes, Bytes, Vec<PalletSmartContractProvider>]
      >;
      /**
       * See [`Pallet::report_contract_resources`].
       **/
      reportContractResources: AugmentedSubmittable<
        (
          contractResources:
            | Vec<PalletSmartContractContractResources>
            | (PalletSmartContractContractResources | { contractId?: any; used?: any } | string | Uint8Array)[],
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<PalletSmartContractContractResources>]
      >;
      /**
       * See [`Pallet::service_contract_approve`].
       **/
      serviceContractApprove: AugmentedSubmittable<
        (serviceContractId: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u64]
      >;
      /**
       * See [`Pallet::service_contract_bill`].
       **/
      serviceContractBill: AugmentedSubmittable<
        (
          serviceContractId: u64 | AnyNumber | Uint8Array,
          variableAmount: u64 | AnyNumber | Uint8Array,
          metadata: Bytes | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u64, u64, Bytes]
      >;
      /**
       * See [`Pallet::service_contract_cancel`].
       **/
      serviceContractCancel: AugmentedSubmittable<
        (serviceContractId: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u64]
      >;
      /**
       * See [`Pallet::service_contract_create`].
       **/
      serviceContractCreate: AugmentedSubmittable<
        (
          serviceAccount: AccountId32 | string | Uint8Array,
          consumerAccount: AccountId32 | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, AccountId32]
      >;
      /**
       * See [`Pallet::service_contract_reject`].
       **/
      serviceContractReject: AugmentedSubmittable<
        (serviceContractId: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u64]
      >;
      /**
       * See [`Pallet::service_contract_set_fees`].
       **/
      serviceContractSetFees: AugmentedSubmittable<
        (
          serviceContractId: u64 | AnyNumber | Uint8Array,
          baseFee: u64 | AnyNumber | Uint8Array,
          variableFee: u64 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u64, u64, u64]
      >;
      /**
       * See [`Pallet::service_contract_set_metadata`].
       **/
      serviceContractSetMetadata: AugmentedSubmittable<
        (
          serviceContractId: u64 | AnyNumber | Uint8Array,
          metadata: Bytes | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u64, Bytes]
      >;
      /**
       * See [`Pallet::set_dedicated_node_extra_fee`].
       **/
      setDedicatedNodeExtraFee: AugmentedSubmittable<
        (nodeId: u32 | AnyNumber | Uint8Array, extraFee: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u32, u64]
      >;
      /**
       * See [`Pallet::update_node_contract`].
       **/
      updateNodeContract: AugmentedSubmittable<
        (
          contractId: u64 | AnyNumber | Uint8Array,
          deploymentHash: U8aFixed | string | Uint8Array,
          deploymentData: Bytes | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u64, U8aFixed, Bytes]
      >;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
    system: {
      /**
       * See [`Pallet::kill_prefix`].
       **/
      killPrefix: AugmentedSubmittable<
        (prefix: Bytes | string | Uint8Array, subkeys: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Bytes, u32]
      >;
      /**
       * See [`Pallet::kill_storage`].
       **/
      killStorage: AugmentedSubmittable<
        (keys: Vec<Bytes> | (Bytes | string | Uint8Array)[]) => SubmittableExtrinsic<ApiType>,
        [Vec<Bytes>]
      >;
      /**
       * See [`Pallet::remark`].
       **/
      remark: AugmentedSubmittable<(remark: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [Bytes]>;
      /**
       * See [`Pallet::remark_with_event`].
       **/
      remarkWithEvent: AugmentedSubmittable<
        (remark: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Bytes]
      >;
      /**
       * See [`Pallet::set_code`].
       **/
      setCode: AugmentedSubmittable<(code: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [Bytes]>;
      /**
       * See [`Pallet::set_code_without_checks`].
       **/
      setCodeWithoutChecks: AugmentedSubmittable<
        (code: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Bytes]
      >;
      /**
       * See [`Pallet::set_heap_pages`].
       **/
      setHeapPages: AugmentedSubmittable<(pages: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [u64]>;
      /**
       * See [`Pallet::set_storage`].
       **/
      setStorage: AugmentedSubmittable<
        (
          items: Vec<ITuple<[Bytes, Bytes]>> | [Bytes | string | Uint8Array, Bytes | string | Uint8Array][],
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<ITuple<[Bytes, Bytes]>>]
      >;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
    tfgridModule: {
      /**
       * See [`Pallet::add_farm_ip`].
       **/
      addFarmIp: AugmentedSubmittable<
        (
          farmId: u32 | AnyNumber | Uint8Array,
          ip: Bytes | string | Uint8Array,
          gw: Bytes | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, Bytes, Bytes]
      >;
      /**
       * See [`Pallet::add_node_certifier`].
       **/
      addNodeCertifier: AugmentedSubmittable<
        (certifier: AccountId32 | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [AccountId32]
      >;
      /**
       * See [`Pallet::add_node_public_config`].
       **/
      addNodePublicConfig: AugmentedSubmittable<
        (
          farmId: u32 | AnyNumber | Uint8Array,
          nodeId: u32 | AnyNumber | Uint8Array,
          publicConfig:
            | Option<TfchainSupportPublicConfig>
            | null
            | Uint8Array
            | TfchainSupportPublicConfig
            | { ip4?: any; ip6?: any; domain?: any }
            | string,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, u32, Option<TfchainSupportPublicConfig>]
      >;
      /**
       * See [`Pallet::add_stellar_payout_v2address`].
       **/
      addStellarPayoutV2address: AugmentedSubmittable<
        (
          farmId: u32 | AnyNumber | Uint8Array,
          stellarAddress: Bytes | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, Bytes]
      >;
      /**
       * See [`Pallet::add_twin_entity`].
       **/
      addTwinEntity: AugmentedSubmittable<
        (
          twinId: u32 | AnyNumber | Uint8Array,
          entityId: u32 | AnyNumber | Uint8Array,
          signature: Bytes | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, u32, Bytes]
      >;
      /**
       * See [`Pallet::attach_policy_to_farm`].
       **/
      attachPolicyToFarm: AugmentedSubmittable<
        (
          farmId: u32 | AnyNumber | Uint8Array,
          limits:
            | Option<TfchainSupportFarmingPolicyLimit>
            | null
            | Uint8Array
            | TfchainSupportFarmingPolicyLimit
            | { farmingPolicyId?: any; cu?: any; su?: any; end?: any; nodeCount?: any; nodeCertification?: any }
            | string,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, Option<TfchainSupportFarmingPolicyLimit>]
      >;
      /**
       * See [`Pallet::bond_twin_account`].
       **/
      bondTwinAccount: AugmentedSubmittable<
        (twinId: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u32]
      >;
      /**
       * See [`Pallet::change_power_state`].
       **/
      changePowerState: AugmentedSubmittable<
        (powerState: TfchainSupportPower | "Up" | "Down" | number | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [TfchainSupportPower]
      >;
      /**
       * See [`Pallet::change_power_target`].
       **/
      changePowerTarget: AugmentedSubmittable<
        (
          nodeId: u32 | AnyNumber | Uint8Array,
          powerTarget: TfchainSupportPower | "Up" | "Down" | number | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, TfchainSupportPower]
      >;
      /**
       * See [`Pallet::create_entity`].
       **/
      createEntity: AugmentedSubmittable<
        (
          target: AccountId32 | string | Uint8Array,
          name: Bytes | string | Uint8Array,
          country: Bytes | string | Uint8Array,
          city: Bytes | string | Uint8Array,
          signature: Bytes | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, Bytes, Bytes, Bytes, Bytes]
      >;
      /**
       * See [`Pallet::create_farm`].
       **/
      createFarm: AugmentedSubmittable<
        (
          name: Bytes | string | Uint8Array,
          publicIps: Vec<TfchainSupportIp4> | (TfchainSupportIp4 | { ip?: any; gw?: any } | string | Uint8Array)[],
        ) => SubmittableExtrinsic<ApiType>,
        [Bytes, Vec<TfchainSupportIp4>]
      >;
      /**
       * See [`Pallet::create_farming_policy`].
       **/
      createFarmingPolicy: AugmentedSubmittable<
        (
          name: Bytes | string | Uint8Array,
          su: u32 | AnyNumber | Uint8Array,
          cu: u32 | AnyNumber | Uint8Array,
          nu: u32 | AnyNumber | Uint8Array,
          ipv4: u32 | AnyNumber | Uint8Array,
          minimalUptime: u16 | AnyNumber | Uint8Array,
          policyEnd: u32 | AnyNumber | Uint8Array,
          immutable: bool | boolean | Uint8Array,
          _default: bool | boolean | Uint8Array,
          nodeCertification: TfchainSupportNodeCertification | "Diy" | "Certified" | number | Uint8Array,
          farmCertification: TfchainSupportFarmCertification | "NotCertified" | "Gold" | number | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [
          Bytes,
          u32,
          u32,
          u32,
          u32,
          u16,
          u32,
          bool,
          bool,
          TfchainSupportNodeCertification,
          TfchainSupportFarmCertification,
        ]
      >;
      /**
       * See [`Pallet::create_node`].
       **/
      createNode: AugmentedSubmittable<
        (
          farmId: u32 | AnyNumber | Uint8Array,
          resources: TfchainSupportResources | { hru?: any; sru?: any; cru?: any; mru?: any } | string | Uint8Array,
          location:
            | PalletTfgridLocationInput
            | { city?: any; country?: any; latitude?: any; longitude?: any }
            | string
            | Uint8Array,
          interfaces:
            | Vec<TfchainSupportInterfaceBoundedVec>
            | (TfchainSupportInterfaceBoundedVec | { name?: any; mac?: any; ips?: any } | string | Uint8Array)[],
          secureBoot: bool | boolean | Uint8Array,
          virtualized: bool | boolean | Uint8Array,
          serialNumber: Option<Bytes> | null | Uint8Array | Bytes | string,
        ) => SubmittableExtrinsic<ApiType>,
        [
          u32,
          TfchainSupportResources,
          PalletTfgridLocationInput,
          Vec<TfchainSupportInterfaceBoundedVec>,
          bool,
          bool,
          Option<Bytes>,
        ]
      >;
      /**
       * See [`Pallet::create_pricing_policy`].
       **/
      createPricingPolicy: AugmentedSubmittable<
        (
          name: Bytes | string | Uint8Array,
          su: PalletTfgridPolicy | { value?: any; unit?: any } | string | Uint8Array,
          cu: PalletTfgridPolicy | { value?: any; unit?: any } | string | Uint8Array,
          nu: PalletTfgridPolicy | { value?: any; unit?: any } | string | Uint8Array,
          ipu: PalletTfgridPolicy | { value?: any; unit?: any } | string | Uint8Array,
          uniqueName: PalletTfgridPolicy | { value?: any; unit?: any } | string | Uint8Array,
          domainName: PalletTfgridPolicy | { value?: any; unit?: any } | string | Uint8Array,
          foundationAccount: AccountId32 | string | Uint8Array,
          certifiedSalesAccount: AccountId32 | string | Uint8Array,
          discountForDedicationNodes: u8 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [
          Bytes,
          PalletTfgridPolicy,
          PalletTfgridPolicy,
          PalletTfgridPolicy,
          PalletTfgridPolicy,
          PalletTfgridPolicy,
          PalletTfgridPolicy,
          AccountId32,
          AccountId32,
          u8,
        ]
      >;
      /**
       * See [`Pallet::create_twin`].
       **/
      createTwin: AugmentedSubmittable<
        (
          relay: Option<Bytes> | null | Uint8Array | Bytes | string,
          pk: Option<Bytes> | null | Uint8Array | Bytes | string,
        ) => SubmittableExtrinsic<ApiType>,
        [Option<Bytes>, Option<Bytes>]
      >;
      /**
       * See [`Pallet::delete_entity`].
       **/
      deleteEntity: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>, []>;
      /**
       * See [`Pallet::delete_node`].
       **/
      deleteNode: AugmentedSubmittable<(nodeId: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [u32]>;
      /**
       * See [`Pallet::delete_node_farm`].
       **/
      deleteNodeFarm: AugmentedSubmittable<
        (nodeId: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u32]
      >;
      /**
       * See [`Pallet::delete_twin_entity`].
       **/
      deleteTwinEntity: AugmentedSubmittable<
        (twinId: u32 | AnyNumber | Uint8Array, entityId: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u32, u32]
      >;
      /**
       * See [`Pallet::force_reset_farm_ip`].
       **/
      forceResetFarmIp: AugmentedSubmittable<
        (farmId: u32 | AnyNumber | Uint8Array, ip: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u32, Bytes]
      >;
      /**
       * See [`Pallet::remove_farm_ip`].
       **/
      removeFarmIp: AugmentedSubmittable<
        (farmId: u32 | AnyNumber | Uint8Array, ip: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u32, Bytes]
      >;
      /**
       * See [`Pallet::remove_node_certifier`].
       **/
      removeNodeCertifier: AugmentedSubmittable<
        (certifier: AccountId32 | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [AccountId32]
      >;
      /**
       * See [`Pallet::report_uptime`].
       **/
      reportUptime: AugmentedSubmittable<
        (uptime: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u64]
      >;
      /**
       * See [`Pallet::report_uptime_v2`].
       **/
      reportUptimeV2: AugmentedSubmittable<
        (
          uptime: u64 | AnyNumber | Uint8Array,
          timestampHint: u64 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u64, u64]
      >;
      /**
       * See [`Pallet::set_connection_price`].
       **/
      setConnectionPrice: AugmentedSubmittable<
        (price: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u32]
      >;
      /**
       * See [`Pallet::set_farm_certification`].
       **/
      setFarmCertification: AugmentedSubmittable<
        (
          farmId: u32 | AnyNumber | Uint8Array,
          certification: TfchainSupportFarmCertification | "NotCertified" | "Gold" | number | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, TfchainSupportFarmCertification]
      >;
      /**
       * See [`Pallet::set_farm_dedicated`].
       **/
      setFarmDedicated: AugmentedSubmittable<
        (farmId: u32 | AnyNumber | Uint8Array, dedicated: bool | boolean | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u32, bool]
      >;
      /**
       * See [`Pallet::set_node_certification`].
       **/
      setNodeCertification: AugmentedSubmittable<
        (
          nodeId: u32 | AnyNumber | Uint8Array,
          nodeCertification: TfchainSupportNodeCertification | "Diy" | "Certified" | number | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, TfchainSupportNodeCertification]
      >;
      /**
       * See [`Pallet::set_storage_version`].
       **/
      setStorageVersion: AugmentedSubmittable<
        (
          version:
            | PalletTfgridStorageVersion
            | "V1Struct"
            | "V2Struct"
            | "V3Struct"
            | "V4Struct"
            | "V5Struct"
            | "V6Struct"
            | "V7Struct"
            | "V8Struct"
            | "V9Struct"
            | "V10Struct"
            | "V11Struct"
            | "V12Struct"
            | "V13Struct"
            | "V14Struct"
            | "V15Struct"
            | "V16Struct"
            | "V17Struct"
            | number
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [PalletTfgridStorageVersion]
      >;
      /**
       * See [`Pallet::set_zos_version`].
       **/
      setZosVersion: AugmentedSubmittable<
        (zosVersion: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Bytes]
      >;
      /**
       * See [`Pallet::update_entity`].
       **/
      updateEntity: AugmentedSubmittable<
        (
          name: Bytes | string | Uint8Array,
          country: Bytes | string | Uint8Array,
          city: Bytes | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Bytes, Bytes, Bytes]
      >;
      /**
       * See [`Pallet::update_farm`].
       **/
      updateFarm: AugmentedSubmittable<
        (farmId: u32 | AnyNumber | Uint8Array, name: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u32, Bytes]
      >;
      /**
       * See [`Pallet::update_farming_policy`].
       **/
      updateFarmingPolicy: AugmentedSubmittable<
        (
          farmingPolicyId: u32 | AnyNumber | Uint8Array,
          name: Bytes | string | Uint8Array,
          su: u32 | AnyNumber | Uint8Array,
          cu: u32 | AnyNumber | Uint8Array,
          nu: u32 | AnyNumber | Uint8Array,
          ipv4: u32 | AnyNumber | Uint8Array,
          minimalUptime: u16 | AnyNumber | Uint8Array,
          policyEnd: u32 | AnyNumber | Uint8Array,
          _default: bool | boolean | Uint8Array,
          nodeCertification: TfchainSupportNodeCertification | "Diy" | "Certified" | number | Uint8Array,
          farmCertification: TfchainSupportFarmCertification | "NotCertified" | "Gold" | number | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [
          u32,
          Bytes,
          u32,
          u32,
          u32,
          u32,
          u16,
          u32,
          bool,
          TfchainSupportNodeCertification,
          TfchainSupportFarmCertification,
        ]
      >;
      /**
       * See [`Pallet::update_node`].
       **/
      updateNode: AugmentedSubmittable<
        (
          nodeId: u32 | AnyNumber | Uint8Array,
          farmId: u32 | AnyNumber | Uint8Array,
          resources: TfchainSupportResources | { hru?: any; sru?: any; cru?: any; mru?: any } | string | Uint8Array,
          location:
            | PalletTfgridLocationInput
            | { city?: any; country?: any; latitude?: any; longitude?: any }
            | string
            | Uint8Array,
          interfaces:
            | Vec<TfchainSupportInterfaceBoundedVec>
            | (TfchainSupportInterfaceBoundedVec | { name?: any; mac?: any; ips?: any } | string | Uint8Array)[],
          secureBoot: bool | boolean | Uint8Array,
          virtualized: bool | boolean | Uint8Array,
          serialNumber: Option<Bytes> | null | Uint8Array | Bytes | string,
        ) => SubmittableExtrinsic<ApiType>,
        [
          u32,
          u32,
          TfchainSupportResources,
          PalletTfgridLocationInput,
          Vec<TfchainSupportInterfaceBoundedVec>,
          bool,
          bool,
          Option<Bytes>,
        ]
      >;
      /**
       * See [`Pallet::update_pricing_policy`].
       **/
      updatePricingPolicy: AugmentedSubmittable<
        (
          pricingPolicyId: u32 | AnyNumber | Uint8Array,
          name: Bytes | string | Uint8Array,
          su: PalletTfgridPolicy | { value?: any; unit?: any } | string | Uint8Array,
          cu: PalletTfgridPolicy | { value?: any; unit?: any } | string | Uint8Array,
          nu: PalletTfgridPolicy | { value?: any; unit?: any } | string | Uint8Array,
          ipu: PalletTfgridPolicy | { value?: any; unit?: any } | string | Uint8Array,
          uniqueName: PalletTfgridPolicy | { value?: any; unit?: any } | string | Uint8Array,
          domainName: PalletTfgridPolicy | { value?: any; unit?: any } | string | Uint8Array,
          foundationAccount: AccountId32 | string | Uint8Array,
          certifiedSalesAccount: AccountId32 | string | Uint8Array,
          discountForDedicationNodes: u8 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [
          u32,
          Bytes,
          PalletTfgridPolicy,
          PalletTfgridPolicy,
          PalletTfgridPolicy,
          PalletTfgridPolicy,
          PalletTfgridPolicy,
          PalletTfgridPolicy,
          AccountId32,
          AccountId32,
          u8,
        ]
      >;
      /**
       * See [`Pallet::update_twin`].
       **/
      updateTwin: AugmentedSubmittable<
        (
          relay: Option<Bytes> | null | Uint8Array | Bytes | string,
          pk: Option<Bytes> | null | Uint8Array | Bytes | string,
        ) => SubmittableExtrinsic<ApiType>,
        [Option<Bytes>, Option<Bytes>]
      >;
      /**
       * See [`Pallet::user_accept_tc`].
       **/
      userAcceptTc: AugmentedSubmittable<
        (
          documentLink: Bytes | string | Uint8Array,
          documentHash: Bytes | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Bytes, Bytes]
      >;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
    tfkvStore: {
      /**
       * See [`Pallet::delete`].
       **/
      delete: AugmentedSubmittable<(key: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [Bytes]>;
      /**
       * See [`Pallet::set`].
       **/
      set: AugmentedSubmittable<
        (key: Bytes | string | Uint8Array, value: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Bytes, Bytes]
      >;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
    tftBridgeModule: {
      /**
       * See [`Pallet::add_bridge_validator`].
       **/
      addBridgeValidator: AugmentedSubmittable<
        (target: AccountId32 | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [AccountId32]
      >;
      /**
       * See [`Pallet::create_refund_transaction_or_add_sig`].
       **/
      createRefundTransactionOrAddSig: AugmentedSubmittable<
        (
          txHash: Bytes | string | Uint8Array,
          target: Bytes | string | Uint8Array,
          amount: u64 | AnyNumber | Uint8Array,
          signature: Bytes | string | Uint8Array,
          stellarPubKey: Bytes | string | Uint8Array,
          sequenceNumber: u64 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Bytes, Bytes, u64, Bytes, Bytes, u64]
      >;
      /**
       * See [`Pallet::propose_burn_transaction_or_add_sig`].
       **/
      proposeBurnTransactionOrAddSig: AugmentedSubmittable<
        (
          transactionId: u64 | AnyNumber | Uint8Array,
          target: Bytes | string | Uint8Array,
          amount: u64 | AnyNumber | Uint8Array,
          signature: Bytes | string | Uint8Array,
          stellarPubKey: Bytes | string | Uint8Array,
          sequenceNumber: u64 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u64, Bytes, u64, Bytes, Bytes, u64]
      >;
      /**
       * See [`Pallet::propose_or_vote_mint_transaction`].
       **/
      proposeOrVoteMintTransaction: AugmentedSubmittable<
        (
          transaction: Bytes | string | Uint8Array,
          target: AccountId32 | string | Uint8Array,
          amount: u64 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Bytes, AccountId32, u64]
      >;
      /**
       * See [`Pallet::remove_bridge_validator`].
       **/
      removeBridgeValidator: AugmentedSubmittable<
        (target: AccountId32 | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [AccountId32]
      >;
      /**
       * See [`Pallet::set_burn_transaction_executed`].
       **/
      setBurnTransactionExecuted: AugmentedSubmittable<
        (transactionId: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u64]
      >;
      /**
       * See [`Pallet::set_deposit_fee`].
       **/
      setDepositFee: AugmentedSubmittable<
        (amount: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u64]
      >;
      /**
       * See [`Pallet::set_fee_account`].
       **/
      setFeeAccount: AugmentedSubmittable<
        (target: AccountId32 | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [AccountId32]
      >;
      /**
       * See [`Pallet::set_refund_transaction_executed`].
       **/
      setRefundTransactionExecuted: AugmentedSubmittable<
        (txHash: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Bytes]
      >;
      /**
       * See [`Pallet::set_withdraw_fee`].
       **/
      setWithdrawFee: AugmentedSubmittable<
        (amount: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u64]
      >;
      /**
       * See [`Pallet::swap_to_stellar`].
       **/
      swapToStellar: AugmentedSubmittable<
        (
          targetStellarAddress: Bytes | string | Uint8Array,
          amount: u128 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Bytes, u128]
      >;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
    tftPriceModule: {
      /**
       * See [`Pallet::set_max_tft_price`].
       **/
      setMaxTftPrice: AugmentedSubmittable<
        (price: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u32]
      >;
      /**
       * See [`Pallet::set_min_tft_price`].
       **/
      setMinTftPrice: AugmentedSubmittable<
        (price: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u32]
      >;
      /**
       * See [`Pallet::set_prices`].
       **/
      setPrices: AugmentedSubmittable<
        (
          price: u32 | AnyNumber | Uint8Array,
          blockNumber: u32 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, u32]
      >;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
    timestamp: {
      /**
       * See [`Pallet::set`].
       **/
      set: AugmentedSubmittable<
        (now: Compact<u64> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Compact<u64>]
      >;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
    utility: {
      /**
       * See [`Pallet::as_derivative`].
       **/
      asDerivative: AugmentedSubmittable<
        (
          index: u16 | AnyNumber | Uint8Array,
          call: Call | IMethod | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u16, Call]
      >;
      /**
       * See [`Pallet::batch`].
       **/
      batch: AugmentedSubmittable<
        (calls: Vec<Call> | (Call | IMethod | string | Uint8Array)[]) => SubmittableExtrinsic<ApiType>,
        [Vec<Call>]
      >;
      /**
       * See [`Pallet::batch_all`].
       **/
      batchAll: AugmentedSubmittable<
        (calls: Vec<Call> | (Call | IMethod | string | Uint8Array)[]) => SubmittableExtrinsic<ApiType>,
        [Vec<Call>]
      >;
      /**
       * See [`Pallet::dispatch_as`].
       **/
      dispatchAs: AugmentedSubmittable<
        (
          asOrigin:
            | TfchainRuntimeOriginCaller
            | { system: any }
            | { Void: any }
            | { Council: any }
            | string
            | Uint8Array,
          call: Call | IMethod | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [TfchainRuntimeOriginCaller, Call]
      >;
      /**
       * See [`Pallet::force_batch`].
       **/
      forceBatch: AugmentedSubmittable<
        (calls: Vec<Call> | (Call | IMethod | string | Uint8Array)[]) => SubmittableExtrinsic<ApiType>,
        [Vec<Call>]
      >;
      /**
       * See [`Pallet::with_weight`].
       **/
      withWeight: AugmentedSubmittable<
        (
          call: Call | IMethod | string | Uint8Array,
          weight: SpWeightsWeightV2Weight | { refTime?: any; proofSize?: any } | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Call, SpWeightsWeightV2Weight]
      >;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
    validator: {
      /**
       * See [`Pallet::activate_validator_node`].
       **/
      activateValidatorNode: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>, []>;
      /**
       * See [`Pallet::approve_validator`].
       **/
      approveValidator: AugmentedSubmittable<
        (
          validatorAccount:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress]
      >;
      /**
       * See [`Pallet::bond`].
       **/
      bond: AugmentedSubmittable<
        (
          validator:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress]
      >;
      /**
       * See [`Pallet::change_validator_node_account`].
       **/
      changeValidatorNodeAccount: AugmentedSubmittable<
        (newNodeValidatorAccount: AccountId32 | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [AccountId32]
      >;
      /**
       * See [`Pallet::create_validator_request`].
       **/
      createValidatorRequest: AugmentedSubmittable<
        (
          validatorNodeAccount: AccountId32 | string | Uint8Array,
          stashAccount: AccountId32 | string | Uint8Array,
          description: Bytes | string | Uint8Array,
          tfConnectId: Bytes | string | Uint8Array,
          info: Bytes | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, AccountId32, Bytes, Bytes, Bytes]
      >;
      /**
       * See [`Pallet::remove_validator`].
       **/
      removeValidator: AugmentedSubmittable<
        (
          validatorAccount:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress]
      >;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
    validatorSet: {
      /**
       * See [`Pallet::add_validator`].
       **/
      addValidator: AugmentedSubmittable<
        (validatorId: AccountId32 | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [AccountId32]
      >;
      /**
       * See [`Pallet::add_validator_again`].
       **/
      addValidatorAgain: AugmentedSubmittable<
        (validatorId: AccountId32 | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [AccountId32]
      >;
      /**
       * See [`Pallet::remove_validator`].
       **/
      removeValidator: AugmentedSubmittable<
        (validatorId: AccountId32 | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [AccountId32]
      >;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
  } // AugmentedSubmittables
} // declare module
