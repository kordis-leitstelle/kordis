import { relayStylePagination } from '@apollo/client/utilities';

import { cache } from '@kordis/spa/core/graphql';

cache.policies.addTypePolicies({
	Query: {
		fields: {
			protocolEntries: relayStylePagination(),
		},
	},
});

cache.policies.addTypePolicies({
	CommunicationMessage: {
		fields: {
			time: {
				read(time: string) {
					return new Date(time);
				},
			},
			createdAt: {
				read(time: string) {
					return new Date(time);
				},
			},
			editedAt: {
				read(time: string) {
					return new Date(time);
				},
			},
		},
	},
	RescueStationSignOnMessage: {
		fields: {
			time: {
				read(time: string) {
					return new Date(time);
				},
			},
			createdAt: {
				read(time: string) {
					return new Date(time);
				},
			},
			editedAt: {
				read(time: string) {
					return new Date(time);
				},
			},
		},
	},
	RescueStationUpdateMessage: {
		fields: {
			time: {
				read(time: string) {
					return new Date(time);
				},
			},
			createdAt: {
				read(time: string) {
					return new Date(time);
				},
			},
			editedAt: {
				read(time: string) {
					return new Date(time);
				},
			},
		},
	},
	RescueStationSignOffMessage: {
		fields: {
			time: {
				read(time: string) {
					return new Date(time);
				},
			},
			createdAt: {
				read(time: string) {
					return new Date(time);
				},
			},
			editedAt: {
				read(time: string) {
					return new Date(time);
				},
			},
		},
	},
});
