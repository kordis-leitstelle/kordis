// TODO: Move protocol models into shared location?

export type ProtocolEntryProducer = {
	type: 'user';
	userId: string;
	firstName: string;
	lastName: string;
};
export type Unit =
	| {
			type: 'registered';
			id: string;
			name: string;
	  }
	| {
			type: 'unregistered';
			name: string;
	  };
export type ProtocolEntryPayload = {
	type: 'RADIO_CALL_MESSAGE';
	message: string;
};
export type ProtocolEntry = {
	id: string;
	sender: Unit;
	recipient?: Unit;
	time: Date;
	payload: ProtocolEntryPayload;
	producer: ProtocolEntryProducer;
	channel?: string;
};
