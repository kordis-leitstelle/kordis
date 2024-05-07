import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { QueryBus } from '@nestjs/cqrs';
import DataLoader from 'dataloader';

import { DataLoaderContainer } from '@kordis/api/shared';
import { GetAlertGroupsByIdsQuery } from '@kordis/api/unit';

import {
	ALERT_GROUPS_DATA_LOADER,
	AlertGroupsDataLoader,
} from './alert-groups.data-loader';

describe('AlertGroupsDataLoader', () => {
	let dataLoaderContainer: DataLoaderContainer;
	let queryBusMock: DeepMocked<QueryBus>;

	beforeEach(() => {
		dataLoaderContainer = new DataLoaderContainer();
		queryBusMock = createMock<QueryBus>();
		new AlertGroupsDataLoader(dataLoaderContainer, queryBusMock);

		jest.spyOn(dataLoaderContainer, 'registerLoadingFunction');
		jest.spyOn(queryBusMock, 'execute');
	});

	it('should be registered in container', async () => {
		const loader = dataLoaderContainer.getFactory(ALERT_GROUPS_DATA_LOADER)();

		expect(loader).toBeInstanceOf(DataLoader);
	});

	it('should load alert group ids', async () => {
		const alertGroupIds = ['id1', 'id2'];
		const loader = dataLoaderContainer.getFactory(ALERT_GROUPS_DATA_LOADER)();
		await loader.loadMany(alertGroupIds);

		expect(queryBusMock.execute).toHaveBeenCalledWith(
			new GetAlertGroupsByIdsQuery(alertGroupIds),
		);
	});
});
