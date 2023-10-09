import { Keyring } from "@polkadot/keyring";
import { waitReady } from "@polkadot/wasm-crypto";
import axios from "axios";
import { Buffer } from "buffer";
import cors from "cors";
import MD5 from "crypto-js/md5";
import express, { Express, Request, Response } from "express";

const app: Express = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

export enum KeypairType {
  sr25519 = "sr25519",
  ed25519 = "ed25519",
}

type Payload = {
  twinid?: number;
  pdfUrl?: string;
  pubkey: string;
  content?: string;
  signature: string;
  keypairType: KeypairType;
};

const verify = async (payload: Payload) => {
  try {
    const hash = MD5(payload.content!).toString();

    const messageBytes = Uint8Array.from(Buffer.from(hash.toString(), "hex"));
    const keyring = new Keyring({ type: payload.keypairType });

    await waitReady();

    const key = keyring.addFromAddress(payload.pubkey);
    const sig = Uint8Array.from(Buffer.from(payload.signature, "hex"));

    // Verify and return the signature
    return key.verify(messageBytes, sig, key.publicKey);
  } catch (error) {
    console.error(error);
    // Handle any errors that occur during the verification process
    throw new Error("An error occurred while verifying the signature or fetching/processing the PDF content.");
  }
};

app.post("/api/verify", async (req: Request, res: Response) => {
  const payload: Payload = req.body;
  let content: Uint8Array = new Uint8Array();
  try {
    if (payload.pdfUrl) {
      const response = await axios.get(payload.pdfUrl, { responseType: "arraybuffer" });
      content = Uint8Array.from(Buffer.from(response.data, "base64"));
      payload.content = content.toString();
    }

    const verified = await verify(payload);

    if (verified) {
      res.status(200).json({
        message: "The signature was verified successfully.",
        data: verified,
      });
    } else {
      res.status(400).json({
        message: "Failed to verify the signature.",
        data: verified,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "error", data: "An error occurred while verifying the signature." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
