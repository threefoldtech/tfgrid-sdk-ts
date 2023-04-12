import { log } from "../../scripts/utils";

const fs = require('fs')
const path = require('path')
const os = require('os')
const {NodeSSH} = require('node-ssh')

const ssh = new NodeSSH()



async function main() {

    await ssh.connect({
        host: '300:68f9:dc9f:d10e:b367:2ca9:bf76:aa0f',
        username: 'root',
        privateKeyPath: os.homedir() + '/.ssh/id_ed25519',
    });

      
    // await ssh.execCommand('lscpu').then(function(result) {
    //     //   log(result.stdout)
    //       const splittedRes = (result.stdout).split("\n")
    //       log(splittedRes[4]);
    // });

    await ssh.execCommand('df -h').then(function(result) {

          log(result.stdout)
          log(result.stderr);
          log(result.code);
          
        //   const splittedRes = (result.stdout).split("\n")
        //   log(splittedRes[1]);
    });

//     await ssh.execCommand('df -h').then(function(result) {
//         log(result.stdout)
//         // const splittedRes = (result.stdout).split("\n")
//         // log(splittedRes[3]);
//   });

    await ssh.dispose();

}

main();
