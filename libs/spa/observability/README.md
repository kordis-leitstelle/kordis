# Observability

This library contains services and components for observability purposes. This
contains health status of the services around Kordis and Kordis itself, as well
as the network status of the SPA and error tracking and tracing. We aggregate
the health of the services via [Instatus](https://kordis.instatus.com/). There,
we have automatic checks for services and the opportunity to schedule
maintenances. There is no communication with the Kordis API to allow
notifications on interruptions with any Kordis Services besides their health
status. Currently, the status will be fetched every 30 seconds. For tracing and
error tracking we use [Sentry](https://kordis-leitstelle.sentry.io/).

## Running unit tests

Run `nx test spa-observability` to execute the unit tests.
