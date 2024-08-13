import { RMB } from "../clients/rmb";
import { TFClient } from "../clients/tf-grid/client";
import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { FarmerBot, FarmerBotFindNodeModel } from "../high_level/farmerbot";
import { Nodes } from "../primitives";
import { pingFarmModel } from "./models";

class Farmerbot {
  client: TFClient;
  nodes: Nodes;
  farmerBot: FarmerBot;
  rmb: RMB;

  /**
   * Class representing a Farmerbot.
   *
   * This class handles operations related to farming bots, such as pinging farms and finding nodes.
   * It interacts with the `TFClient`, `Nodes`, and `RMB` classes to perform these operations.
   *
   * @param {GridClientConfig} config - The configuration object containing necessary settings for the Farmerbot.
   */
  constructor(public config: GridClientConfig) {
    this.client = config.tfclient;
    this.farmerBot = new FarmerBot(this.config);
    this.rmb = new RMB(config.rmbClient);
  }

  /**
   * Asynchronously pings a farm using the provided options.
   *
   * This method delegates the actual farm pinging operation to the underlying FarmerBot instance.
   *
   * @param {pingFarmModel} options - The options object specifying the farm ID to ping.
   * @returns {Promise<any>} A promise that resolves with the result of pinging the farm.
   */
  @expose
  @validateInput
  async pingFarm(options: pingFarmModel): Promise<any> {
    return await this.farmerBot.pingFarm(options);
  }

  /**
   * Asynchronously finds a node based on the provided options.
   *
   * This method delegates the actual node finding operation to the underlying FarmerBot instance.
   *
   * @param {FarmerBotFindNodeModel} options - The options object specifying the criteria for finding a node.
   * @returns {Promise<number>} A promise that resolves with the result of finding the node.
   */
  @expose
  @validateInput
  async findNode(options: FarmerBotFindNodeModel): Promise<number> {
    return await this.farmerBot.findNode(options);
  }
}

export { Farmerbot as farmerbot };
