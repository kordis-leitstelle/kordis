import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { CommandBus, CqrsModule, EventBus, QueryBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';

import { GeospatialModule } from '@kordis/api/geospatial';
import { GraphQLSubscriptionService } from '@kordis/api/shared';
import { expectIterableNotToHaveNext } from '@kordis/api/test-helpers';

import { NewWarningEvent } from '../../core/event/new-warning.event';
import { Warning } from '../../core/model/warning.model';
import {
	WARNING_SERVICE,
	WarningsService,
} from '../../core/service/warnings.service';
import { WarningsResolver } from './warnings.resolver';

describe('WarningsResolver', () => {
	let resolver: WarningsResolver;
	let warningServiceMock: DeepMocked<WarningsService>;
	let eventBus: EventBus;
	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [GeospatialModule, CqrsModule],
			providers: [
				WarningsResolver,
				{
					provide: WARNING_SERVICE,
					useValue: createMock<WarningsService>(),
				},
				GraphQLSubscriptionService,
			],
		})
			.overrideProvider(CommandBus)
			.useValue(createMock<CommandBus>())
			.overrideProvider(QueryBus)
			.useValue(createMock<QueryBus>())
			.compile();

		resolver = moduleRef.get<WarningsResolver>(WarningsResolver);
		eventBus = moduleRef.get<EventBus>(EventBus);
		warningServiceMock =
			moduleRef.get<DeepMocked<WarningsService>>(WARNING_SERVICE);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should get warnings from warnings service and return them', async () => {
		const lat = 123.45;
		const lon = -67.89;

		const warnings: Warning[] = [
			{
				sourceId: 'example-source-id',
				sourceVersion: 1,
				sentAt: new Date(),
				sender: 'John Doe',
				severity: 'High',
				effective: new Date('2023-07-23T12:00:00Z'),
				expires: new Date('2023-07-25T12:00:00Z'),
				title: 'Example Warning Title',
				description: 'This is an example warning description.',
				instruction: 'Follow safety guidelines.',
				affectedLocations: {
					type: 'GeometryCollection',
					geometries: [],
				},
			},
		];

		warningServiceMock.getWarningsForLocation.mockResolvedValueOnce(warnings);
		await expect(resolver.getWarningsForLocation(lat, lon)).resolves.toEqual(
			warnings,
		);
		expect(warningServiceMock.getWarningsForLocation).toHaveBeenCalledWith(
			lat,
			lon,
		);
	});

	describe('newWarning', () => {
		it('should populate NewWarningEvent for intersecting warning area', async () => {
			const warning = {
				sourceId: 'example-source-id',
				affectedLocations: {
					type: 'GeometryCollection',
					geometries: [
						{
							coordinates: [
								[
									[9.89274256991925, 53.55634839290602],
									[9.89274256991925, 53.49399912810486],
									[10.00638154834931, 53.49399912810486],
									[10.00638154834931, 53.55634839290602],
									[9.89274256991925, 53.55634839290602],
								],
							],
							type: 'Polygon',
						},
					],
				},
			} as Warning;

			const subscriptionIterable = await resolver.newWarning({
				bbox: {
					topLeft: {
						lat: 53.53770015811611,
						lon: 9.939471918132853,
					},
					bottomRight: {
						lat: 53.52884579888217,
						lon: 9.951679512781936,
					},
				},
			});
			eventBus.publish(new NewWarningEvent(warning));

			await expect(subscriptionIterable.next()).resolves.toEqual({
				done: false,
				value: warning,
			});
		});

		it('should not populate NewWarningEvent for out of area warning', async () => {
			const warning = {
				sourceId: 'example-source-id',
				affectedLocations: {
					type: 'GeometryCollection',
					geometries: [
						{
							coordinates: [
								[
									[9.790690981915361, 53.54491440554648],
									[9.790690981915361, 53.51119840168647],
									[9.856565766259337, 53.51119840168647],
									[9.856565766259337, 53.54491440554648],
									[9.790690981915361, 53.54491440554648],
								],
							],
							type: 'Polygon',
						},
					],
				},
			} as Warning;

			const subscriptionIterable = await resolver.newWarning({
				bbox: {
					topLeft: {
						lat: 53.53770015811611,
						lon: 9.939471918132853,
					},
					bottomRight: {
						lat: 53.52884579888217,
						lon: 9.951679512781936,
					},
				},
			});
			eventBus.publish(new NewWarningEvent(warning));

			await expectIterableNotToHaveNext(subscriptionIterable);
		});
	});
});
