import { BBox } from '../models/bbox';
import { IsBBox } from './bbox.validator';

describe('BBox Validator', () => {
	const bboxValidator = new IsBBox();
	it('should return true for a valid BBox', () => {
		const bbox = new BBox();
		bbox.topLeft = {
			lat: 53,
			lon: 12,
		};
		bbox.bottomRight = {
			lat: 52,
			lon: 14,
		};

		expect(bboxValidator.validate(bbox)).toBe(true);
	});

	it('should return false for an invalid BBox', () => {
		const bbox = new BBox();

		bbox.topLeft = {
			lat: 52,
			lon: 14,
		};
		bbox.bottomRight = {
			lat: 53,
			lon: 12,
		};

		expect(bboxValidator.validate(bbox)).toBe(false);
	});
});
