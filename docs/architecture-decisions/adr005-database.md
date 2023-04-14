# ADR005: Database Selection - MongoDB

## Status

accepted

## Context

We are in the process of selecting a suitable database for the project. In
general, we need for a database that allows for fast development and changes,
integrates well with the NestJS framework and is cost-efficient without a vendor
lock-in (possibility to self-host).

## Decision

We have chosen MongoDB as primary database.

**Fast Development and Changes:** MongoDB's schemaless nature allows for rapid
development and changes without the need to define a fixed schema upfront. This
flexibility enables us to iterate quickly and adapt to changing requirements.

**Azure CosmosDB with MongoDB Adapter**: The availability of Azure CosmosDB with
the MongoDB adapter provides a convenient way to use cloud resources with the
option to easily opt out if needed. This aligns with the goal of leveraging the
available Azure credits and taking advantage of cloud-based features such as
managed backups.

**NestJS Integration**: MongoDB has first-tier support in the NestJS framework,
which means it is well-integrated and supported out of the box. This simplifies
the development process and reduces the effort required for integration.

**Widely Spread Database**: MongoDB is a popular NoSQL database with a large
community, which makes it easy to find resources and contribute to the project.

## Consequences

Next to positive factors already pointed out above, it might be complex to model
our data in a way that we have the complete safety of a Relational Database.
Even though MongoDB offers ACID transactions, this is not the "NoSQL way" of
managing related data. The possible consequence is, that we have to often
migrate our database, since it takes time to get into the mental model of NoSQL.
Furthermore, the danger of Azure CosmosDB not providing the latest features of
MongoDB is also given. The danger of having non-compliant queries is given, but
rare since Azure CosmosDB widely supports most of the MongoDB specifications.
