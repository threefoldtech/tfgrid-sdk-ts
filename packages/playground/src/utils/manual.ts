import urlJoin from "url-join";

const BASE = window.env.MANUAL_URL;

const GITHUB = {
  RAW_BASE: "https://raw.githubusercontent.com/threefoldtech/info_grid/refs/heads/development",
  LEGAL_PATH: "labs/docs/knowledge_base/terms_conditions_all3/",
};

const LEGAL_HEADER_IMG = "img/legal_header.jpg";

export const manual = {
  dedicated_machines: urlJoin(BASE, "/labs/documentation/dashboard/deploy/node_finder#dedicated-nodes"),
  tft_bridges: urlJoin(BASE, "/labs/documentation/threefold_token/tft_bridges"),
  buy_sell_tft: urlJoin(BASE, "/labs/documentation/threefold_token/buy_sell_tft"),
  farmers: urlJoin(BASE, "/labs/documentation/farmers"),
  governance: urlJoin(BASE, "/labs/documentation/dashboard/tfchain/tf_dao"),
  pricing: urlJoin(BASE, "/labs/knowledge_base/cloud_toc/pricing_toc"),
  dao: urlJoin(BASE, "/labs/documentation/dashboard/tfchain/tf_dao"),
  caprover: urlJoin(BASE, "/labs/documentation/dashboard/deploy/applications/caprover"),
  tf_connect_app: urlJoin(BASE, "/labs/documentation/threefold_token/storing_tft/tf_connect_app"),
  tf_connect_installation: urlJoin(BASE, "/labs/documentation/tfconnect_toc/tfconnect_installation"),
  tf_connect_wallet: urlJoin(BASE, "/labs/documentation/dashboard/wallet_connector"),
  contract_locking: urlJoin(BASE, "/labs/documentation/developers/tfchain#contract-locking"),
  billing_pricing: urlJoin(BASE, "/labs/documentation/dashboard/deploy/node_finder#billing--pricing"),
  discount_levels: urlJoin(BASE, "/labs/knowledge_base/cloud_toc/pricing_toc/staking_discount_levels"),
  tfchain_stellar_bridge: urlJoin(BASE, "/labs/documentation/threefold_token/tft_bridges/tfchain_stellar_bridge"),
  minting_receipts: urlJoin(BASE, "/labs/documentation/farmers/farming_optimization/minting_receipts"),
  minting_process: urlJoin(BASE, "/labs/documentation/farmers/farming_optimization/minting_process"),
  minting_reports: urlJoin(BASE, "/labs/documentation/dashboard/tfchain/tf_minting_reports"),
  manual_raw_legal: urlJoin(GITHUB.RAW_BASE, GITHUB.LEGAL_PATH, "terms_conditions_all3.md"),
  manual_raw_legal_img: urlJoin(GITHUB.RAW_BASE, GITHUB.LEGAL_PATH, LEGAL_HEADER_IMG),
  manual_legal_base: urlJoin(BASE, GITHUB.LEGAL_PATH),
  legal_header_img: LEGAL_HEADER_IMG,
};
