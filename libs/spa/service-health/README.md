# Service Health

This library contains services and components for displaying the health of the
services around Kordis and Kordis itself, as well as the network status of the
SPA. Currently, we aggregate the health of the services via
[Instatus](https://kordis.instatus.com/). There, we have automatic checks for
services and the opportunity to schedule maintenances. There is no communication
with the Kordis API to allow notifications on interruptions with any Kordis
Services besides their health status. Currently, the status will be fetched
every 30 seconds.

## Running unit tests

Run `nx test spa-service-health` to execute the unit tests.
