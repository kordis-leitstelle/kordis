# Radio Communication System

This module covers the radio communication currently over tetra control. The
TetraControlService can send out Call Outs, SDS and Status changes. Also, a
webhook handler for incoming status changes is implemented. The webhook has to
be configured with a key via `TETRA_CONTROL_WEBHOOK_KEY`, which has to be
provided in Tetra Control
`<kordis-api-url>/webhooks/tetra-control?key=<safe-key>`. With
`TETRA_CONTROL_WEBHOOK_VALID_IPS`, a list of allowed IPs can be provided
(delimited by a comma). If the list is empty, all IPs are allowed. If a new SDS
is received, a `NewTetraStatusEvent` is emitted.

## Running unit tests

Run `nx test api-tetra` to execute the unit tests via [Jest](https://jestjs.io).
