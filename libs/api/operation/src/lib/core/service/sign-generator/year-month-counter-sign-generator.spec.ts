import { DeepMocked, createMock } from '@golevelup/ts-jest';

import { OperationRepository } from '../../repository/operation.repository';
import { SignGenerator } from './sign-generator.strategy';
import { YearMonthCounterSignGenerator } from './year-month-counter-sign-generator.strategy';

describe('YearMonthCounterSignGenerator', () => {
	jest.useFakeTimers().setSystemTime(new Date('2012-12-21'));
	let signGeneratorStrategy: SignGenerator;
	let repo: DeepMocked<OperationRepository>;
	beforeEach(async () => {
		repo = createMock<OperationRepository>();
		signGeneratorStrategy = new YearMonthCounterSignGenerator(repo);
	});

	it('should create new sign from no existing latest sign', async () => {
		repo.findLatestOperationSign.mockResolvedValueOnce(undefined);
		await expect(
			signGeneratorStrategy.generateNextOperationSign('orgId'),
		).resolves.toEqual(`2012/12/001`);
	});

	describe('should create new sign from existing latest sign', () => {
		test.each([
			// [lastSign, expectedSign]
			['2012/12/003', '2012/12/004'],
			['2012/12/013', '2012/12/014'],
			['2012/12/113', '2012/12/114'],
			['2012/11/420', '2012/12/001'],
			['2012/12/999', '2012/12/1000'],
			['2012/12/1000', '2012/12/1001'],
		])(
			'given last sign from db %p create new sign %p',
			async (lastSign, expectedSign) => {
				repo.findLatestOperationSign.mockResolvedValueOnce(lastSign);
				await expect(
					signGeneratorStrategy.generateNextOperationSign('orgId'),
				).resolves.toEqual(expectedSign);
			},
		);
	});

	it('should set new year on last sign from last year', async () => {
		jest.useFakeTimers().setSystemTime(new Date('2013-01-01'));
		repo.findLatestOperationSign.mockResolvedValueOnce('2012/12/123');
		await expect(
			signGeneratorStrategy.generateNextOperationSign('orgId'),
		).resolves.toEqual(`2013/01/001`);
	});
});
