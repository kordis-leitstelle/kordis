import { createMock } from '@golevelup/ts-jest';
import { ClientSession, Model } from 'mongoose';

import {
	DbSessionProvider,
	UNIT_OF_WORK_SERVICE,
	UnitOfWorkService,
} from '@kordis/api/shared';

// we need to mock the uow service until jest v30 (https://github.com/jestjs/jest/issues/14874)
export function uowMockProvider() {
	return {
		provide: UNIT_OF_WORK_SERVICE,
		useValue: createMock<UnitOfWorkService>({
			asTransaction(
				work: (uow: DbSessionProvider) => Promise<void>,
			): Promise<void> {
				return work({ session: createMock<ClientSession>() });
			},
		}),
	};
}

export function mockModelMethodResult(
	model: Model<any>,
	document: Record<string, any> | null,
	method: 'findById' | 'findOne' | 'findOneAndUpdate',
) {
	const spy = jest.spyOn(model, method as any);

	spy.mockReturnThis().mockReturnValue({
		exec: jest.fn().mockReturnValue({
			...document,
			toObject: jest.fn().mockReturnValue(document),
		}),
		populate: jest.fn().mockReturnThis(),
		lean: jest.fn().mockReturnValue({
			...document,
			toObject: jest.fn().mockReturnValue(document),
			exec: jest.fn().mockReturnValue(document),
		}),
	} as any);

	return spy;
}

export function mockModelMethodResults(
	model: Model<any>,
	documents: Record<string, any>[],
	method: 'find' | 'aggregate',
) {
	const spy = jest.spyOn(model, method);

	spy.mockReturnThis().mockReturnValue({
		lean: jest.fn().mockReturnValue({
			exec: jest.fn().mockReturnValue(documents),
		}),
		populate: jest.fn().mockReturnThis(),
		exec: jest.fn().mockReturnValue(documents),
	} as any);

	return spy;
}
