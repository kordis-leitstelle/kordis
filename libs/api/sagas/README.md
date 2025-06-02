# API Sagas

As Sagas handle cross domain interactions, they are predesignated for having
circular dependencies if they life in the domain module. Thus, we put them into
a dedicated module. Check the
[Saga ADR](../../../docs/architecture-decisions/adr009-sagas-for-reactive-cross-domain-interactions.md)
for more information.
