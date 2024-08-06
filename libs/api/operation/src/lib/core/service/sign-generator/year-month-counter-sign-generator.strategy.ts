import { Inject, Injectable } from '@nestjs/common';

import { DbSessionProvider } from '@kordis/api/shared';

import {
	OPERATION_REPOSITORY,
	OperationRepository,
} from '../../repository/operation.repository';
import { SignGenerator } from './sign-generator.strategy';


@Injectable()
export class YearMonthCounterSignGenerator implements SignGenerator {
	constructor(
		@Inject(OPERATION_REPOSITORY)
		private readonly repository: OperationRepository,
	) {}

	/**
	 * Generate the operation sign based on: <year>/<month>/<counter>
	 */
	async generateNextOperationSign(
		orgId: string,
		uow?: DbSessionProvider,
	): Promise<string> {
		const latestSign = await this.repository.findLatestOperationSign(
			orgId,
			uow,
		);

		let counter = 1;
		const now = new Date();
		const counterPrefix = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;

		if (latestSign && latestSign.startsWith(counterPrefix)) {
			counter = Number(latestSign.split('/')[2]) + 1;
		}

		return `${counterPrefix}/${String(counter).padStart(3, '0')}`;
	}
}
