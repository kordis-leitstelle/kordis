# Warnings

Warnings will be fetched from multiple sources through the NINA API. You can
specify the polling rate as a Cron Expression in the Module Configuration
`checkCronExpression` which will be set in the
[app.module](../../../apps/api/src/app/app.module.ts) from the
`WARNING_CHECK_CRON_EXPRESSION` environment variable. If not specified, warnings
will not be fetched. Each warning will be stored in the DB and be removed if not
present anymore.

Currently, we store: Katwarn, Biwapp, Mowas, DWD, LHP and Police warnings.

## Running unit tests

Run `nx test api-warnings` to execute the unit tests via
[Jest](https://jestjs.io).
