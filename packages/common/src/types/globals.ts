import type { NetworkEnv } from "@threefold/grid_client";

import type CopyInputWrapper from "../components/copy_input_wrapper.vue";
import type DTabs from "../components/dynamic_tabs.vue";
import type FormValidator from "../components/form_validator.vue";
import type InputTooltip from "../components/input_tooltip.vue";
import type InputValidator from "../components/input_validator.vue";
import type PasswordInputWrapper from "../components/password_input_wrapper.vue";
import type { ValidatorsType } from "../utils";

export interface Environment {
  NETWORK: NetworkEnv;
  GRAPHQL_URL: string;
  GRIDPROXY_URL: string;
  SUBSTRATE_URL: string;
  ACTIVATION_SERVICE_URL: string;
  RELAY_DOMAIN: string;
  BRIDGE_TFT_ADDRESS: string;
  STELLAR_NETWORK: string;
  STELLAR_HORIZON_URL: string;
  TFT_ASSET_ISSUER: string;
}

export interface Properties {
  validators: ValidatorsType;
}

export interface Components {
  InputValidator: typeof InputValidator;
  FormValidator: typeof FormValidator;
  CopyInputWrapper: typeof CopyInputWrapper;
  DTabs: typeof DTabs;
  InputTooltip: typeof InputTooltip;
  PasswordInputWrapper: typeof PasswordInputWrapper;
}
