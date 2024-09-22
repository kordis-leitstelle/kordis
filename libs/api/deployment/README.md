# API Deployment

Currently we have two types of Deplyoments: a _Rescue Station_ and an
_Operation_. The Rescue Station data holder is this domain, as a Rescue Station
only lives in this domain and has no further purpose, whereas the Operation is a
unique domain. Rescue Stations are managed by the Rescue Station Manager, which
also throw events regarding the rescue stations, as signing in, signing off and
updating contains cross boundary process logic. The commands are exported and
can be called by the managers, as they act as an API.

## Deployment Assignments

A deployment can have an alert group with corresponding units and stand-alone
units assigned. An alert group has default units and current units. At first, an
alert group will always have the default units as current units. The main
purpose of current units is to have a default selection of units whenever the
user selects an alert-group. If a unit was previously assigned to another
deployment, it will be removed from the previous deployment and added to the new
deployment. The logic is handled in the
[`DeploymentAssignmentService`](./src/lib/core/service/deployment-assignment.service.ts).

## Running unit tests

Run `nx test api-deployment` to execute the unit tests via
[Jest](https://jestjs.io).
