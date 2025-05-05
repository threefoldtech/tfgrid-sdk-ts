import urlJoin from "url-join";

const BASE = window.env.MANUAL_URL;

const GITHUB = {
  RAW_BASE: "https://raw.githubusercontent.com/threefoldtech/info_grid/master/src",
  LEGAL_PATH: "knowledge_base/legal",
};

const LEGAL_HEADER_IMG = "img/legal_header.jpg";

export const manual = {
  dedicated_machines: urlJoin(BASE, "/documentation/dashboard/deploy/node_finder.html#dedicated-nodes"),
  tft_bridges: urlJoin(BASE, "/documentation/threefold_token/tft_bridges/tft_bridges.html"),
  buy_sell_tft: urlJoin(BASE, "/documentation/threefold_token/buy_sell_tft/buy_sell_tft.html"),
  farmers: urlJoin(BASE, "/documentation/farmers/farmers.html"),
  governance: urlJoin(BASE, "/documentation/dashboard/tfchain/tf_dao.html"),
  pricing: urlJoin(BASE, "/knowledge_base/cloud/pricing/pricing.html"),
  dao: urlJoin(BASE, "/documentation/dashboard/tfchain/tf_dao.html"),
  caprover: urlJoin(BASE, "/documentation/dashboard/solutions/caprover.html"),
  tf_connect_app: urlJoin(BASE, "/documentation/threefold_token/storing_tft/tf_connect_app.html"),
  tf_connect_installation: urlJoin(BASE, "/documentation/tfconnect/tfconnect_installation.html#download-links"),
  tf_connect_wallet: urlJoin(BASE, "/documentation/dashboard/wallet_connector.html"),
  contract_locking: urlJoin(BASE, "/documentation/developers/tfchain/tfchain.html#contract-locking"),
  billing_pricing: urlJoin(BASE, "/documentation/dashboard/deploy/node_finder.html#billing--pricing"),
  discount_levels: urlJoin(BASE, "/knowledge_base/cloud/pricing/pricing.html#staking-discount"),
  tfchain_stellar_bridge: urlJoin(BASE, "/documentation/threefold_token/tft_bridges/tfchain_stellar_bridge.html"),
  minting_receipts: urlJoin(BASE, "/documentation/farmers/3node_building/minting_receipts.html"),
  minting_process: urlJoin(BASE, "/documentation/farmers/farming_optimization/minting_process.html"),
  minting_reports: urlJoin(BASE, "/documentation/dashboard/tfchain/tf_minting_reports.html"),
  manual_raw_legal: urlJoin(GITHUB.RAW_BASE, GITHUB.LEGAL_PATH, "terms_conditions_all3.md"),
  manual_raw_legal_img: urlJoin(GITHUB.RAW_BASE, GITHUB.LEGAL_PATH, LEGAL_HEADER_IMG),
  manual_legal_base: urlJoin(BASE, GITHUB.LEGAL_PATH),
  legal_header_img: LEGAL_HEADER_IMG,
};
