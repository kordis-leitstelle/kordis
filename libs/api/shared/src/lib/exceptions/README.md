## Exceptions

Exceptions are divided in _core_ and _presentable_ exceptions. A _core_
exception is an exception that can be thrown in the domain layer. These are
common exceptions that can be thrown in any domain. A _presentable_ exception is
an exception that can be thrown in the _infra_/application layer. These are
exceptions that are likely to reach the client and therefor should only be
thrown from controllers such as GraphQL resolvers. An example of a _presentable_
exception is a `NotFoundException` that can be thrown when a resource is not
found, the Domain would throw a more specific Exception such as
`OperationNotFoundException`. _Presentable_ exception messages have to be in
**German**, while _core_ exceptions can be in English.

In production environments, all errors that are not `PresentableException` will
be converted to `UnknownException`. This is done to prevent leaking information
about the application to the client.
