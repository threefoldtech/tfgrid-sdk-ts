import { Asset, Keypair, Memo, Networks, Operation, TransactionBuilder } from "@stellar/stellar-sdk";
import * as StellarSdk from "@stellar/stellar-sdk";
import bs58 from "bs58";
import { Buffer } from "buffer";

const STELLAR_HORIZON = "https://horizon.stellar.org";

const server = new StellarSdk.Horizon.Server(STELLAR_HORIZON);
// ThreeFold Bridge Details
export const BRIDGE_ADDRESS = "GAC65XJVXMBPHKGVWRR4ZX6MA66I4JAOEAIMOVRIXALL3NO67UYMIWMZ";
const TFT_ASSET = new Asset("TFT", "GBOVQKJYHXRR3DX6NOX2RRYFRCUMSADGDESTDNBDS6CDVLGVESRTAC47");

export const transferTFT = async (senderSecret: string, solanaRecipientAddress: string, amount: string) => {
  const senderKeypair = Keypair.fromSecret(senderSecret);
  const senderAccount = await server.loadAccount(senderKeypair.publicKey());

  // Convert Solana address to 32-byte memo
  const solanaAddressBytes = bs58.decode(solanaRecipientAddress);

  const memoHash = Memo.hash(Buffer.from(solanaAddressBytes));

  const transaction = new TransactionBuilder(senderAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: Networks.PUBLIC,
  })
    .addOperation(
      Operation.payment({
        destination: BRIDGE_ADDRESS,
        asset: TFT_ASSET,
        amount: amount,
      }),
    )
    .addMemo(memoHash)
    .setTimeout(180)
    .build();

  transaction.sign(senderKeypair);

  try {
    const result = await server.submitTransaction(transaction);
    return result;
  } catch (error) {
    console.log(error);
    console.error("Bridge transfer failed:", (error as unknown as any).response?.data?.extras);
    throw error;
  }
};
