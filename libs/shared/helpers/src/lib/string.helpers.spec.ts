import { getStringMatches } from './string.helpers';

describe('string.helpers', () => {
	describe('getStringMatches', () => {
		it('should return no match', () => {
			let res = getStringMatches('', '');
			expect(res).toHaveLength(0);

			res = getStringMatches('test', '');
			expect(res).toHaveLength(0);

			res = getStringMatches('', 'test');
			expect(res).toHaveLength(0);

			res = getStringMatches('foo', 'test');
			expect(res).toHaveLength(0);
		});

		it('should return one correct match', () => {
			let res = getStringMatches('foobar', 'foo');
			expect(res).toHaveLength(1);
			expect(res).toEqual([[0, 2]]);

			res = getStringMatches('barfoobar', 'foo');
			expect(res).toHaveLength(1);
			expect(res).toEqual([[3, 5]]);
		});

		it('should return multiple correct matches', () => {
			let res = getStringMatches('foobarfoo', 'foo');
			expect(res).toHaveLength(2);
			expect(res).toEqual([
				[0, 2],
				[6, 8],
			]);

			res = getStringMatches('foo foo', 'foo');
			expect(res).toHaveLength(2);
			expect(res).toEqual([
				[0, 2],
				[4, 6],
			]);
		});
	});
});
