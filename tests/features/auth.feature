Feature: Authentication with Vault

  Background:
    Given I am on the login page

  Scenario: Successful login with admin user from Vault
    When I login as "admin" from Vault
    Then I should be successfully logged in
    And I should see my user profile

  Scenario: Successful login with standard user from Vault
    When I login as "standard-user" from Vault
    Then I should be successfully logged in
    And I should see my user profile

  Scenario: Login with guest user from Vault
    When I login with user "guest"
    Then I should be successfully logged in

