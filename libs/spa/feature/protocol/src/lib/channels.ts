// temp until we have a proper backend for managing this kind of data
export const CHANNELS = Object.freeze([
	{
		value: 'D',
		label: 'Digital',
		default: true,
	},
	{
		value: 'T',
		label: 'Telefon',
		default: false,
	},
	{
		value: '1',
		label: 'DLRG-Kanal 1',
		default: false,
	},
	{
		value: '2',
		label: 'DLRG-Kanal 2',
		default: false,
	},
	{
		value: '3',
		label: 'DLRG-Kanal 3',
		default: false,
	},
]);

export const DEFAULT_CHANNEL =
	CHANNELS.find((channel) => channel.default)?.value ?? '';
