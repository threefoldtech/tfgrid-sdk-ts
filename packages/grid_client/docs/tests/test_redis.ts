// import { createClient } from 'redis';

import { log } from "../../scripts/utils";

// const client = createClient({
//     url: 'redis://[302:9e63:7d43:b742:469d:3ec2:ab15:f75e]:9900'
// })

//  client.connect()


const redis = require('redis');
const client = redis.createClient({
        host: '302:9e63:7d43:b742:469d:3ec2:ab15:f75e',
        port: 9900
    });

// client.on('error', err => {
//     console.log('Error ' + err);
// });


// client.set('foo', 'bar', (err, reply) => {
//     if (err) throw err;
//     console.log(reply);
// });

// client.get('foo', (err, reply) => {
//     if (err) throw err;
//     console.log(reply);
// });

const command = 'select 39-12107-hamada testzdb'

const command2 = 'nsinfo'

// client.sendCommand('nsinfo',['39-12107-hamada'], (err, reply) => {
//     // log(reply);
//     log(err);
//     const splittedRes = reply.split("\n");
//     log(splittedRes[1]);
//     log(splittedRes[20]);
//     const diskValue = splittedRes[20].match(/^\d+|\d+\b|\d+(?=\w)/g);
//     log(+diskValue[0]);
    
// });

client.sendCommand("SELECT",["39-12141-hamada", "testzdb"], function(err, reply){
    log(reply);
    log(err);
});


// client.send_command(
//   "SELECT", ["39-12107-hamada", "testzdb"], 
//   function(err, reply){
//     if (err){
//       // ERROR
//     }else{
//       console.log(reply)
//       // OK
//     }
//   }
// )

client.quit();
