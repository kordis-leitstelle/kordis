import { QueryBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';

import { AuthUser } from '@kordis/shared/model';

import { AlertGroupEntity } from '../../core/entity/alert-group.entity';
import { GetAlertGroupsByIdQuery } from '../../core/query/get-alert-groups-by-id.query';
import { GetAlertGroupsByOrgQuery } from '../../core/query/get-alert-groups-by.org.query';
import { AlertGroupResolver } from './alert-group.resolver';

describe('AlertGroupResolver', () => {
	let alertGroupResolver: AlertGroupResolver;
	let mockQueryBus: jest.Mocked<QueryBus>;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				AlertGroupResolver,
				{
					provide: QueryBus,
					useValue: {
						execute: jest.fn(),
					},
				},
			],
		}).compile();

		alertGroupResolver = moduleRef.get<AlertGroupResolver>(AlertGroupResolver);
		mockQueryBus = moduleRef.get<jest.Mocked<QueryBus>>(QueryBus);
	});

	it('should return alert groups by organization id', async () => {
		const alertGroup1 = new AlertGroupEntity();
		alertGroup1.name = 'alertGroup1';
		const alertGroup2 = new AlertGroupEntity();
		alertGroup2.name = 'alertGroup2';
		const mockAlertGroups = [alertGroup1, alertGroup2];

		mockQueryBus.execute.mockResolvedValue(mockAlertGroups);

		const result = await alertGroupResolver.alertGroups({
			organizationId: 'orgId',
		} as AuthUser);

		expect(result).toEqual(mockAlertGroups);
		expect(mockQueryBus.execute).toHaveBeenCalledWith(
			new GetAlertGroupsByOrgQuery('orgId'),
		);
	});

	it('should return alert group by organization id and id', async () => {
		const mockAlertGroup = new AlertGroupEntity();
		mockAlertGroup.name = 'alertGroup';
		mockQueryBus.execute.mockResolvedValue(mockAlertGroup);

		const result = await alertGroupResolver.alertGroup('id', {
			organizationId: 'orgId',
		} as AuthUser);

		expect(result).toEqual(mockAlertGroup);
		expect(mockQueryBus.execute).toHaveBeenCalledWith(
			new GetAlertGroupsByIdQuery('orgId', 'id'),
		);
	});
});
