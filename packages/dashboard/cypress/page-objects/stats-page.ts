/// <reference types="cypress"/>

class StatsPage {
  // Navigate to the Statistics Page in the dashboard
  Visit() {
    return cy.visit("/explorer/statistics");
  }

  VerifyStats(divNum, statName) {
    cy.get(".container").find(".items").find("div").eq(divNum).find(".item__data").contains(statName);
  }
}

export default new StatsPage();
