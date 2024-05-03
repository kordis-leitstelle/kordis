# API Deployment

Currently we have two types of Deplyoments: a _Rescue Station_ and an
_Operation_. The Rescue Station data holder is this domain, as a Rescue Station
only lives in this domain and has no further purpose, whereas the Operation is a
unique domain. Rescue Stations are managed by the Rescue Station Manager, which
also throw events regarding the rescue stations, as signing in, signing off and
updating contains cross boundary process logic. The commands are exported and
can be called by the managers, as they act as an API.

## Running unit tests

Run `nx test api-deployment` to execute the unit tests via
[Jest](https://jestjs.io).
