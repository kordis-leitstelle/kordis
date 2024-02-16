# Radio Communication System

This module covers the radio communication currently via tetra control. The
`TetraControlService` can send Call Outs, SDS and Status changes. Also, a
webhook handler for incoming status changes is implemented.

The configuraton for Tetra (credentials for sending and receiving data, and the
API URL of the Tetra server) are stored in the database per tenant. When the
incoming webhook is called, Kordis retrieves the Tetra settings by the provided
API key. The webhook for incoming requests is
`<kordis-api-url>/webhooks/tetra-control?key=<safe-key>`.

Upon receiving a new status change, a `NewTetraStatusEvent` is emitted.

## Running unit tests

Run `nx test api-tetra` to execute the unit tests via [Jest](https://jestjs.io).
