export interface Credentials {
  passwordHash?: string;
  mnemonicHash?: string;
  keypairTypeHash?: string;
  emailHash?: string;
}

const version = 1;
const WALLET_KEY = "wallet.v" + version;
export function getCredentials() {
  const getCredentials = localStorage.getItem(WALLET_KEY);
  let credentials: Credentials = {};

  if (getCredentials) {
    credentials = JSON.parse(getCredentials);
  }
  return credentials;
}
