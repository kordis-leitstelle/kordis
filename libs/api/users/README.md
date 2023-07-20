# Users

This Module contains a Dev User Service for local development, which keeps an
in-memory store of users. In Prod, the AADB2C Service is used, which calls the
Microsoft Graph API.

## Running unit tests

Run `nx test api-users` to execute the unit tests via [Jest](https://jestjs.io).
