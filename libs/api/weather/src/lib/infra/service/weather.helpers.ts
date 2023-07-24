const BEAUFORT_SCALE = Object.freeze([
	{ grade: 0, description: 'Windstille', limit: 1 },
	{ grade: 1, description: 'Leiser Zug', limit: 6 },
	{ grade: 2, description: 'Leichte Brise', limit: 12 },
	{
		grade: 3,
		description: 'Schwache Brise',
		limit: 20,
	},
	{ grade: 4, description: 'Mäßige Brise', limit: 29 },
	{
		grade: 5,
		description: 'Frische Brise',
		limit: 39,
	},
	{ grade: 6, description: 'Starker Wind', limit: 50 },
	{ grade: 7, description: 'Steifer Wind', limit: 62 },
	{
		grade: 8,
		description: 'Stürmischer Wind',
		limit: 75,
	},
	{ grade: 9, description: 'Sturm', limit: 89 },
	{
		grade: 10,
		description: 'Schwerer Sturm',
		limit: 103,
	},
	{
		grade: 11,
		description: 'Orkanartiger Sturm',
		limit: 118,
	},
	{
		grade: 12,
		description: 'Orkan',
		limit: Infinity,
	},
]);

export function convertSpeedToBeaufort(kmh: number): {
	grade: number;
	description: string;
} {
	// simply iterate over it, binary search would take too much space compared to the static amount of elements we have, also most of the time we probably have a low wind speed
	for (const { limit, grade, description } of BEAUFORT_SCALE) {
		if (kmh < limit) {
			return {
				grade,
				description,
			};
		}
	}

	// should never happen, but keeps the compiler happy
	return {
		grade: BEAUFORT_SCALE[BEAUFORT_SCALE.length - 1].grade,
		description: BEAUFORT_SCALE[BEAUFORT_SCALE.length - 1].description,
	};
}
