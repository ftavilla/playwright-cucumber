# Playwright Project Architecture with Cucumber and Clean Architecture

## Introduction

This project uses **Playwright** for user interface (UI) testing and **Cucumber** for defining behavioral scenarios in a **BDD (Behavior-Driven Development)** format. It is based on the **Clean Architecture** principle, which ensures a clear separation of concerns and a modular code structure, facilitating maintenance, scalability, and testability.

## Architecture Objectives

The goal of this architecture is to ensure a clear and flexible structure that allows for easy addition of new features while maintaining a good separation of responsibilities. It also enables better test management by keeping business logic, tests, and UI interactions independent from each other.

Tests are written using Cucumber, which defines behavioral scenarios (in `.feature` files), while Playwright is used to interact with the user interface (UI).

## Project Structure

The project architecture is organized as follows:

```
tests/
├── features/
│   ├── upload.feature
│   ├── registration.feature
│   └── webtable.feature
├── steps/
│   ├── upload.steps.ts
│   ├── registration.steps.ts
│   └── webtable.steps.ts
src/
├── domain/
│   └── usecases/
├── application/
│   └── use-cases/
├── infrastructure/
│   └── playwright/
│       ├── pages/
│       │   ├── UploadPage.ts
│       │   ├── RegistrationPage.ts
│       │   ├── WebTablePage.ts
│       └── browser.ts
└── support/
    ├── hooks.ts
    └── world.ts
```

### Details of Each Directory

* **tests/features**: This directory contains the Cucumber feature files that describe the expected behavior of the application as scenarios in natural language. These files use Gherkin syntax and are used to describe the behavior of the application from the user's perspective.

* **tests/steps**: This directory contains the step definitions corresponding to the scenarios in the feature files. The steps are implemented in TypeScript and contain the logic for interacting with the application via Playwright. They invoke use cases to perform specific actions required by each scenario.

* **src/domain**: This directory contains the entities and core use cases that encapsulate business logic. For example, a use case for registration or login. These use cases are invoked in the test steps to perform business actions.

* **src/application/use-cases**: This directory contains application-specific use case implementations, such as adding an entry to a table or uploading a file.

* **src/infrastructure/playwright/pages**: This directory contains classes that represent the application's pages. Each page is defined as a Page Object in Playwright. This centralizes the logic for interacting with the pages of the application, making it easier to maintain and modify.

* **src/support/hooks.ts and src/support/world.ts**: These files contain Cucumber hooks and an instance of **CustomWorld**. **CustomWorld** helps manage the application state during tests and provides methods like `getUseCase` to retrieve use cases during the execution of test steps.

## A Scenario Can Have Multiple Use Cases

In the proposed architecture, a **test scenario** (defined in a `.feature` Cucumber file) can involve multiple distinct business actions. Each action is encapsulated within a **use case**, which represents a unit of work related to the business logic of the application. The idea behind this organization is that each action performed by the user within a scenario can be mapped to one or more use cases, enabling a modular and reusable test structure.

### 1. **Definition of a Use Case**

A **use case** in this architecture is an abstraction of the business logic, typically represented by a class containing an `execute` method. Each use case represents a specific process or action in the application.

### 2. **Why a Scenario Can Have Multiple Use Cases**

A scenario may have multiple use cases because a feature or use case in the application may require several steps or actions that correspond to different units of work. For example, in a **user registration** scenario, there may be several actions to perform, each corresponding to a specific use case.

Consider a **"Create a user and verify its presence in the table"** test scenario. This scenario may involve:

1. **A Registration Use Case**: The user fills out a registration form, triggering the registration process.
2. **A Verification Use Case**: After the user is registered, it must be verified that the user's information appears in a list or table on the interface.

These two steps can be encapsulated into two different use cases, but they are executed within the same scenario to ensure that the application behaves as expected.

### 3. **How This Fits into the Architecture**

When a scenario is executed, each step (as defined in the Cucumber `.feature` files) calls one or more use cases through the **`CustomWorld`** instance. Using multiple use cases within the same scenario can be very straightforward:

1. **Scenario Definition**:
   The scenario in a `.feature` file might look like this:

   ```gherkin
   Scenario: Successful registration
    Given I open the registration form
    When I register with valid user data
    Then I should see a registration confirmation with the user's full name
   ```

2. **Step Implementations**:
   In the step definitions file (`steps.ts`), each scenario step may invoke a distinct use case:

   ```typescript
   import {Given, Then, When} from '@cucumber/cucumber';
   import {CustomWorld} from '../../src/support/world';
   import {REGISTER_USE_CASE_TOKEN, RegisterUseCase} from '../../src/application/use-cases/registration/RegisterUseCase';
   import {VerifyRegistrationUseCase} from '../../src/application/use-cases/registration/VerifyRegistrationUseCase';
   import {expect} from "@playwright/test";
   
   Given('I open the registration form', async function (this: CustomWorld) {
    this.setUseCase(REGISTER_USE_CASE_TOKEN, new RegisterUseCase(this.page));
   });
   
   When('I register with valid user data', async function (this: CustomWorld) {
    const registerUseCase = this.getUseCase<RegisterUseCase>(REGISTER_USE_CASE_TOKEN);
   
    await registerUseCase.execute({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        gender: 'Male',
        mobile: '1234567890',
        });
    });
   
   Then('I should see a registration confirmation with the user\'s full name', async function (this: CustomWorld) {
    const verifyUseCase = new VerifyRegistrationUseCase(this.page);
    const registeredUser = await verifyUseCase.execute();
    expect(registeredUser).toContain('John Doe');
   });

   ```

   Here, we have two use cases within the same scenario:

    * **`RegisterUseCase`**: Handles the registration of the new user.
    * **`VerifyUserInTableUseCase`**: Verifies if the user appears in a table on the user list page.

#### 4. **Managing Use Cases via `CustomWorld`**

Use cases are managed and injected into the scenario context via **`CustomWorld`**. For example, during scenario execution, each step can retrieve the appropriate use case using the **`this.getUseCase<UseCaseType>('key')`** method.

* **`setUseCase`**: Stores a use case in the map based on its key.
* **`getUseCase`**: Retrieves a stored use case for use in the next step.

This allows each test to retrieve exactly the use cases it needs while maintaining a clear separation of concerns.

### Benefits of Using Multiple Use Cases in a Scenario

* **Modularity**: Each action is encapsulated in its own dedicated use case, making tests cleaner and easier to maintain.
* **Reusability**: Use cases are independent of tests, allowing the same business logic to be reused across different scenarios.
* **Flexibility**: You can add new use cases without affecting existing tests, making it easier to extend tests to new features.

The ability to use multiple **use cases** in a single **scenario** provides maximum flexibility while maintaining clear separation of concerns. It allows tests to be organized in a modular, reusable, and scalable way, while keeping business logic independent from the tests themselves.

## Advantages of This Architecture

1. **Separation of Concerns**:

    * Business logic is kept separate from UI code, meaning that changes to the UI have minimal impact on tests.

2. **Test Flexibility**:

    * Use cases are decoupled from tests, which makes them reusable across different scenarios. The `CustomWorld` allows for dynamic assignment of use cases during test execution.

3. **Maintainability**:

    * With the use of the Page Object Model and separation of concerns, updates to the UI or business logic require minimal changes to tests.

4. **Clear and Readable Tests**:

    * Using Cucumber and Gherkin ensures that tests are readable and understandable, even for non-technical stakeholders.

5. **Scalable**:

    * This architecture is easy to scale. New features can be added as new use cases without disrupting existing tests or UI logic.

## Disadvantages of This Architecture

1. **Initial Setup Complexity**:

    * The initial setup for this architecture can be complex. You need to define use cases, page objects, and test contexts, which can take additional time compared to simpler approaches.

2. **UI Coupling**:

    * Although business logic is decoupled, UI interactions are still tied to the page objects. Significant UI changes may require updates to page objects and use cases.


## Conclusion

This architecture provides a robust, flexible, and scalable approach to BDD testing. By separating business logic, UI interactions, and test setup, it ensures that the test suite remains maintainable and adaptable to changes. The `CustomWorld` enables flexible use case management, improving test organization and reusability. While the initial setup may be more complex, the long-term benefits in terms of maintainability, scalability, and test clarity are significant.

