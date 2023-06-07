# Architecture

This document introduces the general architecture of Kordis with a focus on the
API. In general, we want to follow the Clean Architecture Principle, which tries
to achieve a state where:

1. we are independent of frameworks,
2. we ensure testability of our business logic,
3. we are independent of UI logic,
4. we are independent of the database and its access,
5. we are independent of external dependencies.

Since architecture is a lot about trade-offs, not every point mentioned above
might be wise to follow in a project. The main goal is to have a solid
separation of concerns. Every change should only have an isolated impact, and
since Kordis is a System that will definitely grow over time with more features
and external dependencies to join as components, it is a requirement to allow
the system to be easily extendable and maintainable by multiple people.

We aggregate the layers of the clean architecture approach in 2 layers, the
**Core** and the **Infrastructure** layer, which tries to achieve a solid
separation of concerns and a clear dependency direction, but also maintains a
good balance between the effort of maintaining the architecture and the value it
provides.

**Core** (core)  
Contains the business logic, entities, events and domain exceptions. Everything
in here is something business relevant, that should not be touched and
influenced by changes not related to the business logic, such as changes to the
Database or the Framework. Therefore, the layer should not have any dependency
on other layers or components from outside its scope. This ensures that we can
easily test the logic and that we can change the infrastructure without having
to change the business logic. Nevertheless, we made some tradeoffs in the core
layer. We allow the use of NestJS framework specific CQRS Handler Annotations,
Class Validator Annotations and Annotations in the Entity Model for GraphQL
Input and Argument Models. This is due to the fact, that maintaining another
layer on top of these decorators would be pure overhead, that would
overcomplicate the codebase and does not outweigh the value of simpler changes
in the infrastructure layer. Also, maintaining Input Models for GraphQL that
share the same structure as the entity model would also not benefit the
complexity of the codebase. Therefore, we decided to allow these annotations in
the core layer, if they are unlikely to change on the Input/Argument side of the
GraphQL API and the structure is equal.

**Infrastructure** (infra)  
The infrastructure layer defines every external component the system interacts
with. It provides concert implementations such as the repositories (data
access), logging, external APIs, etc. The idea behind this is that all
dependencies point towards the Core Layer. At no time should the core layer be
based on any concrete implementation, framework or other specification. This
ensures that we are flexible with changes in our infrastructure and we allow our
domain to define what interfaces it requires. This should also result in easier
testing. The best example is the repository, where the core layer defines which
data it needs and the infrastructure layer implements this interface and hides
all the concrete database logic.

## CQRS

tbd by @JSPRH

Some resources used for this architecture are:

- https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- Clean Architecture: A Craftsman's Guide to Software Structure and Design
  (Robert C. Martin Series)
- https://github.com/jasontaylordev/CleanArchitecture
- https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures#clean-architecture
