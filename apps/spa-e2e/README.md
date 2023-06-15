# Kordis E2E Tests

For End-to-End testing we use
[Playwright](https://playwright.dev/docs/api/class-playwright). You can run all
Tests with `npm run e2e`. By default, tests are run in headless mode, you can
adjust the [Playwright configuration](./playwright.config.ts) if needed for
local testing. Make sure that you serve the API and the SPA
`npm run serve:all:prod`. If you want to test against an Azure Active Directory
as OAuth Provider, you have to also specify `AADB2C_TEST_USERS` as env variable
with the test users username and password
`[['testusername', 'testpassword'], ...]` (check the
[auth setup](./src/auth.setup.ts) for more information). In this case, the SPA
environment also needs an OAuth configuration. If you leave it empty, it will
run with the Dev Login, which is the default for local dev workstations.

We have a set of test users. Each test can be executed in the context of a user
with the [`asUser(<username>)`](./src/test-users.ts) function. No need to
explicitly log in or out.
