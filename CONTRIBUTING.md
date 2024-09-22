# Contributing to Kordis

We would love for you to contribute to Kordis! This document will help you get
started. We understand that it is a big project to join. Therefore, we encourage
you to get familiar with the project by checking out the [docs](./docs/).

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

- [`docs`](docs) - Markdown files for technical documentation including
  architecture decision records.
- [`tools`](tools) - Scripts for development, as well as DB migrations scripts.
  Also custom NX generators are in here.
- [`apps`](apps) - The main applications of Kordis, API (the backend) and SPA
  (the frontend), as well as the E2E project for SPA. These projects are
  buildable and compose the libraries.
- [`libs`](libs) - The libraries of Kordis. These are the building blocks of the
  applications. They are not buildable on their own. Libs are split by project
  and in their project by domain (e.g. `api/operation`). The `shared` library is
  used by all projects and contains shared models or code.

## Architecture

Kordis is an Event Driven System with
[Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
and [Domain Driven Design](https://en.wikipedia.org/wiki/Domain-driven_design)
principles in mind. We have
[Architecture Decision Records](https://adr.github.io/) for every major project
decision we make. The best way to get to know our architecture is to check the
documents in the [`docs`](docs) folders and to look at the code and structure of
one of our feature modules (i.e.
[`libs/api/organization`](libs/api/organization).

## Development

You need the usual tools: Docker, Node, NPM, Git and an IDE of your choice. We
use [NVM](https://github.com/nvm-sh/nvm) to manage Node versions, simply run
`nvm use` in the root of the project to use the correct Node and NPM version.
There are other tools such as [n](https://github.com/tj/n) that work with
`.npmrc`. Of course, this is optional if you want to maintain the Node version
by yourself. To setup MongoDB as a Database, you can use the
`./tools/db/kordis-db` script. For more Information about how to use this
script, how to setup a test db and database migrations, checkout the
[Database Readme](./tools/db/README.md). Commits should follow the
[Conventional Commit Guidelines](https://www.conventionalcommits.org/en/v1.0.0/).
This is being enforced by a pre-commit hook and also checked in our Pipelines!

### SPA

Please use the NX CLI just like you would use the Angular CLI. For example, to
generate a new component, run
`npx nx g @nrwl/angular:component --project=spa-<lib> --name=<component name>`.
This will generate a new component in the correct folder. For more information,
check out the [NX documentation]https://nx.dev/more-concepts/nx-and-angular). By
default the Component will be standalone and with `OnPush` Change Detection. Please
try to stick to this as much as possible. You can serve the SPA with `npm run serve:spa`.
Instead of an OAuth Provider, in development environments you will get redirected
to a login page where you can choose a persona. This will set a JWT in the local
storage.

We agreed on supporting only Chromium based browsers with their 2 latest major
versions. This allows us to use features that are available for these browsers
regardless of their support in other browsers. Therefore, please use Chrome or
Edge for development.

### API

The API is a NestJS application serving a GraphQL API. Please use the NX CLI to
generate files. You can simply run` nx g <lib,controller,service...>`. Make sure
to use the `@nrwl/nest` generator and **not** the NestJS schematics! For more
information, check out the
[NX documentation for NestJS](https://nx.dev/packages/nest). For more
information about the folder and code structure please also read the
[architecture documentation](docs/architecture.md).

Before you can run the API application, you need to create a .env file from the
[.env.example](apps/api/.env.template) file. There you have to specify the
MongoDB connection URI and more configurations. You can ignore some values as
they are only used in production (they have a comment to clarify this). If you
want to test the API directly without the SPA, you can use one of the
[dev tokens](apps/api/dev-tokens.md) for different personas, that can be used as
a Bearer Token for requests.

To serve the API run `npm run serve:api`.

## Test

We aim for a test coverage above 80%. Please write unit tests and E2E tests for
any user-facing changes.

For testing we use Jest project wide. For Angular, we also use
[spectator](https://github.com/ngneat/spectator), which has a lot of convenient
helpers. For E2Es we use
[Playwright](https://playwright.dev/docs/writing-tests). The best way to start
with testing is to look at existing tests and adapt from them.

**Run tests for API**  
`npx nx test api`

**Run tests for SPA**  
`npx nx test spa`

**Run tests for all apps and libs**  
`npm run test:all`

**Run E2Es**  
`npm run serve:all && npm run e2e`

### E2E Test User

To run E2E tests with a given user, please use one of the predefined users. They
are mirrored 1:1 to our testing infrastructure with our OAuth Provider. You can
find the users [here](apps/api/dev-tokens.md). Simply call `asUser('testuser')`
in your test, and Playwright will automatically set the session token for the
user. Please keep in mind, that tests are run in parallel and you should not
have the same user in multiple tests working on the same scope as this might
produce flaky tests.

## Submitting a PR

Please keep the following in mind when submitting a PR:

- Make sure unit tests pass (`npm run test:all`)
  - Target a specific project with: `nx run proj:test` (i.e.
    `nx run api-organization:test` to target the `api/organization` lib)
  - For more options on running tests - check `npx jest --help` or visit
    [jestjs.io](https://jestjs.io/)
- Make sure e2e tests pass (this can take a while, so you can also let CI check
  those) (`nx run e2e`, make sure to run on a clean DB
  (`./tools/db/kordis-db init e2e-db`))
- Make sure you run `nx format` and `npm run lint:all`
- Make sure that you have a descriptive PR body and a title that fits the
  [Conventional Commit Guidelines](https://www.conventionalcommits.org/en/v1.0.0/),
  as we squash merge PRs

It is possible to receive a deployment preview for your PR. Just ping one of the
maintainers and they can set it up. This is useful for testing the UI in a real
environment and receive feedback.
