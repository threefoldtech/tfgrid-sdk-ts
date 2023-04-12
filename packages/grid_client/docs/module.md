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
    "wss://relay.${network}.grid.tf" in all networks except for main. It would be "wss://relay.grid.tf".

- **Create**

    cmd: `twinserver.twins.create`

    payload: `'{"relay": "<relay>"}'`

- **Update**

    cmd: `twinserver.twins.update`

    payload: `'{"relay": "<relay>"}'`

- **Get**

    cmd: `twinserver.twins.get`

    payload: `'{"id": <twin id>}'`

- **Get my twin id**

    cmd: `twinserver.twins.get_my_twin_id`

    payload: `""`

- **Get twin id by account id**

    cmd: `twinserver.twins.get_twin_id_by_account_id`

    payload: `'{"public_key": <substrate account id>}'`

- **List**

    cmd: `twinserver.twins.list`

    payload: `""`

- **Delete**

    cmd: `twinserver.twins.delete`

    payload: `'{"id": <twin id>}'`

### Contracts

- **Create Node**

    cmd: `twinserver.contracts.create_node`

    payload: `'{"node_id": "<zos node id>", "hash": "<deployment challenge hash>", "data": "<deployment data>", "public_ip": <number of public IPs>}'`

- **Create Name**

    cmd: `twinserver.contracts.create_name`

    payload: `'{"name": "<contract name>"}'`

- **Get**

    cmd: `twinserver.contracts.get`

    payload: `'{"id": <contract id>}'`

- **Get contract id by node id and hash**

    cmd: `twinserver.contracts.get_contract_id_by_node_id_and_hash`

    payload: `'{"node_id": 1, "hash": <deployment challenge hash>}'`

- **Get node contracts**

    cmd: `twinserver.contracts.get_node_contracts`

    payload: `'{"node_id": 1, "state": <contracts state should be "Created", "Deleted", or "OutOfFunds">}'`

- **Get name contract**

    cmd: `twinserver.contracts.get_name_contract`

    payload: `'{"name": <contract name>}'`

- **Update Node**

    cmd: `twinserver.contracts.update_node`

    payload: `'{"id": <contract id>, "hash": "<deployment challenge hash>", "data": "<deployment data>"}'`

- **Cancel**

    cmd: `twinserver.contracts.cancel`

    payload: `'{"id": <contract id>}'`

- **Create Service Contract**

    cmd: `twinserver.contracts.createServiceContract`

    payload: `'{"serviceAccount": <service account address>, "consumerAccount": <consumer account address>}'`

- **Approve Service Contract**

    cmd: `twinserver.contracts.approveServiceContract`

    payload: `'{"serviceContractId": <service contract id>, "approve": <approval of service contract>}'`

- **Bill Service Contract**

    cmd: `twinserver.contracts.billServiceContract`

    payload: `'{"serviceContractId": <service contract id>, "variableAmount": <bill amount>, "metadata": <metadata>}'`

- **Cancel Service Contract**

    cmd: `twinserver.contracts.cancelServiceContract`

    payload: `'{"serviceContractId": <service contract id>}'`

- **Set Fees of Service Contract**

    cmd: `twinserver.contracts.setFeesServiceContract`

    payload: `'{"serviceContractId": <service contract id>, "baseFee": <base fee of serivce contract>, "variableFee": <variable fee of serivce contract>}'`

- **Set Metadata of Service Contract**

    cmd: `twinserver.contracts.setMetadataServiceContract`

    payload: `'{"serviceContractId": <service contract id>, "metadata": <metadata>}'`

- **Get Service Contract**

    cmd: `twinserver.contracts.getServiceContract`

    payload: `'{"serviceContractId": <service contract id>}'`

### ZOS

- **Deploy**

    cmd: `twinserver.zos.deploy`

    payload: the same as zos deployment without signing with additional parameter `'{"node_id": <zos node id> }'`

    > **Note:** `node_id` will be optional when the grid3_proxy_server is ready to be used.

- **Get deployment**

    cmd: `twinserver.zos.getDeployment`

    payload: `'{"contractId": <your contract id>}'`

### Generic Machines

- **Deploy**

    cmd: `twinserver.machines.deploy`

    payload:

    ```json
    {
            "name": "wed1310t1",
            "network": {
                "ip_range": "10.203.0.0/16",
                "name": "wed159n3"
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
                "cpu": 1,
                "memory": 1024,
                "rootfs_size": 1,
                "flist": "https://hub.grid.tf/tf-official-apps/base:latest.flist",
                "entrypoint": "/sbin/zinit init",
                "env": {
                    "SSH_KEY": "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDmm8OzLt+lTdGaMUwMFcw0P+vr+a/h/UsR//EzzeQsgNtC0bdls4MawVEhb3hNcycEQNd2P/+tXdLC4qcaJ6iABYip4xqqAeY098owGDYhUKYwmnMyo+NwSgpjZs8taOhMxh5XHRI+Ifr4l/GmzbqExS0KVD21PI+4sdiLspbcnVBlg9Eg9enM///zx6rSkulrca/+MnSYHboC5+y4XLYboArD/gpWy3zwIUyxX/1MjJwPeSnd5LFBIWvPGrm3cl+dAtADwTZRkt5Yuet8y5HI73Q5/NSlCdYXMtlsKBLpJu3Ar8nz1QfSQL7dB8pa7/sf/s8wO17rXqWQgZG6JzvZ root@ahmed-Inspiron-3576"
                }
            }],
            "metadata": "",
            "description": ""
        };

    ```

    > **Note:** disk size and rootfs_size in GB, memory in MB, disk name should be different than the machine name

- **List**

    cmd: `twinserver.machines.list`

    payload: `""`

- **Get**

    cmd: `twinserver.machines.get`

    payload: `{"name": "<deployment name>"}`

- **Delete**

    cmd: `twinserver.machines.delete`

    payload: `{"name": "<deployment name>"}`

- **Add machine**

    cmd: `twinserver.machines.add_machine`

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

    cmd: `twinserver.machines.delete_machine`

    payload:

    ```json
    {
            "deployment_name": "wed1310t1",
            "name": "wed1310m2",
        }
    ```

### Kubernetes

single master and multiple workers.

- **Deploy**

    cmd: `twinserver.k8s.deploy`

    payload:

    ```json
    {
            "name": "mon69t5",
            "secret": "hamadaellol",
            "network": {
                    "name": "hamadanet",
                    "ip_range": "10.201.0.0/16"
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
                    "planetary": true
                }
            ],
            "workers": [
                {
                    "name":"worker1" ,
                    "node_id": 2,
                    "cpu": 1,
                    "memory": 1024,
                    "rootfs_size": 1,
                    "disk_size": 15,
                    "public_ip": false,
                    "planetary": true

                }
            ],
            "metadata": "",
            "description": "",
            "ssh_key": "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDmm8OzLt+lTdGaMUwMFcw0P+vr+a/h/UsR//EzzeQsgNtC0bdls4MawVEhb3hNcycEQNd2P/+tXdLC4qcaJ6iABYip4xqqAeY098owGDYhUKYwmnMyo+NwSgpjZs8taOhMxh5XHRI+Ifr4l/GmzbqExS0KVD21PI+4sdiLspbcnVBlg9Eg9enM///zx6rSkulrca/+MnSYHboC5+y4XLYboArD/gpWy3zwIUyxX/1MjJwPeSnd5LFBIWvPGrm3cl+dAtADwTZRkt5Yuet8y5HI73Q5/NSlCdYXMtlsKBLpJu3Ar8nz1QfSQL7dB8pa7/sf/s8wO17rXqWQgZG6JzvZ root@ahmed-Inspiron-3576"
        }
    ```

    > **Note:** disk size and rootfs_size in GB, memory in MB, masters and workers names should be different

- **List**

    cmd: `twinserver.k8s.list`

    payload: `""`

- **Get**

    cmd: `twinserver.k8s.get`

    payload: `{"name": "<deployment name>"}`

- **Delete**

    cmd: `twinserver.k8s.delete`

    payload: `{"name": "<deployment name>"}`

- **Add worker**

    cmd: `twinserver.k8s.add_worker`

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
            "planetary": true
            
        }
    ```

- **Delete worker**

    cmd: `twinserver.k8s.delete_worker`

    payload:

    ```json
    {
            "deployment_name": "sun199t2",
            "name": "sun199t1worker5",
        }
    ```

### zdb

- **Deploy**

    cmd: `twinserver.zdbs.deploy`

    payload:

    ```json
    {
            "name": "hamada",
            "zdbs": [{
                "name": "zdb1",
                "node_id": 3,
                "mode": "seq",
                "disk_size": 10,
                "public": true,
                "password": "hamadaellol",
            }, {
                "name": "zdb2",
                "node_id": 3,
                "mode": "seq",
                "disk_size": 10,
                "public": true,
                "password": "hamadaellol",
            }],
            "metadata": "",
            "description": ""
        }
    ```

    > **Note:** disk size in GB, zdb names should be different

- **List**

    cmd: `twinserver.zdbs.list`

    payload: `""`

- **Get**

    cmd: `twinserver.zdbs.get`

    payload: `{"name": "<deployment name>"}`

- **Delete**

    cmd: `twinserver.zdbs.delete`

    payload: `{"name": "<deployment name>"}`

- **Add zdb**

    cmd: `twinserver.zdbs.add_zdb`

    payload:

    ```json
    {
            "deployment_name": "sun199t1",
            "name": "hamada1",
            "node_id": 2,
            "mode": "seq",
            "disk_size": 10,
            "public": true,
            "password": "hamada12345",

        }
    ```

- **Delete zdb**

    cmd: `twinserver.zdbs.delete_zdb`

    payload:

    ```json
    {
            "deployment_name": "sun199t1",
            "name": "hamada1",
        }
    ```

### QSFS Zdbs

- **Deploy**

    cmd: `twinserver.qsfs_zdbs.deploy`

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

    cmd: `twinserver.qsfs_zdbs.list`

    payload: `""`

- **Get**

    cmd: `twinserver.qsfs_zdbs.get`

    payload: `{"name": "<deployment name>"}`

- **Delete**

    cmd: `twinserver.qsfs_zdbs.delete`

    payload: `{"name": "<deployment name>"}`

### Blockchain

- **Create**
    It will create a new account on the given blockchain type `<stellar, algorand or tfchain>`.

    cmd: `twinserver.blockchain.create`

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

    cmd: `twinserver.blockchain.select`

    payload:

    ```json
    {
        "name": "mywallet",
    }
    ```

- **Init**
    It will return the wallet address after importing the wallet and saving it.

    cmd: `twinserver.blockchain.init`

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

    cmd: `twinserver.blockchain.get`

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

    cmd: `twinserver.blockchain.exist`

    payload: `{"name": "<wallet name>"}`

- **List**

    cmd: `twinserver.blockchain.list`

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

    cmd: `twinserver.blockchain.assets`

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

- **Pay**

    cmd: `twinserver.blockchain.pay`

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

    cmd: `twinserver.blockchain.delete`

    payload: `""`

- **Sign**

    cmd: `twinserver.blockchain.sign`

    payload: `""`

    ```json
    {
        "content": "<your message>"
    }
    ```

### Stellar

- **Create**
    It will create a new account on stellar testnet.

    cmd: `twinserver.stellar.create`

    payload:

    ```json
    {
        "name": "mywallet",
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

    cmd: `twinserver.stellar.init`

    payload:

    ```json
    {
        "name": "mywallet",
        "secret": "<wallet secret>",
    }
    ```

- **Get**
    It will return the wallet.

    cmd: `twinserver.stellar.get`

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

    cmd: `twinserver.stellar.update`

    payload:

    ```json
    {
        "name": "mywallet",
        "secret": "<wallet secret>",
    }
    ```

- **Exist**

    cmd: `twinserver.stellar.exist`

    payload: `{"name": "<wallet name>"}`

- **List**

    cmd: `twinserver.stellar.list`

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

    cmd: `twinserver.stellar.assets`

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
    It will list all the assets given a wallet address.

    cmd: `twinserver.stellar.balance_by_address`

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

    cmd: `twinserver.stellar.pay`

    payload:

    ```json
    {
        "name": "<wallet name>",
        "address_dest": "<target wallet address>",
        "amount": 10,
        "asset": "TFT",
        "description": "<memo>", 
    }
    ```

- **Delete**

    cmd: `twinserver.stellar.delete`

    payload: `{"name": "<wallet name>"}`

- **Sign**

    cmd: `twinserver.stellar.sign`

    payload:

    ```json
    {
        "name": "<wallet name>",
        "content": "<your message>"
    }
    ```

- **Verify**
    It will verify if the signed content is the same as the original content

    cmd: `twinserver.stellar.verify`

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

    cmd: `twinserver.algorand.create`

    payload:

    ```json
    {
        "name": "mywallet",
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

    cmd: `twinserver.algorand.init`

    payload:

    ```json
    {
        "name": "mywallet",
        "secret": "<wallet mnemonic>",
    }
    ```

- **Get**
    It will return the wallet.

    cmd: `twinserver.algorand.get`

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

- **Update**
    It will return the new wallet address after updating the wallet and saving it.

    cmd: `twinserver.algorand.update`

    payload:

    ```json
    {
        "name": "mywallet",
        "secret": "<wallet mnemonic>",
    }
    ```

- **Exist**

    cmd: `twinserver.algorand.exist`

    payload: `{"name": "<wallet name>"}`

- **List**

    cmd: `twinserver.algorand.list`

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

    cmd: `twinserver.algorand.assets`

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

- **Balance by address**
    It will list all the assets given a wallet address.

    cmd: `twinserver.algorand.balance_by_address`

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

    cmd: `twinserver.algorand.pay`

    payload:

    ```json
    {
        "name": "<wallet name>",
        "address_dest": "<target wallet address>",
        "amount": 10,
        "description": "<description>", 
    }
    ```

- **Delete**

    cmd: `twinserver.algorand.delete`

    payload: `{"name": "<wallet name>"}`

- **Sign**

    cmd: `twinserver.algorand.sign`

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
    "wss://relay.${network}.grid.tf" in all networks except for main. It would be "wss://relay.grid.tf".

    cmd: `twinserver.tfchain.create`

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

    cmd: `twinserver.tfchain.init`

    payload:

    ```json
    {
        "name": "mywallet",
        "secret": "<wallet secret>",
    }
    ```

- **Get**
    It will return the wallet.

    cmd: `twinserver.tfchain.get`

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

    cmd: `twinserver.tfchain.update`

    payload:

    ```json
    {
        "name": "mywallet",
        "secret": "<wallet secret>",
    }
    ```

- **Exist**

    cmd: `twinserver.tfchain.exist`

    payload: `{"name": "<wallet name>"}`

- **List**

    cmd: `twinserver.tfchain.list`

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

    cmd: `twinserver.tfchain.assets`

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

    cmd: `twinserver.tfchain.balance_by_address`

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

    cmd: `twinserver.tfchain.pay`

    payload:

    ```json
    {
        "name": "<wallet name>",
        "address_dest": "<target wallet address>",
        "amount": 10,
    }
    ```

- **Delete**

    cmd: `twinserver.tfchain.delete`

    payload: `{"name": "<wallet name>"}`

- **Sign**

    cmd: `twinserver.tfchain.sign`

    payload:

    ```json
    {
        "name": "<wallet name>",
        "content": "<your message>"
    }
    ```

### KVSotre

- **Set**

    cmd: `twinserver.kvstore.set`

    payload: `'{"key": "<your key>", "value": "<key's value>"}'`

- **Get**

    cmd: `twinserver.kvstore.get`

    payload: `'{"key": "<your key>"}'`

- **List**

    cmd: `twinserver.kvstore.list`

    payload: `""`

- **Remove**

    cmd: `twinserver.kvstore.remove`

    payload: `'{"key": "<your key>"}'`

### Balance

- **Get My Balance**

    cmd: `twinserver.balance.getMyBalance`

    payload: `""`

- **Get**

    cmd: `twinserver.balance.get`

    payload: `'{"address": "<Substrate account address>"}'`

- **Transfer**

    cmd: `twinserver.balance.transfer`

    payload: `'{"address": "<Substrate account address>", "amount": 1}'`

### Capacity Planner

- **Get Farms**

    cmd: `twinserver.capacity.getFarms`

    payload: `'{"page": <page number>, "maxResult": <result count per page>}'`

    > **Note:** page, maxResult are optional with default values page: 1, maxResult: 50

- **Get All Farms**

    cmd: `twinserver.capacity.getAllFarms`

    payload: `""`

- **Get Nodes**

    cmd: `twinserver.capacity.getNodes`

    payload: `'{"page": <page number>, "maxResult": <result count per page>}'`

    > **Note:** page, maxResult are optional with default values page: 1, maxResult: 50

- **Get All Nodes**

    cmd: `twinserver.capacity.getAllNodes`

    payload: `""`

- **Filter Nodes**

    cmd: `twinserver.capacity.filterNodes`

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
        "farmName": "freefarm",
        }
    ```

    > **Notes:**
    > All filter options are optional.
    > It filters nodes with status(up or down) by default.

- **Check Farm Has Free Public IPs**

    cmd: `twinserver.capacity.checkFarmHasFreePublicIps`

    payload: `'{"farmId": 1}'`

- **Get Nodes By FarmId**

    cmd: `twinserver.capacity.getNodesByFarmId`

    payload: `'{"farmId": 1}'`

- **Get Node Free Resources**

    cmd: `twinserver.capacity.getNodeFreeResources`

    payload: `'{"nodeId": 7}'`

- **Get FarmId From Farm Name**

    cmd: `twinserver.capacity.getFarmIdFromFarmName`

    payload: `'{"farmName": "freefarm"}'`
