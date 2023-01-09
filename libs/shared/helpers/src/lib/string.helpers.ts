export function getStringMatches(
	term: string,
	searchable: string,
): [number, number][] {
	const matches: [number, number][] = [];

	if (term && searchable) {
		const re = new RegExp(`${searchable}`, 'g');
		let match;
		while ((match = re.exec(term)) != null) {
			const endIndex = match.index + match[0].length - 1;
			matches.push([match.index, endIndex]);
		}
	}

	return matches;
}
