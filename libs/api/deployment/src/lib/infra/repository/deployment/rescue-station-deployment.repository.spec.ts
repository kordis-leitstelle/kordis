import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock } from '@golevelup/ts-jest';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';

import { BaseModelProfile } from '@kordis/api/shared';
import { mockModelMethodResults } from '@kordis/api/test-helpers';

import { RescueStationDeploymentEntity } from '../../../core/entity/rescue-station-deployment.entity';
import { RescueStationEntityDTO } from '../../../core/repository/rescue-station-deployment.repository';
import { DeploymentAggregateProfile } from '../../mapper/deployment-aggregate.mapper-profile';
import { DeploymentAssignmentProfile } from '../../mapper/deployment-assignment.mapper-profile';
import {
	RescueStationDeploymentAggregateProfile,
	RescueStationDeploymentValueObjectProfile,
} from '../../mapper/rescue-station-deployment-aggregate.mapper-profile';
import { RescueStationDtoMapperProfile } from '../../mapper/rescue-station-dto.mapper-profile';
import { RescueStationDeploymentDocument } from '../../schema/rescue-station-deployment.schema';
import { RescueStationDeploymentRepositoryImpl } from './rescue-station-deployment.repository';

describe('RescueStationDeploymentRepositoryImpl', () => {
	let repository: RescueStationDeploymentRepositoryImpl;
	let rescueStationDeploymentModel: Model<RescueStationDeploymentDocument>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				AutomapperModule.forRoot({
					strategyInitializer: classes(),
				}),
			],
			providers: [
				RescueStationDeploymentRepositoryImpl,
				BaseModelProfile,
				DeploymentAggregateProfile,
				DeploymentAssignmentProfile,
				RescueStationDeploymentAggregateProfile,
				RescueStationDeploymentValueObjectProfile,
				RescueStationDtoMapperProfile,
				{
					provide: getModelToken(RescueStationDeploymentDocument.name),
					useValue: createMock<Model<RescueStationDeploymentDocument>>(),
				},
			],
		}).compile();

		repository = module.get<RescueStationDeploymentRepositoryImpl>(
			RescueStationDeploymentRepositoryImpl,
		);
		rescueStationDeploymentModel = module.get<
			Model<RescueStationDeploymentDocument>
		>(getModelToken(RescueStationDeploymentDocument.name));
	});

	it('should find station by id', async () => {
		const orgId = 'org1';
		const id = 'id1';
		const mockRescueStation = {
			_id: id,
			orgId,
			referenceId: id,
			defaultUnitIds: ['unitId'],
		};

		mockModelMethodResults(
			rescueStationDeploymentModel,
			[mockRescueStation],
			'aggregate',
		);

		const result = await repository.findById(orgId, id);
		expect(result).toBeInstanceOf(RescueStationDeploymentEntity);
		expect(result.id).toBe(id);
		expect(result.orgId).toBe(orgId);
		expect(result.defaultUnits).toEqual([{ id: 'unitId' }]);
	});

	it('should find deployments by org id', async () => {
		const mockDeployments = [
			{
				_id: 'id1',
				orgId: 'orgId',
				referenceId: 'id1',
				defaultUnitIds: ['unitId1'],
			},
			{
				_id: 'id2',
				orgId: 'orgId',
				referenceId: 'id2',
				defaultUnitIds: ['unitId2'],
			},
		];

		mockModelMethodResults(
			rescueStationDeploymentModel,
			mockDeployments,
			'aggregate',
		);

		const result = await repository.findByOrgId('orgId');

		expect(result[0]).toBeInstanceOf(RescueStationDeploymentEntity);
		expect(result[0].id).toBe('id1');
		expect(result[0].orgId).toBe('orgId');
		expect(result[0].defaultUnits).toEqual([{ id: 'unitId1' }]);
		expect(result[1]).toBeInstanceOf(RescueStationDeploymentEntity);
		expect(result[1].id).toBe('id2');
		expect(result[1].orgId).toBe('orgId');
		expect(result[1].defaultUnits).toEqual([{ id: 'unitId2' }]);
	});

	it('should update one deployment', async () => {
		const orgId = 'org1';
		const id = 'id1';
		const data = new RescueStationEntityDTO();
		data.note = 'note';

		await repository.updateOne(orgId, id, data);

		expect(rescueStationDeploymentModel.updateOne).toHaveBeenCalledWith(
			{ orgId, _id: id },
			{ $set: data },
		);
	});

	it('should update all deployments', async () => {
		const orgId = 'org1';

		await repository.updateAll(orgId, {
			note: 'note',
		});

		expect(rescueStationDeploymentModel.updateMany).toHaveBeenCalledWith(
			{ orgId },
			{
				$set: {
					note: 'note',
				},
			},
		);
	});
});
