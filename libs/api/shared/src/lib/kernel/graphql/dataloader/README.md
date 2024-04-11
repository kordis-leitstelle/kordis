By utilizing the [DataLoader](https://github.com/graphql/dataloader) pattern, we
can reduce the number of queries made to the database by batching them together.
This is especially useful when we have a list of IDs that we want to fetch from
the database. Instead of making a query for each ID, we can batch them together
and make a single query to fetch all the data we need. This is also known as the
n+1 problem. One specific use case would be if you have stored ids of some
external entity in one domain and you want to provide the complete object, you
have have to query the external entity for each id. With the dataloader you can
batch the ids and query the external entities all in one request (e.g. see
[deployment](../../../../../../deployment) domain).

## Usage

Register a new DataLoader in the `DataLoaderContainer` by registering a new
provider, that will register a DataLoader factory with the logic to batch-load
the data:

```typescript
export const SOME_PROPERTY_LOADER_KEY = Symbol('SOME_PROPERTY_LOADER_KEY');

@Injectable()
export class SomePropertyDataLoader {
	constructor(loaderContainer: DataLoaderContainer, bus: QueryBus) {
		loaderContainer.registerLoadingFunction(
			SOME_PROPERTY_LOADER_KEY,
			async (somePropertyIds: readonly string[]) =>
				bus.execute(new GetSomePropertiesByIdsQuery(somePropertyIds as string[])),
		);
	}
}

```

The `DataLoaderContextProvider` is provided in every request context. You can
use it as follows:

```typescript

@Resolver(() => YourType)
export class DeploymentAlertGroupResolver {
	@ResolveField()
	async someField(
		@Parent() { someProperty }: YourType,
		@Context()
			{ loadersProvider }: { loadersProvider: DataLoaderContextProvider },
	): Promise<SomePropertyType> {
		const loader = loadersProvider.getLoader<string, SomePropertyType>(
			SOME_PROPERTY_LOADER_KEY,
		);
		return loader.load(someProperty.id); // will resolve once the batch is ready
	}
}

```
