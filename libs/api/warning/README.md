# Warnings

Warnings will be fetched from multiple sources through the NINA API. You can
specify the polling interval in seconds in the Module Configuration
`checkForNewWarningsIntervalSec` which will be set in the
[app.module](../../../apps/api/src/app/app.module.ts) from the
`WARNING_CHECK_INTERVAL_SEC` environment variable. If not specified, warnings
will not be fetched. Each warning will be stored in the DB and be removed if not
present anymore.

Currently, we store: Katwarn, Biwapp, Mowas, DWD, LHP and Police warnings. Check
https://nina.api.bund.dev/ for their API documentation.

## Running unit tests

Run `nx test api-warning` to execute the unit tests via
[Jest](https://jestjs.io).
