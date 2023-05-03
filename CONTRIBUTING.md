# Contributing to Kordis

We would love for you to contribute to Kordis! This document will help you get
started. We understand that it is a big project to join. Therefor we have weekly
developer meetings, **Sundays at 8pm (German Timezone)**. You can join via
[Google Meet](https://meet.google.com/tqc-mccd-pur) or via
[phone](https://meet.google.com/tel/tqc-mccd-pur?pin=5845379842628&hs=7).

**Please understand, that the language for this project is English. The program
itself is in German language.**

We mark issues with
[`help-needed`](https://github.com/kordis-leitstelle/kordis/issues?q=is:open%20no:assignee%20label:help-needed)
if we think it is a good issue for external contributors. We are also happy for
contributions towards a higher test-coverage, better documentation or code
quality.

## Project Structure

Before you jump into the project, we highly encourage you to get to know the
basics of the [mental model of NX](https://nx.dev/concepts/mental-model) as this
is a monorepo and a lot of the things run through NX.

Source code and documentation are included in the top-level folders listed
below.

- `docs` - Markdown files for technical documentation including architecture
  decision records.
- `tools` - Scripts for development, as well as DB migrations scripts. Also
  custom NX generators are in here.
- `apps` - The main applications of Kordis, API (the backend) and SPA (the
  frontend), as well as the E2E project for SPA. These projects are buildable
  and use the libraries.
- `libs` - The libraries of Kordis. These are the building blocks of the
  applications. They are not buildable on their own. Libs are split by project
  and in their project by domain (e.g. `api/operation`). The `shared` library is
  used by all projects and contains shared models or code.

## Development Setup

You need the usual tools: Docker, Node, NPM, Git and an IDE of your choice. We
use NVM to manage Node versions, simply run `nvm use` in the root of the project
to use the correct Node and NPM version. To setup MongoDB as a Database, you can
use the `./tools/db/kordis-db` script. For more Information about how to use
this script, how to setup a test db and database migrations, checkout the
[Database Readme](./tools/db/README.md).

## Architecture

Kordis is an Event Driven System with
[Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
and [Domain Driven Design](https://en.wikipedia.org/wiki/Domain-driven_design)
principles in mind. If you are new to this, read about it
[here](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html).
We have [Architecture Decision Records](https://adr.github.io/) for every major
project decision we make. The best way to get to know our architecture is to
check the documents in the `docs` folders and to look at the code of one of our
feature modules (i.e. `lib/api/operation`).

## Development

### SPA

Please use the NX CLI just like you would use the Angular CLI. For example, to
generate a new component, run
`npx nx g @nrwl/angular:component --project=spa-<lib> --name=<component name>`.
This will generate a new component in the correct folder. For more information,
check out the [NX documentation]https://nx.dev/more-concepts/nx-and-angular). By
default the Component will be standalone and with `OnPush` Change Detection.
Please try to stick to this as much as possible.

### API

## Test

We aim for a test coverage above 80%. Please write unit tests and E2E tests for
any user-facing changes.

For testing we use Jest project wide. For Angular, we also use
[spectator](https://github.com/ngneat/spectator), which has a lot of convenient
helpers. For E2Es we use Playwright. The best way to start with testing is to
look at the existing tests and adapt from them.

**Run tests for API**  
`npx nx test api`

**Run tests for SPA**  
`npx nx test spa`

**Run tests for all apps and libs**  
`npm run test:all`

**Run E2Es**  
`npm run e2e` or when API and SPA are already up: `npx nx e2e spa`

## Submitting a PR

Please follow the following guidelines:

- Make sure unit tests pass (`nx affected --target=test`)
  - Target a specific project with: `nx run proj:test` (i.e.
    `nx run api-operations:test` to target the `api/operations` lib)
  - For more options on running tests - check `npx jest --help` or visit
    [jestjs.io](https://jestjs.io/)
- Make sure e2e tests pass (this can take a while, so you can always let CI
  check those) (`nx run e2e`, make sure to run on a clean DB
  (`./tools/db/kordis-db init e2e-db`))
- Make sure you run `nx format` and `npm run lint:all`
