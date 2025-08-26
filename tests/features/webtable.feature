Feature: Web Table Entry

  Scenario: Add a new entry to the web table
    Given I open the web table page
    When I add a new user entry
    Then I should see the new entry in the table
