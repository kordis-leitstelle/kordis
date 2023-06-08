import { Address, Location } from './location.model';
import { ProtocolEntry } from './procotol-entry.model';
import { Unit } from './unit.model';

export interface Patient {
	firstName: string;
	lastName: string;
	birthdate: Date;
	address: Address;
	whereabouts: string;
	note: string;
}

export interface UnitInvolvement {
	unit: Unit;
	start: Date;
	end?: Date;
}

export interface OperationType {
	name: string;
	amount: number;
	helpedPersons: number;
	dangerousSituations: number;
	dangerForHelper: boolean;
}

export interface Operation {
	id: string;
	sign: string;
	start: Date;
	end?: Date;
	alertedThrough: string;
	leader: string;
	additionalNumber: string;
	operationTypes: OperationType[];
	unitInvolvements: UnitInvolvement[];
	location: Location;
	patients: Patient[];
	protocol: ProtocolEntry[];
	notes: string;
	isArchived: boolean;
}
