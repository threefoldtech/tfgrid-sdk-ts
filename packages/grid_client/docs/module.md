# Modules

## Add Module

Module should be:

- In [modules directory](../src/modules).
- A class and its methods should have [expose decorater](../src/helpers/expose.ts)
- Exported in [index file](../src/modules/index.ts)
- Added to GridClient class in [client.ts file](../src/client.ts)

## Supported Modules

### Twins

**Note:** Each network has its own relay. So, the relay would be
"relay.${network}.grid.tf" in all networks except for main. It would be "relay.grid.tf".

- **Create**
  cmd: `client.twins.create`

  payload: `'{"relay": "<relay>"}'`

- **Update**
  cmd: `client.twins.update`

  payload: `'{"relay": "<relay>"}'`

- **Get**

  cmd: `client.twins.get`

  payload: `'{"id": <twin id>}'`

- **Get my twin id**
  cmd: `client.twins.get_my_twin_id`

  payload: `""`

- **Get twin id by account id**

  cmd: `client.twins.get_twin_id_by_account_id`

  payload: `'{"public_key": <substrate account id>}'`

### Contracts

- **Create Node Contract**

  cmd: `client.contracts.create_node`

  payload: `'{"node_id": "<zos node id>", "hash": "<deployment challenge hash>", "data": "<deployment data>", "public_ip": <number of public IPs>, "solutionProviderId": "<solution provider id(optional)>"}'`

- **Create Name Contract**

  cmd: `client.contracts.create_name`

  payload: `'{"name": "<contract name>"}'`

- **Create Rent Contract**

  cmd: `client.contracts.createRent`

  payload: `'{"nodeId": "<zos node id>", "solutionProviderId": "<solution provider id(optional)>"}'`

- **Get**

  cmd: `client.contracts.get`

  payload: `'{"id": <contract id>}'`

- **Get contract id by node id and hash**

  cmd: `client.contracts.get_contract_id_by_node_id_and_hash`

  payload: `'{"node_id":  "<zos node id>, "hash": <deployment challenge hash>}'`

- **Get name contract**

  cmd: `client.contracts.get_name_contract`

  payload: `'{"name": <contract name>}'`

- **Get Extra fee for dedicated node**

  cmd: `client.contracts.getDedicatedNodeExtraFee`

  payload: `'{"nodeId":  "<zos node id>"}'`

- **Set Extra fee for dedicated node**

  cmd: `client.contracts.setDedicatedNodeExtraFee`

  payload: `'{"nodeId":  "<zos node id>", "extraFee" : "< extre fee for dedicated node>"}'`

- **Get Active contracts**

  cmd: `client.contracts.getActiveContracts`

  payload: `'{"nodeId":  "<zos node id>"}'`

- **Get Active Rent contracts for a node**

  cmd: `client.contracts.activeRentContractForNode`

  payload: `'{"nodeId":  "<zos node id>"}'`

- **Update Node**

  cmd: `client.contracts.update_node`

  payload: `'{"id": <contract id>, "hash": "<deployment challenge hash>", "data": "<deployment data>"}'`

- **Cancel**

  cmd: `client.contracts.cancel`

  payload: `'{"id": <contract id>}'`

- **List all my contracts**

  cmd: `client.contracts.listMyContracts`

  payload: `'{"address": "<wallet address>"}'`

- **Cancel all my contracts**

  cmd: `client.contracts.cancelMyContracts`

  payload: `'{""}'`

- **List contracts by wallet TwinId**

  cmd: `client.contracts.listContractsByTwinId`

  payload: `'{"twinId": <twin id>}'`

- **List contracts by wallet address**

  cmd: `client.contracts.listContractsByAddress`

  payload: `'{"address": <wallet address>}'`

- **Create Service Contract**

  cmd: `client.contracts.createServiceContract`

  payload: `'{"serviceAccount": <service account address>, "consumerAccount": <consumer account address>}'`

- **Approve Service Contract**

  cmd: `client.contracts.approveServiceContract`

  payload: `'{"serviceId": <service contract id>, "approve": <approval of service contract>}'`

- **Bill Service Contract**

  cmd: `client.contracts.billServiceContract`

  payload: `'{"serviceId": <service contract id>, "variableAmount": <bill amount>, "metadata": <metadata>}'`

- **Cancel Service Contract**

  cmd: `client.contracts.cancelServiceContract`

  payload: `'{"serviceId": <service contract id>}'`

- **Set Fees of Service Contract**

  cmd: `client.contracts.setFeesServiceContract`

  payload: `'{"serviceId": <service contract id>, "baseFee": <base fee of serivce contract>, "variableFee": <variable fee of serivce contract>}'`

- **Set Metadata of Service Contract**

  cmd: `client.contracts.setMetadataServiceContract`

  payload: `'{"serviceId": <service contract id>, "metadata": <metadata>}'`

- **Get Service Contract**

  cmd: `client.contracts.getServiceContract`

  payload: `'{"serviceId": <service contract id>}'`

### Nodes

- **Reserve Node**
  cmd: `client.nodes.reserve`

  payload: `'{"nodeId": "<zos node id>"}'`

- **Unreserve Node**
  cmd: `client.nodes.unreserve`

  payload: `'{"nodeId": "<zos node id>"}'`

- **Get Rent Contract by id**
  cmd: `client.nodes.getRentContractId`

  payload: `'{"nodeId": "<zos node id>"}'`

- **Set Node Power**
  cmd: `client.nodes.setNodePower`

  payload: `'{"nodeId": "<zos node id>" , "power": "<node power to be true or false>"}'`

- **Add Node PublicConfig**

  cmd: `client.nodes.addNodePublicConfig`

  payload: `'{"farmId": "<farm id>" , "node Id": "<zos node id>" , "ip4": "<public ip4(optional)>" , "ip6": "<public ip6(optional)>", "domain": "<domain(optional)>"}'`

- **Get all nodes**
  cmd: `client.nodes.all`

  payload: `""`

### Farms

- **Create Farm**
  cmd: `client.farms.create`

  payload: `'{"name": "<farm name>" , "publicIps": "<list of public ips(optional)>"}'`

- **Add Farm Ip**
  cmd: `client.farms.addFarmIp`

  payload: `'{"farmId": "<farm id>" , "ip": "<public ip>" , "gw": "<gateway>"}'`

- **Remove Farm Ip**
  cmd: `client.farms.removeFarmIp`

  payload: `'{"farmId": "<farm id>" , "ip": "<public ip>" }'`

- **Add Stellar Address**
  cmd: `client.farms.addStellarAddress`

  payload: `'{"farmId": "<farm id>" , "stellarAddress": "<stellar address>" }'`

- **Get Fram By Id**

  cmd: `client.farms.getFarmByID`

  payload: `'{"id": "<farm id>"}'`

### Networks

- **Add Node to network**
  cmd: `client.networks.addNode`

  payload: `'{"name": "<network name>" , "ipRange": "<Public ips range>", "nodeId": "<zos node id>", "mycelium": "<Flag for mycelium>", "solutionProviderId": "<solution provider id>(optional)", "description": "<description>(optional)", "myceliumSeed": "<Hex mycelium seed>(optional)"}'`

- **List**
  cmd: `client.networks.list`

  payload: `''`

- **Check if network has Node**
  cmd: `client.networks.hasNode`

  payload: `'{"name": "<network name>" , "ipRange": "<Public ips range>", "nodeId": "<zos node id>" }'`

- **Get WireGaurd Configs**
  cmd: `client.networks.getWireGuardConfigs`

  payload: `'{"name": "<network name>" , "ipRange": "<Public ips range>", "nodeId": "<zos node id>" }'`

### ZOS

- **Deploy**

  cmd: `client.zos.deploy`

  payload: the same as zos deployment without signing with additional parameter `'{"node_id": <zos node id> }'`

- **Get deployment**

  cmd: `client.zos.getDeployment`

  payload: `'{"contractId": <your contract id>}'`

- **Ping Node**

  cmd: `client.zos.pingNode`

  payload: `'{"nodeId": <zos node id>}'`

- **Get Node Statistics**

  cmd: `client.zos.getNodeStatistics`

  payload: `'{"nodeId": <zos node id>}'`

- **Check if node has PublicIPv6**

  cmd: `client.zos.hasPublicIPv6`

  payload: `'{"nodeId": <zos node id>}'`

- **List Network Interfaces**

  cmd: `client.zos.listNetworkInterfaces`

  payload: `'{"nodeId": <zos node id>}'`

- **List Network PublicIPs**

  cmd: `client.zos.listNetworkPublicIPs`

  payload: `'{"nodeId": <zos node id>}'`

- **Get Network PublicConfig**

  cmd: `client.zos.getNetworkPublicConfig`

  payload: `'{"nodeId": <zos node id>}'`

- **Get Storage Pools**

  cmd: `client.zos.getStoragePools`

  payload: `'{"nodeId": <zos node id>}'`

- **Get Node GPU Info**

  cmd: `client.zos.getNodeGPUInfo`

  payload: `'{"nodeId": <zos node id>}'`

- **Get Node PerfTests**

  cmd: `client.zos.getNodePerfTests`

  payload: `'{"nodeId": <zos node id>}'`

- **Get Node IP Validation**

  cmd: `client.zos.getNodeIPValidation`

  payload: `'{"nodeId": <zos node id>}'`

- **Get Node CPU Test**

  cmd: `client.zos.getNodeCPUTest`

  payload: `'{"nodeId": <zos node id>}'`

### Generic Machines

- **Deploy**

  cmd: `client.machines.deploy`

  payload:

  ```json
  {
          "name": "wed1310t1",
          "network": {
              "ip_range": "10.203.0.0/16",
              "name": "wed159n3",
               "myceliumSeeds": [
                {
                  "nodeId": 3,
                  "seed": "050d109829d8492d48bfb33b711056080571c69e46bfde6b4294c4c5bf468a76", //(HexSeed of length 32)
                },
              ],
          },
          "machines": [{
              "name": "wed1310t2",
              "node_id": 3,
              "disks": [
                  {
                      "name": "wed1310d2",
                      "size": 10,
                      "mountpoint": "/hamada"
                  }
              ],
              "qsfs_disks":[
                  {
                      "qsfs_zdbs_name": "hamada",
                      "name": "mon2410t2",
                      "prefix": "hamada",
                      "cache": 1, // in GB
                      "minimal_shards": 2,
                      "expected_shards": 4,
                      "encryption_key": "hamada",
                      "mountpoint": "/ahmed",
                  }
              ],
              "public_ip": false,
              "planetary": true,
              "mycelium": false,
              "myceliumSeed": "1e1404279b3d", //(HexSeed of length 6)
              "cpu": 1,
              "memory": 1024,
              "rootfs_size": 1,
              "flist": "https://hub.grid.tf/tf-official-apps/base:latest.flist",
              "entrypoint": "/sbin/zinit init",
              "env": {
                  "SSH_KEY": "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDmm8OzLt+lTdGaMUwMFcw0P+vr+a/h/UsR//EzzeQsgNtC0bdls4MawVEhb3hNcycEQNd2P/+tXdLC4qcaJ6iABYip4xqqAeY098owGDYhUKYwmnMyo+NwSgpjZs8taOhMxh5XHRI+Ifr4l/GmzbqExS0KVD21PI+4sdiLspbcnVBlg9Eg9enM///zx6rSkulrca/+MnSYHboC5+y4XLYboArD/gpWy3zwIUyxX/1MjJwPeSnd5LFBIWvPGrm3cl+dAtADwTZRkt5Yuet8y5HI73Q5/NSlCdYXMtlsKBLpJu3Ar8nz1QfSQL7dB8pa7/sf/s8wO17rXqWQgZG6JzvZ root@ahmed-Inspiron-3576"
              }
          }],
          "corex": true,
          "gpus": ["0000:03:00.0/1002/15d8"],  //gpus ids
          "metadata": "",
          "description": ""
      };

  ```

  > **Note:** disk size and rootfs_size in GB, memory in MB, disk name should be different than the machine name

- **Update**

  cmd: `client.machines.update`

  payload: `same as deploy method`

- **List**

  cmd: `client.machines.list`

  payload: `""`

- **Get**

  cmd: `client.machines.get`

  payload: `{"name": "<deployment name>"}`

- **Delete**

  cmd: `client.machines.delete`

  payload: `{"name": "<deployment name>"}`

- **Add machine**

  cmd: `client.machines.add_machine`

  payload:

  ```json
  {
    "deployment_name": "wed1310t1",
    "name": "wed1310m4",
    "node_id": 2,
    "disks": [
      {
        "name": "wed1310d4",
        "size": 10,
        "mountpoint": "/hamada"
      }
    ],
    "public_ip": false,
    "planetary": true,
    "cpu": 1,
    "memory": 1024,
    "rootfs_size": 1,
    "flist": "https://hub.grid.tf/tf-official-apps/base:latest.flist",
    "entrypoint": "/sbin/zinit init",
    "env": {
      "SSH_KEY": "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDmm8OzLt+lTdGaMUwMFcw0P+vr+a/h/UsR//EzzeQsgNtC0bdls4MawVEhb3hNcycEQNd2P/+tXdLC4qcaJ6iABYip4xqqAeY098owGDYhUKYwmnMyo+NwSgpjZs8taOhMxh5XHRI+Ifr4l/GmzbqExS0KVD21PI+4sdiLspbcnVBlg9Eg9enM///zx6rSkulrca/+MnSYHboC5+y4XLYboArD/gpWy3zwIUyxX/1MjJwPeSnd5LFBIWvPGrm3cl+dAtADwTZRkt5Yuet8y5HI73Q5/NSlCdYXMtlsKBLpJu3Ar8nz1QfSQL7dB8pa7/sf/s8wO17rXqWQgZG6JzvZ root@ahmed-Inspiron-3576"
    }
  }
  ```

- **Delete machine**

  cmd: `client.machines.delete_machine`

  payload:

  ```json
  {
    "deployment_name": "wed1310t1",
    "name": "wed1310m2"
  }
  ```

### Kubernetes

single master and multiple workers.

- **Deploy**

  cmd: `client.k8s.deploy`

  payload:

  ```json
  {
    "name": "mon69t5",
    "secret": "hamadaellol",
    "network": {
      "name": "hamadanet",
      "ip_range": "10.201.0.0/16",
      "addAccess": true,
      "myceliumSeeds": [
        {
          "nodeId": 3,
          "seed": "a5f0ea16a744af2c0c23fc878d727a6f355079f82d979ad4bc75dd8fb5ebc90e" //(HexSeed of length 32)
        },
        {
          "nodeId": 2,
          "seed": "7edd9c250f834cb326c3cf116040cf2214f38c669bf27a72e2f5b9e44fc7b27e" //(HexSeed of length 32)
        }
      ]
    },
    "masters": [
      {
        "name": "master1",
        "node_id": 3,
        "cpu": 1,
        "memory": 1024,
        "rootfs_size": 1,
        "disk_size": 15,
        "public_ip": true,
        "public_ip6": false,
        "planetary": true,
        "mycelium": true,
        "myceliumSeed": "1791fed39e0f" //(HexSeed of length 6)
      }
    ],
    "workers": [
      {
        "name": "worker1",
        "node_id": 2,
        "cpu": 1,
        "memory": 1024,
        "rootfs_size": 1,
        "disk_size": 15,
        "public_ip": false,
        "public_ip6": false,
        "planetary": true,
        "mycelium": true,
        "myceliumSeed": "580bafd349f5" //(HexSeed of length 6)
      }
    ],
    "metadata": "",
    "description": "",
    "ssh_key": "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDmm8OzLt+lTdGaMUwMFcw0P+vr+a/h/UsR//EzzeQsgNtC0bdls4MawVEhb3hNcycEQNd2P/+tXdLC4qcaJ6iABYip4xqqAeY098owGDYhUKYwmnMyo+NwSgpjZs8taOhMxh5XHRI+Ifr4l/GmzbqExS0KVD21PI+4sdiLspbcnVBlg9Eg9enM///zx6rSkulrca/+MnSYHboC5+y4XLYboArD/gpWy3zwIUyxX/1MjJwPeSnd5LFBIWvPGrm3cl+dAtADwTZRkt5Yuet8y5HI73Q5/NSlCdYXMtlsKBLpJu3Ar8nz1QfSQL7dB8pa7/sf/s8wO17rXqWQgZG6JzvZ root@ahmed-Inspiron-3576"
  }
  ```

  > **Note:** disk size and rootfs_size in GB, memory in MB, masters and workers names should be different

- **List**

  cmd: `client.k8s.list`

  payload: `""`

- **Get**

  cmd: `client.k8s.get`

  payload: `{"name": "<deployment name>"}`

- **Delete**

  cmd: `client.k8s.delete`

  payload: `{"name": "<deployment name>"}`

- **Add worker**

  cmd: `client.k8s.add_worker`

  payload:

  ```json
  {
    "deployment_name": "sun199t2",
    "name": "sun199t1worker5",
    "node_id": 5,
    "cpu": 2,
    "memory": 1024,
    "rootfs_size": 1,
    "disk_size": 15,
    "public_ip": false,
    "planetary": true,
    "mycelium": true,
    "myceliumSeed": "580bafd349f5" //(HexSeed of length 6)
  }
  ```

- **Delete worker**

  cmd: `client.k8s.delete_worker`

  payload:

  ```json
  {
    "deployment_name": "sun199t2",
    "name": "sun199t1worker5"
  }
  ```

### zdb

- **Deploy**

  cmd: `client.zdbs.deploy`

  payload:

  ```json
  {
    "name": "hamada",
    "zdbs": [
      {
        "name": "zdb1",
        "node_id": 3,
        "mode": "seq",
        "disk_size": 10,
        "public": true,
        "password": "hamadaellol"
      },
      {
        "name": "zdb2",
        "node_id": 3,
        "mode": "seq",
        "disk_size": 10,
        "public": true,
        "password": "hamadaellol"
      }
    ],
    "metadata": "",
    "description": ""
  }
  ```

  > **Note:** disk size in GB, zdb names should be different

- **List**

  cmd: `client.zdbs.list`

  payload: `""`

- **Get**

  cmd: `client.zdbs.get`

  payload: `{"name": "<deployment name>"}`

- **Delete**

  cmd: `client.zdbs.delete`

  payload: `{"name": "<deployment name>"}`

- **Add zdb**

  cmd: `client.zdbs.add_zdb`

  payload:

  ```json
  {
    "deployment_name": "sun199t1",
    "name": "hamada1",
    "node_id": 2,
    "mode": "seq",
    "disk_size": 10,
    "public": true,
    "password": "hamada12345"
  }
  ```

- **Delete zdb**

  cmd: `client.zdbs.delete_zdb`

  payload:

  ```json
  {
    "deployment_name": "sun199t1",
    "name": "hamada1"
  }
  ```

### QSFS Zdbs

- **Deploy**

  cmd: `client.qsfs_zdbs.deploy`

  payload:

  ```json
  {
    "name": "hamada",
    "count": 3,
    "node_ids": [3, 5],
    "disk_size": 10,
    "password": "hamadaellol",
    "metadata": "",
    "description": ""
  }
  ```

  > **Note:** disk size in GB

- **List**

  cmd: `client.qsfs_zdbs.list`

  payload: `""`

- **Get**

  cmd: `client.qsfs_zdbs.get`

  payload: `{"name": "<deployment name>"}`

- **Delete**

  cmd: `client.qsfs_zdbs.delete`

  payload: `{"name": "<deployment name>"}`

### Blockchain

- **Create**
  It will create a new account on the given blockchain type `<stellar, algorand or tfchain>`.

  cmd: `client.blockchain.create`

  payload:

  ```json
  {
    "name": "mywallet",
    "blockchain_type": "<stellar, algorand or tfchain>",
    "relay": "<required for tfchain>" // optional
  }
  ```

  return:

  ```json
  {
    "name": "mywallet",
    "public_key": "<wallet address>",
    "mnemonic": "<wallet mnemonic>",
    "twinId": "<wallet twinId>", // optional
    "blockchain_type": "<stellar, algorand or tfchain>"
  }
  ```

- **Select**
  It will select a wallet to be used.

  cmd: `client.blockchain.select`

  payload:

  ```json
  {
    "name": "mywallet"
  }
  ```

- **Init**
  It will return the wallet address after importing the wallet and saving it.

  cmd: `client.blockchain.init`

  payload:

  ```json
  {
    "name": "mywallet",
    "secret": "<wallet secret>",
    "blockchain_type": "<stellar, algorand or tfchain>"
  }
  ```

- **Get**
  It will return the wallet.

  cmd: `client.blockchain.get`

  payload: `""`

  return:

  ```json
  {
    "name": "<wallet name>",
    "public_key": "<wallet address>",
    "mnemonic": "<wallet mnemonic>",
    "twinId": "<wallet twinId>", // optional
    "blockchain_type": "<stellar, algorand or tfchain>"
  }
  ```

- **Exist**

  cmd: `client.blockchain.exist`

  payload: `{"name": "<wallet name>"}`

- **List**

  cmd: `client.blockchain.list`

  payload:

  ```json
  //optional
  {
    "blockchain_type": "<stellar, algorand or tfchain>"
  }
  ```

  return:

  ```json
  [
      {
          "name": "<wallet name>",
          "public_key": "<wallet address>",
          "blockchain_type": "<stellar, algorand or tfchain>"
      },
      ...
  ]
  ```

- **Assets**
  It will list all the assets in a given wallet

  cmd: `client.blockchain.assets`

  payload: `""`

  return:

  ```json
  {
      "name": "<wallet name>",
      "public_key": "<wallet address>",
      "blockchain_type": "<stellar, algorand or tfchain>",
      "assets":
      [
          {
              "asset": "<wallet asset>",
              "amount": "<asset balance>"
          },
          ...
      ]
  }

  ```

- **Pay**

  cmd: `client.blockchain.pay`

  payload: `""`

  ```json
  {
    "name": "<wallet name>",
    "address_dest": "<target wallet address>",
    "blockchain_type_dest": "<stellar, algorand or tfchain>",
    "amount": 10,
    "asset": "<asset>",
    "description": "<description>"
  }
  ```

- **Delete**

  cmd: `client.blockchain.delete`

  payload: `""`

- **Sign**

  cmd: `client.blockchain.sign`

  payload: `""`

  ```json
  {
    "content": "<your message>"
  }
  ```

### Stellar

- **Create**
  It will create a new account on stellar testnet.

  cmd: `client.stellar.create`

  payload:

  ```json
  {
    "name": "mywallet"
  }
  ```

  return:

  ```json
  {
    "name": "mywallet",
    "public_key": "<wallet address>",
    "mnemonic": "<your mnemonic>",
    "blockchain_type": "stellar"
  }
  ```

- **Init**
  It will return the wallet address after importing the wallet and saving it.

  cmd: `client.stellar.init`

  payload:

  ```json
  {
    "name": "mywallet",
    "secret": "<wallet secret>"
  }
  ```

- **Get**
  It will return the wallet.

  cmd: `client.stellar.get`

  payload: `{"name": "<wallet name>"}`

  return:

  ```json
  {
    "name": "<wallet name>",
    "public_key": "<wallet address>",
    "mnemonic": "<your mnemonic>",
    "blockchain_type": "stellar"
  }
  ```

- **Update**
  It will return the new wallet address after updating the wallet and saving it.

  cmd: `client.stellar.update`

  payload:

  ```json
  {
    "name": "mywallet",
    "secret": "<wallet secret>"
  }
  ```

- **Exist**

  cmd: `client.stellar.exist`

  payload: `{"name": "<wallet name>"}`

- **List**

  cmd: `client.stellar.list`

  payload: `""`

  return:

  ```json
  [
      {
          "name": "<wallet name>",
          "public_key": "<wallet public key>",
          "blockchain_type": "stellar"
      },
      ...
  ]
  ```

- **Assets**
  It will list all the assets in a given wallet

  cmd: `client.stellar.assets`

  payload: `{"name": "<wallet name>"}`

  return:

  ```json
  {
      "name": "<wallet name>",
      "public_key": "<wallet public key>",
      "blockchain_type": "stellar",
      "assets":
      [
          {
              "asset": "<wallet asset>",
              "amount": "<asset balance>"
          },
          ...
      ]
  }
  ```

- **Balance by address**
  It will list the balance for all assets given a wallet address.

  cmd: `client.stellar.balance_by_address`

  payload: `{"address": "<wallet address>"}`

  return:

  ```json
  [
      {
          "asset": "<wallet asset>",
          "amount": "<asset balance>"
      },
      ...
  ]
  ```

- **Pay**

  cmd: `client.stellar.pay`

  payload:

  ```json
  {
    "name": "<wallet name>",
    "address_dest": "<target wallet address>",
    "amount": 10,
    "asset": "TFT",
    "description": "<memo>"
  }
  ```

- **Delete**

  cmd: `client.stellar.delete`

  payload: `{"name": "<wallet name>"}`

- **Sign**

  cmd: `client.stellar.sign`

  payload:

  ```json
  {
    "name": "<wallet name>",
    "content": "<your message>"
  }
  ```

- **Verify**
  It will verify if the signed content is the same as the original content

  cmd: `client.stellar.verify`

  payload:

  ```json
  {
    "public_key": "<wallet address>",
    "content": "<your message>",
    "signed_content": "<your signed message>"
  }
  ```

### Algorand

- **Create**
  It will create a new account on algorand testnet.

  cmd: `client.algorand.create`

  payload:

  ```json
  {
    "name": "mywallet"
  }
  ```

  return:

  ```json
  {
    "name": "mywallet",
    "public_key": "<wallet address>",
    "mnemonic": "<wallet mnemonic>",
    "blockchain_type": "algorand"
  }
  ```

- **Init**
  It will return the wallet address after importing the wallet and saving it.

  cmd: `client.algorand.init`

  payload:

  ```json
  {
    "name": "mywallet",
    "secret": "<wallet mnemonic>"
  }
  ```

- **Get**
  It will return the wallet.

  cmd: `client.algorand.get`

  payload: `{"name": "<wallet name>"}`

  return:

  ```json
  {
    "name": "<wallet name>",
    "public_key": "<wallet address>",
    "mnemonic": "<wallet mnemonic>",
    "blockchain_type": "algorand"
  }
  ```

- **Exist**

  cmd: `client.algorand.exist`

  payload: `{"name": "<wallet name>"}`

- **List**

  cmd: `client.algorand.list`

  payload: `""`

  return:

  ```json
  [
      {
          "name": "<wallet name>",
          "public_key": "<wallet address>",
          "blockchain_type": "algorand"
      },
      ...
  ]
  ```

- **Assets**
  It will list all the assets in a given wallet

  cmd: `client.algorand.assets`

  payload: `{"name": "<wallet name>"}`

  return:

  ```json
  {
      "name": "<wallet name>",
      "public_key": "<wallet address>",
      "blockchain_type": "algorand",
      "assets":
      [
          {
              "asset": "<wallet asset-id>",
              "amount": "<asset balance>"
          },
          ...
      ]
  }
  ```

- **Assets by address**
  It will list all the assets given a wallet address.

  cmd: `client.algorand.assetsByAddress`

  payload: `{"address": "<wallet address>"}`

  return:

  ```json
  [
      {
          "asset": "<wallet asset-id>",
          "amount": "<asset balance>"
      },
      ...
  ]
  ```

- **Pay**

  cmd: `client.algorand.pay`

  payload:

  ```json
  {
    "name": "<wallet name>",
    "address_dest": "<target wallet address>",
    "amount": 10,
    "description": "<description>"
  }
  ```

- **Delete**

  cmd: `client.algorand.delete`

  payload: `{"name": "<wallet name>"}`

- **Sign**

  cmd: `client.algorand.sign`

  payload:

  ```json
  {
    "name": "<wallet name>",
    "content": "<your message>"
  }
  ```

### TFchain

- **Create**
  It will create a new account on tfchain.

  **Note:** Each network has its own relay. So, the relay would be
  "relay.${network}.grid.tf" in all networks except for main. It would be "relay.grid.tf".

  cmd: `client.tfchain.create`

  payload:

  ```json
  {
    "name": "mywallet",
    "relay": "<relay>"
  }
  ```

  return:

  ```json
  {
    "name": "mywallet",
    "public_key": "<wallet address>",
    "mnemonic": "<wallet mnemonic>",
    "twinId": "<wallet twinId>",
    "blockchain_type": "tfchain"
  }
  ```

- **Init**
  It will return the wallet address after importing the wallet and saving it.

  cmd: `client.tfchain.init`

  payload:

  ```json
  {
    "name": "mywallet",
    "secret": "<wallet secret>"
  }
  ```

- **Get**
  It will return the wallet.

  cmd: `client.tfchain.get`

  payload: `{"name": "<wallet name>"}`

  return:

  ```json
  {
    "name": "<wallet name>",
    "public_key": "<wallet address>",
    "mnemonic": "<wallet mnemonic>",
    "blockchain_type": "tfchain"
  }
  ```

- **Update**
  It will return the new wallet address after updating the wallet and saving it.

  cmd: `client.tfchain.update`

  payload:

  ```json
  {
    "name": "mywallet",
    "secret": "<wallet secret>"
  }
  ```

- **Exist**

  cmd: `client.tfchain.exist`

  payload: `{"name": "<wallet name>"}`

- **List**

  cmd: `client.tfchain.list`

  payload: `""`

  return:

  ```json
  [
      {
          "name": "<wallet name>",
          "public_key": "<wallet address>",
          "blockchain_type": "tfchain"
      },
      ...
  ]
  ```

- **Assets**
  It will list all the assets in a given wallet

  cmd: `client.tfchain.assets`

  payload: `{"name": "<wallet name>"}`

  return:

  ```json
  {
      "name": "<wallet name>",
      "public_key": "<wallet address>",
      "blockchain_type": "tfchain",
      "assets":
      [
          {
              "asset": "TFT",
              "amount": "<free balance>"
          },
          ...
      ]
  }
  ```

- **Balance by address**
  It will list all the assets given a wallet address.

  cmd: `client.tfchain.balance_by_address`

  payload: `{"address": "<wallet address>"}`

  return:

  ```json
  [
      {
          "asset": "TFT",
          "amount": "<free balance>"
      },
      ...
  ]
  ```

- **Pay**

  cmd: `client.tfchain.pay`

  payload:

  ```json
  {
    "name": "<wallet name>",
    "address_dest": "<target wallet address>",
    "amount": 10
  }
  ```

- **Delete**

  cmd: `client.tfchain.delete`

  payload: `{"name": "<wallet name>"}`

- **Sign**

  cmd: `client.tfchain.sign`

  payload:

  ```json
  {
    "name": "<wallet name>",
    "content": "<your message>"
  }
  ```

- **Vote**

  cmd: `client.tfchain.vote`

  payload:

  ```json
  {
    "name": "<wallet name>",
    "address": "<wallet address>",
    "farmId": "<Farm id>",
    "approve": "<approval of vote>",
    "hash": "<hash>"
  }
  ```

### KVSotre

- **Set**

  cmd: `client.kvstore.set`

  payload: `'{"key": "<your key>", "value": "<key's value>"}'`

- **Get**

  cmd: `client.kvstore.get`

  payload: `'{"key": "<your key>"}'`

- **List**

  cmd: `client.kvstore.list`

  payload: `""`

- **Remove**

  cmd: `client.kvstore.remove`

  payload: `'{"key": "<your key>"}'`

### Balance

- **Get My Balance**

  cmd: `client.balance.getMyBalance`

  payload: `""`

- **Get More Funds**

  cmd: `client.balance.getMoreFunds`

  payload: `""`

- **Get**

  cmd: `client.balance.get`

  payload: `'{"address": "<Substrate account address>"}'`

- **Transfer**

  cmd: `client.balance.transfer`

  payload: `'{"address": "<Substrate account address>", "amount": 1}'`

### Capacity Planner

- **Get Farms**

  cmd: `client.capacity.getFarms`

  payload: `'{"page": <page number>, "maxResult": <result count per page>}'`

  > **Note:** page, maxResult are optional with default values page: 1, maxResult: 50

- **Get All Farms**

  cmd: `client.capacity.getAllFarms`

  payload: `""`

- **Get Nodes**

  cmd: `client.capacity.getNodes`

  payload: `'{"page": <page number>, "maxResult": <result count per page>}'`

  > **Note:** page, maxResult are optional with default values page: 1, maxResult: 50

- **Get All Nodes**

  cmd: `client.capacity.getAllNodes`

  payload: `""`

- **Filter Nodes**

  cmd: `client.capacity.filterNodes`

  payload:

  ```json
      {
      "cru": <nodes with free cores>,
      "mru": <nodes with free memory in GB>,
      "sru": <node with free SSD storage in GB>,
      "hru": <nodes with free HDD storage in GB>,
      "publicIPs": <nodes in a farm with free public ips>,
      "accessNodeV4": <nodes with public config for ipv4>,
      "accessNodeV6": <nodes with public config for ipv6>,
      "gateway": <nodes with domain>,
      "farmId": <nodes in a farm with that farmId>,
      "farmName": "<nodes in a farm with that farmId>",
      "country": "<nodes in a specific country>",
      "city": "<nodes in a specific city>"
      }
  ```

  example:

  ```json
  {
    "cru": 2,
    "mru": 4,
    "sru": 40,
    "publicIPs": true,
    "accessNodeV4": false,
    "accessNodeV6": false,
    "gateway": true,
    "farmName": "freefarm"
  }
  ```

  > **Notes:**
  > All filter options are optional.
  > It filters nodes with status(up or down) by default.

- **Filter Farms**

  cmd: `client.capacity.filterNodes`

  payload:

  ```json
      {
     "nodeCRU": <nodes with total cores>,
      "nodeMRU": <nodes with free memory in GB>,
      "nodeSRU": <nodes with free SSD storage in GB>,
      "nodeHRU": <nodes with free HDD storage in GB>,
      "publicIPs": <farms with nodes with free public ips>,
      "certificationType": <certificationType4>,
      "farmName": "<farm name>",
      "country": "<nodes in a specific country>",
      "dedicated": "<dedicated nodes in a farm>",
      "nodeCertified": "<farms that have certified nodes>",
      "nodeHasGPU": "<farms that have nodes with GPU>"
      }
  ```

  > **Notes:**
  > All filter options are optional.

- **Check Farm Has Free Public IPs**

  cmd: `client.capacity.checkFarmHasFreePublicIps`

  payload: `'{"farmId": 1}'`

- **Get Nodes By FarmId**

  cmd: `client.capacity.getNodesByFarmId`

  payload: `'{"farmId": 1}'`

- **Get Node Free Resources**

  cmd: `client.capacity.getNodeFreeResources`

  payload: `'{"nodeId": 7}'`

- **Get FarmId From Farm Name**

  cmd: `client.capacity.getFarmIdFromFarmName`

  payload: `'{"farmName": "freefarm"}'`
