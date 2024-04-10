import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection, SessionOperation } from 'mongoose';

export interface MongoUoWSessionProvider {
	session: ClientSession;
}

export const UNIT_OF_WORK_SERVICE = Symbol('UNIT_OF_WORK_SERVICE');

export class UnitOfWork implements MongoUoWSessionProvider, AsyncDisposable {
	constructor(readonly session: ClientSession) {}

	async commit(): Promise<void> {
		await this.session.commitTransaction();
	}

	async rollback(): Promise<void> {
		await this.session.abortTransaction();
	}

	async [Symbol.asyncDispose](): Promise<void> {
		await this.session.endSession();
	}
}

export interface UnitOfWorkService {
	startUnitOfWork(): Promise<UnitOfWork>;

	asTransaction(
		work: (uow: UnitOfWork) => Promise<void>,
		retries?: number,
	): Promise<void>;
}

@Injectable()
export class UnitOfWorkServiceImpl implements UnitOfWorkService {
	constructor(@InjectConnection() private readonly connection: Connection) {}

	async startUnitOfWork(): Promise<UnitOfWork> {
		const session = await this.connection.startSession();

		return new UnitOfWork(session);
	}

	/**
	 * Executes the provided work and attempts to commit it. If it fails, it will rollback and retry the work up to the specified number of times.
	 * @param work The work to be done in the transaction, usually a series of repository operations. Receives an instance of UnitOfWork with current active DB session to provide to repositories.
	 * @param retries Number of retries to attempt if the transaction fails (error is thrown)
	 */
	async asTransaction(
		work: (uow: UnitOfWork) => Promise<void>,
		retries = 0,
	): Promise<void> {
		await using uow = await this.startUnitOfWork();

		let tries = 0;
		do {
			uow.session.startTransaction();
			try {
				await work(uow);

				await uow.commit();

				break;
			} catch (e) {
				await uow.rollback();
				if (tries++ >= retries) {
					throw e;
				}
			}
		} while (tries !== 0 && tries < retries);
	}
}

export function runDbOperation<T = void>(
	op: SessionOperation & { exec: () => Promise<T> },
	uow?: UnitOfWork,
): Promise<T> {
	if (uow) {
		op.session(uow.session);
	}

	return op.exec();
}
