# API Unit

This library is responsable for units and alert groups. It mainly acts as the
primary data holder for the unit and alert group master data. Furthermore, it
includes a Saga, which converts the `NewTetraStatusEvent` from the Tetra Domain
into a `UpdateUnitStatusCommand`to update the status of a unit.

## Running unit tests

Run `nx test api-unit` to execute the unit tests via [Jest](https://jestjs.io).
