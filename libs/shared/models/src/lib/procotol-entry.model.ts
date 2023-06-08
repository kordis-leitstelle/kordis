import { Unit } from './unit.model';

export interface ProtocolEntry {
	sender: Unit;
	receiver: Unit;
	content: string;
	sentAt: Date;
	sentBy: string;
	editHistory: {
		previousContent: string;
		editedBy: string;
		editedAt: Date;
	}[];
}
