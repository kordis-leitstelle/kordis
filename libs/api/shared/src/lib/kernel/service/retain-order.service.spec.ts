import { RetainOrderService } from './retain-order.service';

describe('RetainOrderMutator', () => {
	const mutator = new RetainOrderService();

	it('should retain id order if enabled in options', () => {
		const result = mutator.retainOrderIfEnabled(
			{ retainOrder: true },
			['1', '2'],
			[{ id: '2' }, { id: '1' }],
		);

		expect(result).toEqual([{ id: '1' }, { id: '2' }]);
	});

	it('should not retain id order if disabled in options', () => {
		const result = mutator.retainOrderIfEnabled(
			{ retainOrder: false },
			['1', '2'],
			[{ id: '2' }, { id: '1' }],
		);

		expect(result).toEqual([{ id: '2' }, { id: '1' }]);
	});

	it('should sort by id order', () => {
		const result = mutator.sortByIdOrder(
			['1', '2'],
			[{ id: '2' }, { id: '1' }],
		);

		expect(result).toEqual([{ id: '1' }, { id: '2' }]);
	});

	it('should throw error on missing entity', () => {
		expect(() => mutator.sortByIdOrder(['1', '2'], [{ id: '1' }])).toThrow(
			'Missing entities for ids: 2',
		);
	});
});
