import { convertSpeedToBeaufort } from './weather.helpers';

describe('Weather Helpers', () => {
	describe('convertSpeedToBeaufort', () => {
		it('should convert wind speed to Beaufort scale and description', () => {
			const windSpeed = 15; // Wind speed in km/h

			const result = convertSpeedToBeaufort(windSpeed);
			expect(result).toEqual({ description: 'Schwache Brise', grade: 3 });
		});

		it('should handle wind speed exceeding the Beaufort scale', () => {
			const windSpeed = 150; // Wind speed in km/h

			const result = convertSpeedToBeaufort(windSpeed);
			expect(result).toEqual({ description: 'Orkan', grade: 12 });
		});
	});
});
