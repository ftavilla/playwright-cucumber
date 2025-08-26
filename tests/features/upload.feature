Feature: File Upload

  Scenario: Upload a file successfully
    Given I am on the upload page
    When I upload a file named "sample.txt"
    Then I should see the uploaded file name displayed
