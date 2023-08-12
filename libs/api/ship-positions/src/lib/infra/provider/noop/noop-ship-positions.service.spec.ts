import { NoopShipPositionsService } from './noop-ship-positions.service';

describe('NoopShipPositionsService', () => {
	let service: NoopShipPositionsService;

	beforeEach(() => {
		service = new NoopShipPositionsService();
	});

	it('should return an empty array when calling getAll()', async () => {
		const result = await service.getAll();
		expect(result).toEqual([]);
	});

	it('should return an empty array when calling search()', async () => {
		const result = await service.search();
		expect(result).toEqual([]);
	});

	it('should return an observable when calling getChangeStream$()', () => {
		const result = service.getChangeStream$();
		expect(result).toBeDefined();
		expect(result.subscribe).toBeDefined();
	});
});
