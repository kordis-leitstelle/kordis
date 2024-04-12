import { createMock } from '@golevelup/ts-jest';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { ClientSession, Connection, SessionOperation } from 'mongoose';

import {
	UnitOfWork,
	UnitOfWorkServiceImpl,
	runDbOperation,
} from './unit-of-work.service';

describe('UnitOfWorkServiceImpl', () => {
	let service: UnitOfWorkServiceImpl;
	let mockSession: ClientSession;
	let mockConnection: Connection;

	beforeEach(async () => {
		mockSession = createMock<ClientSession>();
		mockConnection = createMock<Connection>({
			startSession: jest.fn().mockResolvedValue(mockSession),
		});

		const moduleRef = await Test.createTestingModule({
			providers: [
				UnitOfWorkServiceImpl,
				{ provide: getConnectionToken('Database'), useValue: mockConnection },
			],
		}).compile();

		service = moduleRef.get<UnitOfWorkServiceImpl>(UnitOfWorkServiceImpl);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should start a new unit of work', async () => {
		const unitOfWork = await service.startUnitOfWork();

		expect(unitOfWork.session).toBeDefined();
	});

	// todo: complete this test when https://github.com/jestjs/jest/issues/14874 has been released (v30)
	// eslint-disable-next-line jest/no-commented-out-tests
	/*
	it('should start a new unit of work and end session on disposal', async () => {
			await using unitOfWork = await service.startUnitOfWork();

		expect(unitOfWork).toBeDefined();
		expect(unitOfWork.session).toBe(mockSession);
		expect(mockConnection.startSession).toHaveBeenCalled();
		await unitOfWork[Symbol.asyncDispose]();
		expect(unitOfWork).toBeUndefined();
		expect(mockSession.endSession).toHaveBeenCalled();
	});

	it('should execute and commit work in a transaction', async () => {
		const work = jest.fn().mockResolvedValue(undefined);

		await service.asTransaction(work);
		expect(work).toHaveBeenCalledWith(expect.any(UnitOfWork));
	});

	it('should execute work in a transaction', async () => {
		const work = jest.fn().mockRejectedValueOnce(new Error('Oh no'));

		await expect(service.asTransaction(work)).rejects.toThrow('Oh no');

		expect(work).toHaveBeenCalledWith(expect.any(UnitOfWork));
	});

	it('should rollback failed work', async () => {
		const work = jest.fn().mockResolvedValue(undefined);

		await service.asTransaction(work);

		expect(work).toHaveBeenCalledWith(expect.any(UnitOfWork));
	});
	 */
});

describe('UnitOfWork', () => {
	let unitOfWork: UnitOfWork;
	let mockSession: ClientSession;

	beforeEach(() => {
		mockSession = {
			commitTransaction: jest.fn(),
			abortTransaction: jest.fn(),
			endSession: jest.fn(),
		} as unknown as ClientSession;

		unitOfWork = new UnitOfWork(mockSession);
	});

	it('should commit', async () => {
		await unitOfWork.commit();
		expect(mockSession.commitTransaction).toHaveBeenCalled();
	});

	it('should rollback', async () => {
		await unitOfWork.rollback();
		expect(mockSession.abortTransaction).toHaveBeenCalled();
	});

	it('should end session', async () => {
		await unitOfWork[Symbol.asyncDispose]();
		expect(mockSession.endSession).toHaveBeenCalled();
	});
});

describe('runDbOperation', () => {
	let mockOperation: SessionOperation & { exec: () => Promise<void> };
	let mockSession: ClientSession;

	beforeEach(() => {
		mockOperation = {
			session: jest.fn(),
			exec: jest.fn().mockResolvedValue(undefined),
		};
		mockSession = createMock<ClientSession>();
	});

	it('should execute operation with session if provided', async () => {
		await runDbOperation(mockOperation, { session: mockSession });

		expect(mockOperation.session).toHaveBeenCalledWith(mockSession);
		expect(mockOperation.exec).toHaveBeenCalled();
	});

	it('should execute operation without session if not provided', async () => {
		await runDbOperation(mockOperation);

		expect(mockOperation.session).not.toHaveBeenCalled();
		expect(mockOperation.exec).toHaveBeenCalled();
	});
});
