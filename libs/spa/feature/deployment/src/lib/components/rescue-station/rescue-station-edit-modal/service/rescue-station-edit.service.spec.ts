import { TestBed } from '@angular/core/testing';
import { createMock } from '@golevelup/ts-jest';

import { AlertGroup, BaseCreateMessageInput, Unit } from '@kordis/shared/model';
import { GraphqlService } from '@kordis/spa/core/graphql';

import {
	RescueStationData,
	RescueStationEditService,
} from './rescue-station-edit.service';

const RESCUE_STATION_DATA: RescueStationData = Object.freeze({
	rescueStationId: '123',
	strength: { leaders: 1, subLeaders: 2, helpers: 3 },
	note: 'Test Note',
	assignedUnits: [{ id: 'unitId1' } as Unit],
	assignedAlertGroups: [
		{
			alertGroup: { id: 'alertGroupId' } as AlertGroup,
			assignedUnits: [{ id: 'unitId2' } as Unit],
		},
	],
});

const PROTOCOL_MESSAGE_DATA: BaseCreateMessageInput = Object.freeze({
	channel: 'TestChannel',
	sender: {
		name: 'SenderUnit',
		type: 'UNKNOWN_UNIT',
	},
	recipient: {
		id: 'unitId',
		type: 'REGISTERED_UNIT',
	},
});

const EXPECTED_ARGS = Object.freeze({
	rescueStationData: {
		rescueStationId: '123',
		strength: {
			leaders: 1,
			subLeaders: 2,
			helpers: 3,
		},
		note: 'Test Note',
		assignedUnitIds: ['unitId1'],
		assignedAlertGroups: [
			{
				alertGroupId: 'alertGroupId',
				unitIds: ['unitId2'],
			},
		],
	},
	protocolMessageData: {
		sender: {
			name: 'SenderUnit',
			type: 'UNKNOWN_UNIT',
		},
		recipient: {
			id: 'unitId',
			type: 'REGISTERED_UNIT',
		},
		channel: 'TestChannel',
	},
});

describe('RescueStationEditService', () => {
	let service: RescueStationEditService;
	let graphqlServiceMock: jest.Mocked<GraphqlService>;

	beforeEach(() => {
		graphqlServiceMock = createMock<GraphqlService>();

		TestBed.configureTestingModule({
			providers: [
				RescueStationEditService,
				{ provide: GraphqlService, useValue: graphqlServiceMock },
			],
		});

		service = TestBed.inject(RescueStationEditService);
	});

	it('should sign in with correct gql vars', () => {
		service.signIn$(RESCUE_STATION_DATA, PROTOCOL_MESSAGE_DATA).subscribe();

		expect(graphqlServiceMock.mutate$).toHaveBeenCalledWith(
			expect.anything(),
			EXPECTED_ARGS,
		);
	});

	it('should sign off with protocol args', () => {
		service.update$(RESCUE_STATION_DATA, PROTOCOL_MESSAGE_DATA).subscribe();

		expect(graphqlServiceMock.mutate$).toHaveBeenCalledWith(
			expect.anything(),
			EXPECTED_ARGS,
		);
	});

	it('should sign off without protocol args', () => {
		service.update$(RESCUE_STATION_DATA, null).subscribe();

		expect(graphqlServiceMock.mutate$).toHaveBeenCalledWith(expect.anything(), {
			...EXPECTED_ARGS,
			protocolMessageData: null,
		});
	});
});
