/// <reference types="cypress"/>

import statsPage from "../page-objects/stats-page";
import utils from "../utils/utils";

describe("TF Grid Dashboard", function () {
  this.beforeEach(function () {
    statsPage.Visit();
  });

  it("Verify Statistics", function () {
    /**************************************************
        Test Suite: TF Grid Dashboard
        Test Cases: TC823 - Verify Statistics
        Scenario:
            - Verify the values appearing in the statistics
            page from the grid proxy
        **************************************************/

    cy.request({
      method: "GET",
      url: "https://gridproxy.dev.grid.tf/stats?status=up",
    }).then(res => {
      //Get the stats from the grid_proxy
      const nodesOnline = JSON.stringify(res.body.nodes);
      const farms = JSON.stringify(res.body.farms);
      const countries = JSON.stringify(res.body.countries);
      const totalCru = JSON.stringify(res.body.totalCru);
      const totalHru = utils.formatBytes(JSON.stringify(res.body.totalHru));
      const totalSru = utils.formatBytes(JSON.stringify(res.body.totalSru));
      const totalMru = utils.formatBytes(JSON.stringify(res.body.totalMru));
      const accessNodes = JSON.stringify(res.body.accessNodes);
      const gateways = JSON.stringify(res.body.gateways);
      const twins = JSON.stringify(res.body.twins);
      const publicIps = JSON.stringify(res.body.publicIps);
      const contracts = JSON.stringify(res.body.contracts);

      //Verify the values appearing in the statisticspage from the grid proxy
      statsPage.VerifyStats(1, nodesOnline);
      statsPage.VerifyStats(3, farms);
      statsPage.VerifyStats(6, countries);
      statsPage.VerifyStats(9, totalCru);
      statsPage.VerifyStats(12, totalSru);
      statsPage.VerifyStats(15, totalHru);
      statsPage.VerifyStats(18, totalMru);
      statsPage.VerifyStats(21, accessNodes);
      statsPage.VerifyStats(24, gateways);
      statsPage.VerifyStats(27, twins);
      statsPage.VerifyStats(30, publicIps);
      statsPage.VerifyStats(33, contracts);
    });
  });
});
