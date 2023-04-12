import { mnemonicToMiniSecret } from "@polkadot/util-crypto";
import nacl from "tweetnacl";
import utils from "tweetnacl-util";

const secret = mnemonicToMiniSecret("fiscal play spin all describe because stem disease coral call bronze please");
const keypair = nacl.box.keyPair.fromSecretKey(secret);
const message = "hamadaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

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
    return utils.encodeBase64(fullMessage);
}

function decrypt(message: string) {
    const encodedMessage = utils.decodeBase64(message);
    const encryptedMessage = encodedMessage.slice(0, -24);
    const nonce = encodedMessage.slice(-24);
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

