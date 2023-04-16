import { Document, OptionalId } from 'mongodb';

export interface CollectionData {
	collectionName: string;
	entries: OptionalId<Document>[];
}
