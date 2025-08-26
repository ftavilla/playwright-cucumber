Feature: User Registration

  Scenario: Successful registration
    Given I open the registration form
    When I register with valid user data
    Then I should see a registration confirmation with the user's full name
