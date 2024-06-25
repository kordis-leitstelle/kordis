export interface RetainOrderOptions {
	retainOrder: boolean;
}

export class RetainOrderService {
	public retainOrderIfEnabled<T extends { id: string }>(
		{ retainOrder }: RetainOrderOptions,
		ids: string[],
		entities: T[],
	): T[] {
		if (retainOrder) {
			return this.sortByIdOrder(ids, entities);
		}
		return entities;
	}

	public sortByIdOrder<T extends { id: string }>(
		ids: string[],
		entities: T[],
	): T[] {
		const orderedUnits = ids.map((id) =>
			entities.find((unit) => unit.id === id),
		);
		this.assertNoMissingEntities(ids, orderedUnits);
		return orderedUnits;
	}

	private assertNoMissingEntities<T extends { id: string }>(
		ids: string[],
		entities: (T | undefined)[],
	): asserts entities is T[] {
		if (entities.includes(undefined)) {
			const missingIds = ids.filter(
				(id) => entities.find((entity) => entity?.id === id) === undefined,
			);
			throw new Error(`Missing entities for ids: ${missingIds.join(',')}`);
		}
	}
}
