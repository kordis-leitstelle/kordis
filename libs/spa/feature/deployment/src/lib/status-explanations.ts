export const STATUS_EXPLANATIONS: Readonly<Record<number, string>> =
	Object.freeze({
		1: 'Einsatzbereit auf Funk',
		2: 'Einsatzbereit auf Wache',
		3: 'Einsatz übernommen / Anfahrt zum Einsatzort',
		4: 'Ankunft am Einsatzort',
		5: 'Sprechwunsch',
		6: 'Nicht einsatzbereit',
	});
