import { default as md5 } from "crypto-js/md5";
import { setTimeout } from "timers/promises";
import { default as urlParser } from "url-parse";
import { inspect } from "util";

import { getClient } from "./client_loader";

const os = require("os");

function log(message) {
  console.log(inspect(message, { showHidden: false, depth: null, colors: true }));
}

function generateHash(word: string) {
  return md5(word).toString();
}

function generateInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

function splitIP(ip: string) {
  const str = ip,
    delimiter = ".",
    start = 2,
    splitString = str.split(delimiter).slice(0, start),
    formattedString = splitString.join(delimiter);

  return formattedString;
}

function bytesToGB(bytes: number) {
  return bytes * Math.pow(1024, 3);
}

async function RemoteRun(host, user) {
  const { NodeSSH } = require("node-ssh");
  const ssh = new NodeSSH();

  await ssh.connect({
    host: host,
    username: user,
    privateKeyPath: os.homedir() + "/.ssh/id_ed25519",
    readyTimeout: 60000,
  });

  return ssh;
}

async function returnRelay() {
  const client = await getClient();
  const network = client.clientOptions.network;
  const urls = client.getDefaultUrls(network);
  const relay = urlParser(urls.relay).hostname;
  return relay;
}

async function k8sWait(masterSSHClient, k8sMasterName, k8sWorkerName, waitTime, k8sNewWorkerName?) {
  let reachable = false;
  for (let i = 0; i < 40; i++) {
    await masterSSHClient.execCommand("source /etc/profile && kubectl get nodes").then(async function (result) {
      const res = result.stdout;
      if (typeof k8sNewWorkerName !== "undefined") {
        if (
          res.includes(k8sMasterName.toLowerCase()) &&
          res.includes(k8sWorkerName.toLowerCase() && res.includes(k8sNewWorkerName.toLowerCase()))
        ) {
          reachable = true;
        }
      } else {
        if (res.includes(k8sMasterName.toLowerCase()) && res.includes(k8sWorkerName.toLowerCase())) {
          reachable = true;
        }
      }
    });
    if (reachable) {
      break;
    }
    setTimeout(waitTime);
  }
}

export { log, generateHash, generateInt, splitIP, bytesToGB, RemoteRun, returnRelay, k8sWait };
