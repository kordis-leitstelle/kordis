import { TestBed } from '@angular/core/testing';

import { InvolvementOperationTimeState } from './involvement-operation-time.state';

describe('InvolvementOperationTimeState', () => {
	let service: InvolvementOperationTimeState;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [InvolvementOperationTimeState],
		});
		service = TestBed.inject(InvolvementOperationTimeState);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should set and get operation time', () => {
		const start = new Date('2023-01-01T00:00:00Z');
		const end = new Date('2023-01-02T00:00:00Z');
		service.setOperationTime(start, end);

		expect(service.operationStart).toEqual(start);
		expect(service.operationEnd).toEqual(end);
	});

	it('should throw error if operation time is not set', () => {
		expect(() => service.operationStart).toThrow('Operation time not set');
		expect(() => service.operationEnd).toThrow('Operation time not set');
	});

	it('should handle null end date', () => {
		const start = new Date('2023-01-01T00:00:00Z');
		service.setOperationTime(start, null);

		expect(service.operationStart).toEqual(start);
		expect(service.operationEnd).toBeNull();
	});
});
