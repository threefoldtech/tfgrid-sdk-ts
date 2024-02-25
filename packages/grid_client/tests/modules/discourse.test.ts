import { FilterOptions, generateString, GridClient, MachineModel, MachinesModel, randomChoice } from "../../src";
import { config, getClient } from "../client_loader";
import { bytesToGB, generateInt, getOnlineNode, log, RemoteRun, splitIP } from "../utils";

jest.setTimeout(300000);

let gridClient: GridClient;

beforeAll(async () => {
  return (gridClient = await getClient());
});

//Private IP Regex
const ipRegex = /(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)/;

test("TC - Deploy a discourse", async () => {
  /**********************************************
     test suite: grid3_client_ts (automated)
     test cases: tc -  Deploy a discourse 
     scenario:
        - generate test data/vm config.
        - select a node to deploy the vm on.
        - deploy the discourse solution.
        - assert that the generated data matches
          the deployment details.
        - ssh to the vm and verify that you can
          access it.
        - assert that the environment variables
          were passed successfully to the discourse
    **********************************************/

  //test data
  let cpu = generateint(1, 4);
  let memory = generateint(256, 4096);
  let rootfssize = generateint(2, 5);
  const deploymentname = generatestring(15);
  const networkname = generatestring(15);
  const vmname = generatestring(15);
  const disks = [];
  const publicip = false;
  const iprangeclassa = "10." + generateint(1, 255) + ".0.0/16";
  const iprangeclassb = "172." + generateint(16, 31) + ".0.0/16";
  const iprangeclassc = "192.168.0.0/16";
  const iprange = randomchoice([iprangeclassa, iprangeclassb, iprangeclassc]);
  const metadata = "{'deploymenttype': 'discourse'}";
  const description = "test deploying discourse via ts grid3 client";
  const envvarvalue = generatestring(30);

  //node selection
  let nodes;
  try {
    nodes = await gridclient.capacity.filternodes({
      cru: cpu,
      mru: memory / 1024,
      sru: rootfssize,
      farmid: 1,
      availablefor: await gridclient.twins.get_my_twin_id(),
    } as filteroptions);
  } catch (error) {
    //log the resources that were not found.
    log("a node was not found with the generated resources." + error);
    log("regenerating test data with lower resources....");

    //generate lower resources.
    cpu = generateint(1, cpu);
    memory = generateint(256, memory);
    rootfssize = generateint(2, rootfssize);

    //search for another node with lower resources.
    nodes = await gridclient.capacity.filternodes({
      cru: cpu,
      mru: memory / 1024,
      sru: rootfssize,
      farmid: 1,
      availablefor: await gridclient.twins.get_my_twin_id(),
    } as filteroptions);
  }
  const nodeid = await getonlinenode(nodes);
  if (nodeid == -1) throw new error("no nodes available to complete this test");

  //vm model
  const vms: machinesmodel = {
    name: deploymentname,
    network: {
      name: networkname,
      ip_range: iprange,
    },
    machines: [
      {
        name: vmname,
        node_id: nodeid,
        cpu: cpu,
        memory: memory,
        rootfs_size: rootfssize,
        disks: disks,
        flist: "https://hub.grid.tf/tf-official-apps/forum-docker-v3.1.2.flist",
        entrypoint: "/sbin/zinit init",
        public_ip: publicip,
        planetary: true,
        mycelium: true,
        env: {
          ssh_key: config.ssh_key,
          test_key: envvarvalue,
          DISCOURSE_HOSTNAME: "gent02.dev.grid.tf",
          DISCOURSE_DEVELOPER_EMAILS: "test12@gmail.com",
          DISCOURSE_SMTP_ADDRESS: "",
          DISCOURSE_SMTP_PORT: "",
          DISCOURSE_SMTP_ENABLE_START_TLS: "",
          DISCOURSE_SMTP_USER_NAME: "",
          DISCOURSE_SMTP_PASSWORD: "",
          THREEBOT_PRIVATE_KEY: "",
          FLASK_SECRET_KEY: generateString(6),
        },
        solutionproviderid: null,
      },
    ],
    metadata: metadata,
    description: description,
  };

  const res = await gridclient.machines.deploy(vms);
  log(res);

  //contracts assertions
  expect(res.contracts.created).tohavelength(1);
  expect(res.contracts.updated).tohavelength(0);
  expect(res.contracts.deleted).tohavelength(0);

  const vmslist = await gridclient.machines.list();
  log(vmslist);

  //vm list assertions
  expect(vmslist.length).tobegreaterthanorequal(1);
  expect(vmslist).tocontain(vms.name);

  const result = await gridclient.machines.getobj(vms.name);
  log(result);

  //vm assertions
  expect(result[0].nodeid).tobe(nodeid);
  expect(result[0].status).tobe("ok");
  expect(result[0].flist).tobe(vms.machines[0].flist);
  expect(result[0].entrypoint).tobe(vms.machines[0].entrypoint);
  expect(result[0].mounts).tohavelength(0);
  expect(result[0].interfaces[0]["network"]).tobe(vms.network.name);
  expect(result[0].interfaces[0]["ip"]).tocontain(splitip(vms.network.ip_range));
  expect(result[0].interfaces[0]["ip"]).tomatch(ipregex);
  expect(result[0].capacity["cpu"]).tobe(cpu);
  expect(result[0].capacity["memory"]).tobe(memory);
  expect(result[0].planetary).tobedefined();
  expect(result[0].publicip).tobenull();
  expect(result[0].metadata).tobe(metadata);
  expect(result[0].description).tobe(description);

  const host = result[0].planetary;
  const user = "root";

  //ssh to the created vm
  const ssh = await remoterun(host, user);

  try {
    //verify that the added env var was successfully passed to the vm.
    await ssh.execcommand("cat /proc/1/environ").then(async function (result) {
      log(result.stdout);
      expect(result.stdout).tocontain(envvarvalue);
    });

    //verify zinit services
    await ssh.execcommand("zinit").then(async function (result) {
      log(result.stdout);
      expect(result.stdout).tocontain("discourse: running");
    });
  } finally {
    //disconnect from the machine
    await ssh.dispose();
  }
});
