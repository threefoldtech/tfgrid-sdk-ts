import { balanceInterface } from "./../lib/balance";
import { accountInterface } from "./state";

export declare type TwinType = {
  id: string;
  relay: string;
  pk: string;
};

export declare type UserCredentials = {
  loading: boolean;
  twin: TwinType;
  balance: balanceInterface;
  initialized: boolean;
  account: accountInterface;
};
