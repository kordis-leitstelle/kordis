import { ProtocolEntry, Unit } from '@kordis/spa/feature/protocol';

// TODO: Remove mock data and replace by backend data

const getRandomDateLast7Days = (): Date => {
	const date = new Date();
	const daySeconds = 24 * 60 * 60 * 1000;
	date.setTime(date.getTime() - Math.random() * 7 * daySeconds);
	return date;
};

const getRandomChannel = (): string => {
	const channels = ['D', '1', '2', '3', 'T'];
	return channels[Math.floor(Math.random() * channels.length)];
};

const getRandomFirstName = (): string => {
	const firstNames = [
		'John',
		'Jane',
		'Mary',
		'James',
		'Emily',
		'Jacob',
		'Sophia',
		'Michael',
		'Olivia',
		'Ethan',
	];
	return firstNames[Math.floor(Math.random() * firstNames.length)];
};

const getRandomLastName = (): string => {
	const lastNames = [
		'Smith',
		'Johnson',
		'Williams',
		'Brown',
		'Jones',
		'Miller',
		'Davis',
		'Garcia',
		'Rodriguez',
		'Wilson',
	];
	return lastNames[Math.floor(Math.random() * lastNames.length)];
};

const getRandomRegisteredUnit = (): Unit => {
	const unitNames = [
		'HH 10/21',
		'HH 10/22',
		'HH 10/23',
		'HH 10/51',
		'HH 10/52',
		'HH 10/53',
		'HH 10/71',
		'HH 10/72',
		'HH 10/93',
		'HH 10/95',
		'HH 10/99',
		'HH 11/21',
		'HH 11/22',
		'HH 11/23',
		'HH 11/24',
		'HH 11/51',
		'HH 16/31',
		'HH 13/31',
		'HH 12/21',
		'HH 12/22',
		'HH 12/23',
		'HH 12/24',
		'HH 12/25',
		'HH 12/26',
		'HH 12/42',
		'HH 12/44',
		'HH 12/51',
		'HH 12/53',
		'HH 12/93',
		'HH 12/94',
		'HH 13/0',
		'HH 13/41',
		'HH 13/42',
		'HH 13/51',
		'HH 13/52',
		'HH 13/53',
		'HH 13/99',
		'HH 16/0',
		'HH 16/21',
		'HH 16/22',
		'HH 16/23',
		'HH 16/42',
		'HH 16/51',
		'HH 17/21',
		'HH 17/22',
		'HH 17/23',
		'HH 17/41',
		'HH 17/42',
		'HH 17/51',
		'HH 17/99',
		'HH 18/41',
		'HH 18/42',
		'HH 18/52',
		'HH 18/53',
		'HH 18/55',
		'HH 18/61',
		'HH 18/62',
		'HH 18/63',
		'HH 18/64',
		'HH 18/65',
		'HH 18/02',
		'HH 18/21',
		'HH 18/22',
		'HH 18/23',
		'HH 18/43',
		'HH 18/54',
		'HH 18/58',
		'HH 18/71',
		'HH 10/55',
		'HH 18/56',
		'HH 18/57',
		'HH 18/66',
		'HH 13/43',
		'HH 10/41',
		'HH 16/43',
		'HH 12/41',
		'HH 12/52',
		'HH 10/54',
		'HH 10/24',
		'HH 12/27',
		'HH 10/73',
		'HH 10/74',
		'HH 13/44',
		'HH 10/25',
		'HH 11/25',
		'HH 11/26',
		'HH 11/27',
		'HH 11/28',
		'HH 11/29',
		'HH 17/52',
		'HH 17/31',
		'HH 17/43',
		'HH 17/0',
		'HH 12/43',
		'HH 12/54',
		'HH 13/22',
		'HH 13/24',
		'HH 13/25',
		'HH 13/26',
		'HH 13/27',
		'HH 13/28',
		'HH 19/21',
		'HH 19/22',
		'HH 19/23',
		'HH 19/24',
		'HH 19/25',
		'HH 19/26',
		'HH 19/27',
		'HH 19/28',
		'HH 19/29',
		'HH 19/93',
		'HH 19/98',
		'HH 19/99',
		'HH 12/55',
		'HH 13/54',
	];

	return {
		type: 'registered',
		name: unitNames[Math.floor(Math.random() * unitNames.length)],
		id: `id-${Math.random()}`,
	};
};

const generateCommPair = (): Pick<ProtocolEntry, 'sender' | 'recipient'> => {
	const units = [
		Math.random() < 0.75
			? getRandomRegisteredUnit()
			: ({
					name: `RandU ${Math.round(Math.random() * 1000)}`,
					type: 'unregistered',
				} as const),
		{ name: 'HH 10/0', id: 'hh100', type: 'registered' },
	] as const;
	return Math.random() < 0.5
		? { sender: units[0], recipient: units[1] }
		: { sender: units[1], recipient: units[0] };
};

export const ProtocolMockData: ProtocolEntry[] = Array.from(
	{ length: 30 },
	(_, i) => {
		const payload = {
			payload: {
				type: 'RADIO_CALL_MESSAGE',
				message: `Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et ${i}`,
			},
			...generateCommPair(),
			producer: {
				type: 'user',
				userId: `userId-${i}`,
				firstName: getRandomFirstName(),
				lastName: getRandomLastName(),
			},
			channel: getRandomChannel(),
		} as const;

		return {
			id: `id-${i}`,
			time: getRandomDateLast7Days(),
			...payload,
		};
	},
);
