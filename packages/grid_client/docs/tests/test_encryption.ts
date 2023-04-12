import { mnemonicToMiniSecret } from "@polkadot/util-crypto";
import nacl from "tweetnacl";
import utils from "tweetnacl-util";
import { uncompress, compress } from "snappyjs";

const secret = mnemonicToMiniSecret("fiscal play spin all describe because stem disease coral call bronze please");
const keypair = nacl.box.keyPair.fromSecretKey(secret);
const message = "hamadaaa";

function encrypt(message) {
    const encodedMessage = utils.decodeUTF8(message);
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const encryptedMessage = nacl.box(
        encodedMessage,
        nonce,
        keypair.publicKey,
        keypair.secretKey
    );
    const fullMessage = Uint8Array.from([...encryptedMessage, ...nonce]);
    const compressedMessage = compress(fullMessage);
    return utils.encodeBase64(compressedMessage as Uint8Array);
}

function decrypt(message: string) {
    const encodedMessage = utils.decodeBase64(message);
    const uncompressedMessgae = uncompress(encodedMessage) as Uint8Array;
    const encryptedMessage = uncompressedMessgae.slice(0, -24);
    const nonce = uncompressedMessgae.slice(-24);
    const decryptedMessage = nacl.box.open(
        encryptedMessage,
        nonce,
        keypair.publicKey,
        keypair.secretKey
    );

    return utils.encodeUTF8(decryptedMessage);
}

const encryptedMessage = encrypt(message);
console.log(encryptedMessage);
const decryptedMessage = decrypt(encryptedMessage);
console.log(decryptedMessage);

