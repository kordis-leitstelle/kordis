import { CollectionData } from './collection-data.model';

const collectionData: CollectionData = {
	collectionName: 'warnings',
	entries: [
		{
			sourceId: 'mow.DE-HH-HH-SE033-20230417-33-000',
			sourceVersion: 5,
			sentAt: new Date('2023-04-17T17:56:45.000+0000'),
			sender: 'DE-HH-HH-SE033',
			severity: 'Minor',
			effective: null,
			expires: null,
			title:
				'Warnung vor Kontakt mit Wasser der Bille - Hamburg, Rothenburgsort, Bille bis Mündung in die Elbe',
			description:
				'Vorsorglich warnt die Behörde für Inneres und Sport vor dem Kontakt mit dem Wasser aus dem Bille Kanal, da die Schadstoffanalysen der Wasserproben nach dem Brand in der Billstraße noch nicht abgeschlossen sind. Das Bewässern von Gärten, Baden sowie Angeln sollten in den betroffenen Bereichen vorerst unterlassen werden. Auch Hunde sollten von den Gewässern ferngehalten werden.',
			instruction:
				'Informieren Sie sich in den Medien, zum Beispiel im Lokalradio.',
			affectedLocations: {
				type: 'GeometryCollection',
				geometries: [
					{
						type: 'Polygon',
						coordinates: [
							[
								[10.0323, 53.5371],
								[10.0324, 53.5384],
								[10.0328, 53.5398],
								[10.0334, 53.5411],
								[10.0343, 53.5424],
								[10.0355, 53.5436],
								[10.0369, 53.5447],
								[10.0386, 53.5458],
								[10.0404, 53.5467],
								[10.0424, 53.5476],
								[10.0446, 53.5483],
								[10.047, 53.549],
								[10.0495, 53.5495],
								[10.0521, 53.5499],
								[10.0548, 53.5501],
								[10.0575, 53.5503],
								[10.0603, 53.5502],
								[10.063, 53.5501],
								[10.0658, 53.5498],
								[10.0684, 53.5494],
								[10.071, 53.5489],
								[10.0735, 53.5482],
								[10.0759, 53.5474],
								[10.0781, 53.5465],
								[10.0802, 53.5455],
								[10.0821, 53.5445],
								[10.0837, 53.5433],
								[10.0851, 53.5421],
								[10.0863, 53.5408],
								[10.0873, 53.5395],
								[10.088, 53.5381],
								[10.0884, 53.5368],
								[10.0885, 53.5354],
								[10.0884, 53.534],
								[10.088, 53.5327],
								[10.0873, 53.5314],
								[10.0864, 53.5301],
								[10.0852, 53.5289],
								[10.0838, 53.5277],
								[10.0822, 53.5267],
								[10.0804, 53.5257],
								[10.0783, 53.5249],
								[10.0761, 53.5241],
								[10.0738, 53.5235],
								[10.0713, 53.523],
								[10.0687, 53.5226],
								[10.066, 53.5223],
								[10.0633, 53.5222],
								[10.0605, 53.5222],
								[10.0578, 53.5224],
								[10.055, 53.5226],
								[10.0523, 53.5231],
								[10.0497, 53.5236],
								[10.0472, 53.5243],
								[10.0449, 53.525],
								[10.0426, 53.5259],
								[10.0406, 53.5269],
								[10.0387, 53.528],
								[10.0371, 53.5291],
								[10.0356, 53.5304],
								[10.0344, 53.5316],
								[10.0335, 53.533],
								[10.0328, 53.5343],
								[10.0324, 53.5357],
								[10.0323, 53.5371],
							],
						],
					},
				],
			},
		},
	],
};

export default collectionData;
