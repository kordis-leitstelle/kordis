import { Types } from 'mongoose';

type OptionalId<T> = T & { _id?: Types.ObjectId };

export interface CollectionData<T extends object = any> {
	collectionName: string;
	entries: OptionalId<T>[];
}

/**
 * Returns the entry by field.
 * IMPROTANT: Make sure the field used to identify the element is unique!
 */
export const getEntryByFieldFunction = <
	EntryType extends CollectionType['entries'][number],
	CollectionType extends CollectionData<any>,
	IdField extends keyof EntryType,
>(
	collection: CollectionType,
	idField: IdField,
) => ({
	entityFunction: <IdFieldValue extends EntryType[IdField]>(
		idFieldValue: IdFieldValue,
	) =>
		collection.entries.find(
			(entry) => entry[idField] === idFieldValue,
		) as Extract<EntryType, Record<IdField, IdFieldValue>>,
	entityIdFunction: <IdFieldValue extends EntryType[IdField]>(
		idFieldValue: IdFieldValue,
	) =>
		collection.entries
			.find((entry) => entry[idField] === idFieldValue)
			._id.toString() as string,
});
