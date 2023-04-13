import { utils } from "ethers";

function epoch() {
  return (new Date() as any) / 1000;
}

function waitBscTransaction(provider: any, txHash: string, timeout?: number): Promise<any> {
  if (timeout == undefined) timeout = 15;
  const startTime = epoch();
  return new Promise((res, rej) => {
    async function _checkTx() {
      const result = await provider.getTransactionReceipt(txHash);
      if (result) res(result);
      else if (epoch() - startTime > (timeout as number)) {
        rej("Transaction took longer than " + timeout + " seconds");
      } else {
        setTimeout(_checkTx, 500);
      }
    }
    _checkTx();
  });
}
/**
 * Checks if the given string is an address
 *
 * @method isAddress
 * @param {String} address the given HEX adress
 * @return {Boolean}
 */
function validateBSCAddress(address: string) {
  if (address.length != 42) {
    throw new Error("address length must be 42");
  }
  if (!address.startsWith("0x")) {
    throw new Error("address must start with 0x");
  }
  if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
    // check if it has the basic requirements of an address
    throw new Error("address must consist only of valid hex characters after 0x");
  } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
    // If it's all small caps or all all caps, return true
    return;
  } else {
    // Otherwise check each case
    return utils.getAddress(address);
  }
}

export { waitBscTransaction, validateBSCAddress };
