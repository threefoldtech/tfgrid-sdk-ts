import {DeploymentFactory} from "../../src/primitives/deployment"
import { HTTPMessageBusClient } from "ts-rmb-http-client";

import { GridClient, NetworkEnv, BackendStorageType, KeypairType } from "../../src";



const d = {
    version: 0,
twin_id: 26,
contract_id: 4903,
metadata: "{'testVMs': true}",
description: 'test deploying VMs via ts grid3 client',
expiration: 0,
signature_requirement: {
  requests: [ { twin_id: 26, required: false, weight: 1 } ],
  weight_required: 1,
  signatures: [
    {
      twin_id: 26,
      signature: 'a447ab29cf760166c8812a0837fdbd29387999548d5f8d57e245eff279fd757555131d74301be95458dd45cabb7d4805dced14815f18cd9cfa51d1359c216085',
      signature_type: 'sr25519'
    }
  ],
  signature_style: ''
},
workloads: [
  {
    version: 0,
    name: 'wedDisk',
    type: 'zmount',
    data: { size: 8589934592, __type: 'zmount' },
    metadata: "{'testVMs': true}",
    description: 'test deploying VMs via ts grid3 client',
    result: {
      created: 1657207911,
      state: 'ok',
      message: '',
      data: { volume_id: '26-4903-wedDisk', __type: 'zmount' }
    }
  },
  {
    version: 0,
    name: 'testvm',
    type: 'zmachine',
    data: {
      flist: 'https://hub.grid.tf/tf-official-apps/base:latest.flist',
      network: {
        public_ip: '',
        interfaces: [ { network: 'wedtest', ip: '10.249.2.2' } ],
        planetary: true
      },
      size: 0,
      compute_capacity: { cpu: 1, memory: 2147483648 },
      mounts: [ { name: 'wedDisk', mountpoint: '/testdisk' } ],
      entrypoint: '/sbin/zinit init',
      env: {
        SSH_KEY: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCa5srzZwh3ulajtY2EZ1SiPY1JNelcaP8O/FZqrnJi6OxAPijl0KzoNrzgemqxhAS/eIglBYbgQuw/Po15MtdMgXmfrtNgrZjQQtLxGFz5KmUbzawPGI7iRkN40LEo0y0hcGLV1G+YiNO+3YU7K5I+gos+04OUJe4HYjcp92nAEviqxa40po2f67KgP5xrZxaOpELZA/hIf1wCzCyTsdvu3k+hw1QlSTIso6WTcUw7LLssvxAs7JZ31kgx+L740xQJWsiVv/go3td0GuETfRSbfjBtOD/wIEHG5UtazOrR+8ukotqQ/ERWuyx1abaEKwro3fLunmjhfgDbnJYy7As1 ahmed@ahmed-Inspiron-3576'
      },
      corex: false,
      __type: 'zmachine'
    },
    metadata: "{'testVMs': true}",
    description: 'test deploying VMs via ts grid3 client',
    result: {
      created: 1657207916,
      state: 'ok',
      message: '',
      data: {
        id: '26-4903-testvm',
        ip: '10.249.2.2',
        ygg_ip: '300:487a:7ea1:5b4e:5d33:1427:39e:b5e5',
        __type: 'zmachine'
      }
    }
  },
  {
    version: 0,
    name: 'wedtest',
    type: 'network',
    data: {
      subnet: '10.249.2.0/24',
      ip_range: '10.249.0.0/16',
      wireguard_private_key: 'yWOXVk+H7a4653kPIaTaqkisdvIeithnvKURnHaKcxk=',
      wireguard_listen_port: 7846,
      peers: [],
      node_id: 17,
      __type: 'network'
    },
    metadata: "{'testVMs': true}",
    description: 'test deploying VMs via ts grid3 client',
    result: {
      created: 1657207911,
      state: 'ok',
      message: '',
      data: { __type: 'network' }
    }
  }
]
}

async function getClient() {
    const rmbClient = new HTTPMessageBusClient(0, "", "", "");
    const gridClient = new GridClient(NetworkEnv.qa, "miss secret news run cliff lens exist clerk lucky cube fall soldier", "secret", rmbClient, "", BackendStorageType.auto, KeypairType.sr25519);
    await gridClient.connect();
    const df = new DeploymentFactory(GridClient.config)
    const hamada = await df.fromObj(d)
    console.log(hamada)
    gridClient.disconnect();
}
getClient();
