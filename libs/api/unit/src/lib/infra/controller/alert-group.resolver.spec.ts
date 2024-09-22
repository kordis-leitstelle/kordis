import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { CommandBus, CqrsModule, QueryBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';

import { AuthUser } from '@kordis/shared/model';

import { ResetAlertGroupUnitsCommand } from '../../core/command/reset-alert-group-units.command';
import { UpdateCurrentAlertGroupUnitsCommand } from '../../core/command/update-current-alert-group-units.command';
import { AlertGroupEntity } from '../../core/entity/alert-group.entity';
import { GetAlertGroupByIdQuery } from '../../core/query/get-alert-group-by-id.query';
import { GetAlertGroupsByOrgQuery } from '../../core/query/get-alert-groups-by.org.query';
import { AlertGroupResolver } from './alert-group.resolver';

describe('AlertGroupResolver', () => {
	let alertGroupResolver: AlertGroupResolver;
	let mockQueryBus: DeepMocked<QueryBus>;
	let mockCommandBus: DeepMocked<CommandBus>;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [CqrsModule],
			providers: [AlertGroupResolver],
		})
			.overrideProvider(QueryBus)
			.useValue(createMock())
			.overrideProvider(CommandBus)
			.useValue(createMock())
			.compile();

		alertGroupResolver = moduleRef.get<AlertGroupResolver>(AlertGroupResolver);
		mockQueryBus = moduleRef.get<DeepMocked<QueryBus>>(QueryBus);
		mockCommandBus = moduleRef.get<DeepMocked<CommandBus>>(CommandBus);
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

	it('should return alert group by organization id and alert group id', async () => {
		const mockAlertGroup = new AlertGroupEntity();
		mockAlertGroup.name = 'alertGroup';
		mockQueryBus.execute.mockResolvedValue(mockAlertGroup);

		const result = await alertGroupResolver.alertGroup('id', {
			organizationId: 'orgId',
		} as AuthUser);

		expect(result).toEqual(mockAlertGroup);
		expect(mockQueryBus.execute).toHaveBeenCalledWith(
			new GetAlertGroupByIdQuery('orgId', 'id'),
		);
	});

	it('should set current alert group units', async () => {
		const alertGroupId = 'alertGroupId';
		const unitIds = ['unitId1', 'unitId2'];
		const mockAlertGroup = new AlertGroupEntity();
		mockAlertGroup.name = 'alertGroup';

		mockQueryBus.execute.mockResolvedValue(mockAlertGroup);

		const result = await alertGroupResolver.setCurrentAlertGroupUnits(
			alertGroupId,
			unitIds,
			{ organizationId: 'orgId' } as AuthUser,
		);

		expect(result).toEqual(mockAlertGroup);
		expect(mockCommandBus.execute).toHaveBeenCalledWith(
			new UpdateCurrentAlertGroupUnitsCommand('orgId', alertGroupId, unitIds),
		);
		expect(mockQueryBus.execute).toHaveBeenCalledWith(
			new GetAlertGroupByIdQuery('orgId', alertGroupId),
		);
	});

	it('should reset current alert group units', async () => {
		const mockAlertGroups = [new AlertGroupEntity(), new AlertGroupEntity()];

		mockQueryBus.execute.mockResolvedValue(mockAlertGroups);

		const result = await alertGroupResolver.resetCurrentAlertGroupUnits({
			organizationId: 'orgId',
		} as AuthUser);

		expect(result).toEqual(mockAlertGroups);
		expect(mockCommandBus.execute).toHaveBeenCalledWith(
			new ResetAlertGroupUnitsCommand('orgId'),
		);
		expect(mockQueryBus.execute).toHaveBeenCalledWith(
			new GetAlertGroupsByOrgQuery('orgId'),
		);
	});
});
